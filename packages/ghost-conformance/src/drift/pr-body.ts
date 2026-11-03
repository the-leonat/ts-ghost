// The drift PR's title and body (manifest diff, suite results, coverage, releases) and the run's verdict.

import type { ClientCall } from "../client-routes/route-check.ts";
import { minorOf } from "../ghost/versions.ts";
import type { Manifest, ManifestRoute } from "../manifest/manifest.ts";
import { renderCoverage, type Coverage } from "../route-coverage/coverage.ts";
import type { DriftPlan, GhostRelease } from "./plan.ts";

export type ManifestDiff = {
  added: ManifestRoute[];
  removed: ManifestRoute[];
  changed: { before: ManifestRoute; after: ManifestRoute }[];
};

export type SuiteSummary = {
  ok: boolean;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  failures: string[];
  /** The suite produced no report, e.g. Ghost never became healthy. */
  crashed?: true;
  /** Why the suite was not run at all. */
  notRun?: string;
};

/** The subset of Vitest's JSON reporter output the summary reads. */
export type VitestJsonReport = {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  numPendingTests: number;
  numTodoTests: number;
  testResults: {
    assertionResults: {
      fullName: string;
      status: string;
      failureMessages?: string[];
    }[];
  }[];
};

const ACCESS = ["public", "integration", "staff", "session"] as const;
/** The one branch the drift PR comes from; every run force-pushes it. */
export const DRIFT_BRANCH = "conformance/drift";
const key = (r: ManifestRoute) => `${r.method} ${r.path}`;

export function diffManifests(before: Manifest, after: Manifest): ManifestDiff {
  const old = new Map(before.routes.map((r) => [key(r), r]));
  const now = new Map(after.routes.map((r) => [key(r), r]));
  return {
    added: after.routes.filter((r) => !old.has(key(r))),
    removed: before.routes.filter((r) => !now.has(key(r))),
    changed: after.routes.flatMap((r) => {
      const prev = old.get(key(r));
      return prev && JSON.stringify(prev) !== JSON.stringify(r) ? [{ before: prev, after: r }] : [];
    }),
  };
}

export function summariseSuite(report: VitestJsonReport | undefined): SuiteSummary {
  if (!report)
    return {
      ok: false,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      failures: [],
      crashed: true,
    };
  const tests = report.testResults.flatMap((file) => file.assertionResults);
  const failures = tests
    .filter((t) => t.status === "failed")
    .map((t) => {
      const error = t.failureMessages?.[0]?.split("\n")[0];
      return error ? `${t.fullName}: ${shorten(error)}` : t.fullName;
    });
  return {
    ok: report.numFailedTests === 0 && report.numTotalTests > 0,
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    skipped: report.numPendingTests + report.numTodoTests,
    failures,
  };
}

/** One report of several Vitest runs; undefined when any of them never reported, which counts as a crash. */
export function mergeReports(reports: (VitestJsonReport | undefined)[]): VitestJsonReport | undefined {
  if (reports.some((r) => !r)) return undefined;
  const present = reports as VitestJsonReport[];
  const sum = (
    key: "numTotalTests" | "numPassedTests" | "numFailedTests" | "numPendingTests" | "numTodoTests",
  ) => present.reduce((total, r) => total + r[key], 0);
  return {
    numTotalTests: sum("numTotalTests"),
    numPassedTests: sum("numPassedTests"),
    numFailedTests: sum("numFailedTests"),
    numPendingTests: sum("numPendingTests"),
    numTodoTests: sum("numTodoTests"),
    testResults: present.flatMap((r) => r.testResults),
  };
}

/** An error line cut to 300 characters, so a long response dump doesn't flood the PR body. */
function shorten(line: string): string {
  return line.length > 300 ? `${line.slice(0, 299)}…` : line;
}

/** A suite that was deliberately not run, e.g. because the client doesn't support the Ghost. */
export function suiteNotRun(reason: string): SuiteSummary {
  return { ...summariseSuite(undefined), crashed: undefined, notRun: reason };
}

