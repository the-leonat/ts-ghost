// Runs one step of the drift workflow, `pnpm drift <step>`.

import { execFile, spawn } from "node:child_process";
import { appendFile, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import {
  GHOST_LATEST_FILE,
  GHOST_VERSIONS_FILE,
  ghostVersion,
  setPin,
  unsupportedGhost,
} from "../ghost/versions.ts";
import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { measureCoverage } from "../route-coverage/coverage.ts";
import { errorAnnotation, stepOutputs } from "./github-actions.ts";
import { closeDriftPr, openDriftPr } from "./open-pr.ts";
import { planDrift, resolveNewestGhost, type GhostRelease } from "./plan.ts";
import {
  clientResources,
  diffManifests,
  DRIFT_BRANCH,
  mergeReports,
  renderPinChangeset,
  renderPrBody,
  renderPrTitle,
  suiteNotRun,
  summariseSuite,
  verdictErrors,
  type VitestJsonReport,
} from "./pr-body.ts";

// Steps of .github/workflows/conformance-drift.yml: plan → (pnpm manifest) → client → suite → body → verdict,
// then `pr` in a job with write access. State passes between steps and jobs in DRIFT_STATE.
const PACKAGE_DIR = fileURLToPath(new URL("../..", import.meta.url));
const STATE = resolve(process.env.DRIFT_STATE ?? join(PACKAGE_DIR, ".drift"));
const file = (name: string) => join(STATE, name);
/** The packages a pin bump can break, by report: tests may name the pin, and the bump moves core-api's GHOST_LATEST. */
const UNIT_TESTS = {
  "client.json": PACKAGE_DIR,
  "client-core-api.json": join(PACKAGE_DIR, "../ts-ghost-core-api"),
  "client-admin-api.json": join(PACKAGE_DIR, "../ts-ghost-admin-api"),
};
/** One fixed name, so each run replaces it and pending bumps never pile up. */
const PIN_CHANGESET_FILE = fileURLToPath(new URL("../../../../.changeset/ghost-pin.md", import.meta.url));
/** Set by the workflow from the manifest step's outcome; a failed generation leaves the old manifest. */
const manifestFailed = () => process.env.MANIFEST_OUTCOME === "failure";
type SavedPlan = { bump: boolean; from: string; to: string; releases: GhostRelease[] };

const steps: Record<string, () => Promise<number>> = {
  /** Resolves the newest Ghost; on a bump, rewrites the pin and GHOST_LATEST and keeps the old manifest for the diff. */
  async plan() {
    await mkdir(STATE, { recursive: true });
    const pin = ghostVersion();
    const newest = await resolveNewestGhost({
      pin,
      target: process.env.GHOST_TARGET || undefined,
      githubToken: process.env.GITHUB_TOKEN || undefined,
    });
    const plan = planDrift(pin, newest.version);
    await writeFile(file("plan.json"), JSON.stringify({ ...plan, releases: newest.releases }, null, 2));
    await output({ bump: String(plan.bump), from: plan.from, to: plan.to });
    if (!plan.bump) {
      console.log(`Newest Ghost ${plan.to} is not ahead of the pin ${pin}; nothing to do.`);
      return 0;
    }
    await copyFile(MANIFEST_FILE, file("manifest.before.json"));
    setPin(plan.to, newest.digest);
    console.log(`Pin bumped ${plan.from} → ${plan.to}; releases since the pin: ${newest.releases.length}`);
    return 0;
  },

  /** Runs the live suite's pin leg (latest) against the bumped pin, keeping its JSON report; compat runs on the PR's CI. */
  async suite() {
    const unsupported = unsupportedGhost(ghostVersion());
    if (unsupported) {
      report(`${unsupported} Not running the live suite.`);
      return 1;
    }
    return vitest("suite.json", ["-c", "./vitest.config.live.ts"], { GHOST_LEG: "pin" });
  },

  /** Runs the Docker-free unit tests, incl. the client → manifest check, against the new pin. */
  async client() {
    const codes = [];
    for (const [name, dir] of Object.entries(UNIT_TESTS))
      codes.push(await vitest(name, ["--typecheck"], {}, dir));
    return Math.max(...codes);
  },

  /** Renders the PR title and body; also shows the body as the run's job summary. */
  async body() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const before = parseManifest(await readFile(file("manifest.before.json"), "utf8"));
    const after = parseManifest(await readFile(MANIFEST_FILE, "utf8"));
    const suite = await liveSuite(plan);
    const client = await unitTests();
    // Imported here: it needs Vite, and the pr job runs this file without dependencies.
    const { recordSourceClientCalls } = await import("../client-routes/record-from-source.ts");
    // The bumped pin's latest client, as the client check ran it.
    const calls = await recordSourceClientCalls("latest");
    const coverage = [before, ...(manifestFailed() ? [] : [after])].map((m) => measureCoverage(m, calls));
    const { GITHUB_SERVER_URL: server, GITHUB_REPOSITORY: repo, GITHUB_RUN_ID: runId } = process.env;
    const runUrl = server && repo && runId ? `${server}/${repo}/actions/runs/${runId}` : undefined;
    const body = renderPrBody({
      plan,
      releases: plan.releases,
      diff: diffManifests(before, after),
      suite,
      client,
      resources: clientResources(calls),
      coverage,
      manifestFailed: manifestFailed(),
      runUrl,
      repoUrl: server && repo ? `${server}/${repo}` : undefined,
    });
    await writeFile(file("pr-title.txt"), renderPrTitle(plan, suite, client, manifestFailed()));
    await writeFile(file("pr-body.md"), body);
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, body);
    console.log(`Wrote ${file("pr-body.md")}`);
    return 0;
  },

  /** On a bump, commits the pin and manifest to the drift branch and opens or updates its PR; else closes it. */
  async pr() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const base = process.env.DRIFT_BASE || "main";
    const exec = promisify(execFile);
    const run = async (cmd: string, args: string[]) => (await exec(cmd, args, { cwd: PACKAGE_DIR })).stdout;
    if (!plan.bump) {
      const comment = `The pin on \`${base}\` is already Ghost ${plan.from}; the newest release with an official image is ${plan.to}.`;
      const closed = await closeDriftPr({ branch: DRIFT_BRANCH, base, comment }, run);
      console.log(closed ? `Closed the drift PR ${closed}` : "No drift PR open; nothing to do.");
      return 0;
    }
    await writeFile(PIN_CHANGESET_FILE, renderPinChangeset(plan.to));
    const url = await openDriftPr(
      {
        branch: DRIFT_BRANCH,
        base,
        title: (await readFile(file("pr-title.txt"), "utf8")).trim(),
        bodyFile: file("pr-body.md"),
        files: [GHOST_VERSIONS_FILE, MANIFEST_FILE, GHOST_LATEST_FILE, PIN_CHANGESET_FILE],
      },
      run,
    );
    console.log(`Drift PR: ${url}`);
    return 0;
  },

  /** Fails the job when the manifest, live suite or client check failed or never reported. */
  async verdict() {
    const plan = JSON.parse(await readFile(file("plan.json"), "utf8")) as SavedPlan;
    const errors = [
      ...(manifestFailed()
        ? [`Manifest generation failed against Ghost ${plan.to}; see its step's log.`]
        : []),
      ...verdictErrors({
        "live suite": await liveSuite(plan),
        "client check": await unitTests(),
      }),
    ];
    errors.forEach(report);
    return errors.length ? 1 : 0;
  },
};

