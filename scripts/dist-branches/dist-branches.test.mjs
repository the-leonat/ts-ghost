// End-to-end check of dist-branch publishing. Publishes the built packages to a
// throwaway bare repository over file://, then reads the branches back the way a
// consumer would. Requires `pnpm build` to have run first (`pnpm dist:test` does it).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, test } from "node:test";

const repoRoot = resolve(import.meta.dirname, "../..");
const publishScript = join(repoRoot, "scripts/dist-branches/publish.mjs");

const PACKAGES = {
  "dist/core-api": "packages/ts-ghost-core-api",
  "dist/admin-api": "packages/ts-ghost-admin-api",
  "dist/content-api": "packages/ts-ghost-content-api",
};

const git = (gitDir, ...args) =>
  execFileSync("git", [`--git-dir=${gitDir}`, ...args], { encoding: "utf8" }).trim();
const showJson = (gitDir, branch, path) => JSON.parse(git(gitDir, "show", `${branch}:${path}`));
const sourceManifest = (dir) => JSON.parse(readFileSync(join(repoRoot, dir, "package.json"), "utf8"));

let work;
let bare;
let repoUrl;

before(() => {
  work = mkdtempSync(join(tmpdir(), "ts-ghost-dist-"));
  bare = join(work, "remote.git");
  execFileSync("git", ["init", "--bare", "--quiet", bare]);
  repoUrl = `git+file://${bare}`;
  execFileSync("node", [publishScript, "--remote", `file://${bare}`, "--repo-url", repoUrl], {
    cwd: repoRoot,
    stdio: "inherit",
  });
});

after(() => {
  if (work) rmSync(work, { recursive: true, force: true });
});

describe("dist branches", () => {
  for (const [branch, dir] of Object.entries(PACKAGES)) {
    test(`${branch} is an orphan branch whose root is the package`, () => {
      assert.equal(
        git(bare, "rev-list", "--count", branch),
        "1",
        "branch should be a single parentless commit",
      );
      const manifest = showJson(bare, branch, "package.json");
      const source = sourceManifest(dir);
      assert.equal(manifest.name, source.name);
      assert.equal(manifest.version, source.version);
      const files = git(bare, "ls-tree", "-r", "--name-only", branch).split("\n");
      assert.ok(files.includes("dist/index.js"), "build output is at the branch root");
      assert.ok(files.includes("dist/index.d.ts"), "type declarations are at the branch root");
      assert.ok(!files.some((f) => f.startsWith("src/")), "sources are not published");
    });
  }

  for (const branch of ["dist/admin-api", "dist/content-api"]) {
    test(`${branch} depends on core by git reference, not registry version`, () => {
      const { dependencies } = showJson(bare, branch, "package.json");
      assert.equal(dependencies["@ts-ghost/core-api"], `${repoUrl}#dist/core-api`);
      for (const spec of Object.values(dependencies)) {
        assert.doesNotMatch(spec, /^(workspace|catalog):/, "monorepo-only specifiers are resolved");
      }
    });
  }

  test("a scratch install of admin-api resolves core-api from the repository, not the registry", () => {
    const app = join(work, "consumer");
    execFileSync("mkdir", ["-p", app]);
    writeFileSync(
      join(app, "package.json"),
      JSON.stringify({
        name: "consumer",
        private: true,
        dependencies: { "@ts-ghost/admin-api": `${repoUrl}#dist/admin-api` },
      }),
    );
    // pnpm 11+ refuses git-resolved subdependencies by default; a consumer must opt in.
    // pnpm 10 ignores the setting. See docs/adr/0001-dist-branches-for-git-consumption.md.
    writeFileSync(join(app, "pnpm-workspace.yaml"), "blockExoticSubdeps: false\n");
    execFileSync("pnpm", ["install", "--prefer-offline", "--reporter=silent"], {
      cwd: app,
      stdio: "inherit",
    });

    const lockfile = readFileSync(join(app, "pnpm-lock.yaml"), "utf8");
    const coreRef = git(bare, "rev-parse", "dist/core-api");
    assert.match(
      lockfile,
      new RegExp(`@ts-ghost/core-api@git\\+file:[^\\s]*${coreRef}`),
      "core-api is locked to the dist branch commit",
    );
    assert.doesNotMatch(lockfile, /@ts-ghost\/core-api@7\.0\.0/, "core-api is not taken from the registry");

    // The admin package's own copy of core is the one from the repository.
    const output = execFileSync(
      "node",
      [
        "-e",
        "const p=require.resolve('@ts-ghost/core-api/package.json',{paths:[require.resolve('@ts-ghost/admin-api')]});console.log(JSON.stringify(require(p)))",
      ],
      { cwd: app, encoding: "utf8" },
    );
    assert.equal(JSON.parse(output).scripts, undefined, "installed core-api is the dist-branch manifest");
    execFileSync(
      "node",
      [
        "-e",
        "const {TSGhostAdminAPI}=require('@ts-ghost/admin-api');if(typeof TSGhostAdminAPI!=='function')process.exit(1)",
      ],
      { cwd: app },
    );
  });
});