/** Resources the client calls, e.g. "posts" for `posts.read({slug})`. */
export function clientResources(calls: Pick<ClientCall, "name">[]): string[] {
  return [...new Set(calls.map((c) => c.name.split(".")[0]!))].sort();
}

/** One error per suite that failed, crashed or didn't run; empty when the job should pass. */
export function verdictErrors(suites: Record<string, SuiteSummary>): string[] {
  return Object.entries(suites).flatMap(([name, result]) => {
    if (result.ok) return [];
    if (result.notRun) return [`The ${name} did not run: ${result.notRun}`];
    if (result.crashed) return [`The ${name} crashed before reporting; see its step's log.`];
    return [`The ${name} failed ${result.failed} of ${result.total} tests:\n${result.failures.join("\n")}`];
  });
}

export function renderPrTitle(
  plan: Pick<DriftPlan, "from" | "to">,
  suite: SuiteSummary,
  client: SuiteSummary,
  manifestFailed = false,
): string {
  const title = `chore(conformance): bump Ghost pin ${plan.from} → ${plan.to}`;
  if (manifestFailed) return `${title} (manifest generation failing)`;
  if (suite.notRun) return `${title} (not supported by the client yet)`;
  const failing = [...(suite.ok ? [] : ["live suite"]), ...(client.ok ? [] : ["client check"])];
  return failing.length ? `${title} (${failing.join(" and ")} failing)` : title;
}

export function renderPrBody(input: {
  plan: Pick<DriftPlan, "from" | "to">;
  releases: GhostRelease[];
  diff: ManifestDiff;
  suite: SuiteSummary;
  /** The conformance, core-api, admin-api and content-api unit tests, incl. the client → manifest check, against the new pin. */
  client: SuiteSummary;
  /** Client resources, so the reviewer knows which release notes matter. */
  resources: string[];
  /** Route coverage at the pin, then at the new Ghost (left out when its manifest failed). */
  coverage: Coverage[];
  /** Regenerating the manifest failed, so `diff` and the client check saw the old manifest. */
  manifestFailed?: boolean;
  /** `CONFORMANCE_PR_TOKEN` is set, so CI starts on its own. */
  prTokenSet?: boolean;
  runUrl?: string;
  /** e.g. `https://github.com/owner/repo`, to link the README's rules. */
  repoUrl?: string;
}): string {
  const {
    plan,
    releases,
    diff,
    suite,
    client,
    resources,
    coverage,
    manifestFailed,
    prTokenSet,
    runUrl,
    repoUrl,
  } = input;
  const run = runUrl ? ` ([run](${runUrl}))` : "";
  const rules = repoUrl
    ? `[the conformance README](${repoUrl}/blob/HEAD/${README}#drift-pr)`
    : `\`${README}\``;
  const covered = resources.length ? resources.map((r) => `\`${r}\``).join(", ") : "none found";
  return [
    ...(manifestFailed
      ? [
          `> ❌ **Manifest generation failed against Ghost ${plan.to}**${run}. Do not merge until it is fixed.`,
          "",
        ]
      : []),
    ...(suite.notRun
      ? [`> ❌ **${suite.notRun}** The live suite did not run. Do not merge.`, ""]
      : suite.ok
        ? []
        : [`> ❌ **The live suite fails against Ghost ${plan.to}.** Do not merge until it is green.`, ""]),
    ...(client.ok
      ? []
      : [
          `> ❌ **The unit tests or the client → manifest check fail against the new pin.** Do not merge until they are green.`,
          "",
        ]),
    `Weekly drift check: bumps the pinned Ghost from \`${plan.from}\` → \`${plan.to}\` and regenerates \`manifest.json\`. Merging it bumps the pin; how this PR works is in ${rules}.`,
    "",
    ...(prTokenSet
      ? []
      : [
          "GitHub holds CI on this PR, because the bot's token opened it. Re-run the held runs or close and reopen the PR, so the `v5` and `v6.0` compat legs run. Setting the `CONFORMANCE_PR_TOKEN` secret skips this.",
          "",
        ]),
    "## Live suite",
    "",
    ...renderSuite("live suite", suite, run),
    "",
    "## Unit tests and client → manifest check",
    "",
    ...renderSuite("client check", client, run),
    "",
    "## Manifest diff",
    "",
    ...(manifestFailed
      ? [`❌ The manifest was not regenerated; see the manifest step's log${run}.`]
      : renderDiff(diff)),
    "",
    "## Schema target",
    "",
    ...renderTargetRule(plan.to, rules),
    "",
    "## Client coverage",
    "",
    renderCoverage(coverage),
    "## Ghost release notes",
    "",
    "The suite can't see changes to query options (includes, filters, order, formats) or to behaviour the",
    "client doesn't exercise. Read these notes for the resources the client covers:",
    "",
    `Client resources: ${covered}.`,
    "",
    ...(releases.length
      ? releases.map((r) => `- [${r.version}](${r.url})`)
      : [`- [All releases](https://github.com/TryGhost/Ghost/releases)`]),
    "",
  ].join("\n");
}