/** The live suite's result, or why it didn't run against `plan.to`. */
async function liveSuite(plan: SavedPlan) {
  const unsupported = unsupportedGhost(plan.to);
  if (unsupported) return suiteNotRun(unsupported);
  return summariseSuite(await readReport("suite.json"));
}

/** The result of every unit test run together. */
async function unitTests() {
  return summariseSuite(mergeReports(await Promise.all(Object.keys(UNIT_TESTS).map(readReport))));
}

/** Runs Vitest in `cwd` with `args`, keeping its JSON report as `report`; resolves to its exit code. */
async function vitest(
  report: string,
  args: string[],
  env: Record<string, string> = {},
  cwd = PACKAGE_DIR,
): Promise<number> {
  await rm(file(report), { force: true });
  return new Promise((done) => {
    const child = spawn(
      "pnpm",
      [
        ...["exec", "vitest", "run", ...args],
        ...["--reporter=default", "--reporter=json", `--outputFile.json=${file(report)}`],
      ],
      { cwd, stdio: "inherit", env: { ...process.env, ...env } },
    );
    child.on("close", (code) => done(code ?? 1));
  });
}

async function readReport(name: string): Promise<VitestJsonReport | undefined> {
  const text = await readFile(file(name), "utf8").catch(() => undefined);
  return text ? (JSON.parse(text) as VitestJsonReport) : undefined;
}

/** Appends step outputs for the workflow; a no-op outside GitHub Actions. */
async function output(values: Record<string, string>) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, stepOutputs(values));
}

/** Logs the whole message and annotates the run with its first line. */
function report(message: string) {
  console.error(message);
  console.error(errorAnnotation(message));
}

const name = process.argv[2] ?? "";
const step = steps[name];
if (!step) {
  console.error(`Usage: drift <${Object.keys(steps).join("|")}>`);
  process.exitCode = 2;
} else {
  step().then(
    (code) => (process.exitCode = code),
    (error: unknown) => {
      if (error instanceof Error) report(error.message);
      else console.error(error);
      process.exitCode = 1;
    },
  );
}
