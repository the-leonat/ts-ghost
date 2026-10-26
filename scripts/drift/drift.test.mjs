// The drift check: diffs a fresh recording against the committed artefacts.
// Driven through the CLI the drift workflow runs, over real directories.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

const checkScript = resolve(import.meta.dirname, "check.mjs");

const siteFixture = (site) => ({
  request: { method: "GET", path: "/ghost/api/admin/site/", query: {} },
  response: { status: 200, headers: { "content-version": "v6.72" }, body: { site } },
});

let work;
let committed;
let recorded;

const write = (root, file, value) => {
  const full = join(root, file);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
};

const check = (...extra) =>
  spawnSync("node", [checkScript, "--committed", committed, "--recorded", recorded, ...extra], {
    encoding: "utf8",
  });

beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), "ts-ghost-drift-"));
  committed = join(work, "committed");
  recorded = join(work, "recorded");
  mkdirSync(committed);
  mkdirSync(recorded);
});

afterEach(() => rmSync(work, { recursive: true, force: true }));

describe("drift check", () => {
  test("identical artefacts are no drift", () => {
    write(committed, "site/get.json", siteFixture({ title: "Ghost", logo: null }));
    write(recorded, "site/get.json", siteFixture({ title: "Ghost", logo: null }));

    const result = check();

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /No drift/);
  });

  test("a changed field fails, naming the route and the field", () => {
    write(committed, "site/get.json", siteFixture({ title: "Hand edited", logo: null }));
    write(recorded, "site/get.json", siteFixture({ title: "Ghost", logo: null }));

    const result = check();

    assert.equal(result.status, 1);
    assert.match(result.stdout, /GET \/ghost\/api\/admin\/site\//);
    assert.match(result.stdout, /response\.body\.site\.title/);
    assert.match(result.stdout, /"Hand edited"/);
    assert.match(result.stdout, /"Ghost"/);
  });

  test("a key Ghost started sending and one it stopped sending are both named", () => {
    write(committed, "site/get.json", siteFixture({ title: "Ghost", icon: null }));
    write(recorded, "site/get.json", siteFixture({ title: "Ghost", accent_color: "#FF1A75" }));

    const result = check();

    assert.equal(result.status, 1);
    assert.match(result.stdout, /`response\.body\.site\.accent_color` added: `"#FF1A75"`/);
    assert.match(result.stdout, /`response\.body\.site\.icon` removed/);
  });

  test("a committed fixture the recorder no longer writes is stale drift", () => {
    write(committed, "site/get.json", siteFixture({ title: "Ghost" }));
    write(committed, "tiers/read-by-slug.json", {
      request: { method: "GET", path: "/ghost/api/admin/tiers/slug/default-product/", query: {} },
      response: { status: 404, headers: {}, body: {} },
    });
    write(recorded, "site/get.json", siteFixture({ title: "Ghost" }));

    const result = check();

    assert.equal(result.status, 1);
    assert.match(
      result.stdout,
      /GET \/ghost\/api\/admin\/tiers\/slug\/default-product\/.*no longer recorded/,
    );
  });

  test("a recorded fixture with no committed counterpart is drift", () => {
    write(recorded, "site/get.json", siteFixture({ title: "Ghost" }));

    const result = check();

    assert.equal(result.status, 1);
    assert.match(result.stdout, /GET \/ghost\/api\/admin\/site\/.*new, not committed/);
  });

  test("any other artefact, such as the route spec, is diffed by file and field", () => {
    const spec = (allowIncludes) => ({
      endpoints: { members: { browse: { allowIncludes } } },
    });
    write(committed, "route-spec.json", spec(["email_recipients", "tiers"]));
    write(recorded, "route-spec.json", spec(["email_recipients", "tiers", "metafields"]));

    const result = check();

    assert.equal(result.status, 1);
    assert.match(result.stdout, /`route-spec\.json`/);
    assert.match(result.stdout, /`endpoints\.members\.browse\.allowIncludes\[2\]` added: `"metafields"`/);
  });

  test("key order alone is not drift", () => {
    write(committed, "site/get.json", siteFixture({ title: "Ghost", logo: null }));
    write(recorded, "site/get.json", siteFixture({ logo: null, title: "Ghost" }));

    assert.equal(check().status, 0);
  });

  test("the report is also written to --report for the pull request body", () => {
    write(committed, "site/get.json", siteFixture({ title: "Hand edited" }));
    write(recorded, "site/get.json", siteFixture({ title: "Ghost" }));
    const reportFile = join(work, "drift.md");

    const result = check("--report", reportFile);

    assert.equal(readFileSync(reportFile, "utf8"), result.stdout);
  });

  test("a missing directory is misuse, not an empty recording", () => {
    rmSync(recorded, { recursive: true });

    const result = check();

    assert.equal(result.status, 2);
    assert.match(result.stderr, /recorded/);
  });
});