/** The drift PR's changeset: a pin bump alone is a patch, and its changelog line is how a latest user finds the release. */
export function renderPinChangeset(version: string): string {
  return `---
"@ts-ghost/core-api": patch
"@ts-ghost/admin-api": patch
---

Pins Ghost ${minorOf(version)}.
`;
}

const README = "packages/ghost-conformance/README.md";

/** What the bump means for the client's schema targets; the rules for fixing them live in the README. */
function renderTargetRule(version: string, rules: string): string[] {
  const minor = minorOf(version);
  return [
    `\`GHOST_LATEST\` moves to \`"${minor}"\`: \`{ schema: "latest" }\` clients now parse what Ghost ${minor} sends. This PR's \`patch\` changeset says so.`,
    `Update latest (\`packages/ts-ghost-admin-api/src/schemas/\`) to what this Ghost sends and widen \`schemas/compat.ts\` for each field it removed or retyped, as ${rules} describes.`,
  ];
}

function renderSuite(name: string, suite: SuiteSummary, run: string): string[] {
  if (suite.notRun) return [`❌ Not run: ${suite.notRun}`];
  if (suite.crashed) return [`❌ The ${name} crashed before reporting any test${run}.`];
  const counts = [
    `${suite.passed} passed, ${suite.failed} failed`,
    ...(suite.skipped ? [`, ${suite.skipped} skipped`] : []),
    ` of ${suite.total}`,
  ].join("");
  if (suite.ok) return [`✅ Passed: ${counts}${run}.`];
  return [
    `❌ Failed: ${counts}${run}.`,
    ...(suite.failures.length ? ["", "Failing tests:", "", ...suite.failures.map((f) => `- ${f}`)] : []),
  ];
}

function renderDiff(diff: ManifestDiff): string[] {
  const lines = [
    ...diff.added.map((r) => `+ ${key(r)}  ${describeRoute(r)}`),
    ...diff.removed.map((r) => `- ${key(r)}`),
    ...diff.changed.map(({ before, after }) => `~ ${key(after)}  ${describeChange(before, after)}`),
  ];
  if (!lines.length) return ["No route changes: same routes, labs flags and auth."];
  const counts = `${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed`;
  return [counts, "", "```diff", ...lines, "```"];
}

function describeRoute(r: ManifestRoute): string {
  const accepts = ACCESS.filter((a) => r[a]);
  return [`accepts: ${accepts.join(", ") || "none"}`, ...(r.labs ? [`labs: ${r.labs}`] : [])].join("; ");
}

function describeChange(before: ManifestRoute, after: ManifestRoute): string {
  const word = (v: boolean) => (v ? "accepted" : "refused");
  return [
    ...ACCESS.filter((a) => before[a] !== after[a]).map(
      (a) => `${a}: ${word(before[a])} → ${word(after[a])}`,
    ),
    ...(before.labs !== after.labs ? [`labs: ${before.labs ?? "none"} → ${after.labs ?? "none"}`] : []),
  ].join("; ");
}
