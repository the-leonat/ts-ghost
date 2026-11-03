#!/usr/bin/env node
// Publishes each built package to its own orphan "dist branch", so the branch
// root is the package and a consumer can install it by git reference.
// See docs/adr/0001-dist-branches-for-git-consumption.md.
//
// Usage: node scripts/dist-branches/publish.mjs --remote <git remote> --repo-url <dependency url>
//   --remote    where the branches are pushed (a remote name like `origin`, or a URL)
//   --repo-url  the git URL written into rewritten internal dependencies,
//               e.g. git+https://github.com/the-leonat/ts-ghost.git
//
// Packages must already be built (`pnpm build`).
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

const repoRoot = resolve(import.meta.dirname, "../..");

/** Source directory → dist branch. Core first: the others depend on it. */
export const DIST_BRANCHES = {
  "packages/ts-ghost-core-api": "dist/core-api",
  "packages/ts-ghost-admin-api": "dist/admin-api",
  "packages/ts-ghost-content-api": "dist/content-api",
};

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", cwd: repoRoot, ...opts }).trim();

/** Package name → dist branch, for every package published here. */
function branchesByName() {
  return Object.fromEntries(
    Object.entries(DIST_BRANCHES).map(([dir, branch]) => {
      const { name } = JSON.parse(readFileSync(join(repoRoot, dir, "package.json"), "utf8"));
      return [name, branch];
    }),
  );
}

/**
 * Stage the publishable contents of one package into `outDir`.
 * `pnpm pack` decides the contents exactly as a registry publish would (manifest,
 * `files`, README, LICENSE) and resolves `workspace:` and `catalog:` specifiers.
 */
function stage(dir, outDir) {
  const packDir = mkdtempSync(join(tmpdir(), "ts-ghost-pack-"));
  try {
    run("pnpm", ["pack", "--pack-destination", packDir], { cwd: join(repoRoot, dir) });
    const tarball = readdirSync(packDir).find((f) => f.endsWith(".tgz"));
    if (!tarball) throw new Error(`pnpm pack produced no tarball for ${dir}`);
    run("tar", ["-xzf", join(packDir, tarball), "-C", outDir, "--strip-components=1"]);
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

/**
 * Rewrite the staged manifest for git consumption.
 *
 * Internal dependencies are pointed at their dist branch. `pnpm pack` turns
 * `workspace:*` into the registry version, which a consumer would silently resolve
 * to the unpatched package on npm; this is the trap the rewrite closes.
 * Scripts and devDependencies are dropped: they only make sense in the monorepo,
 * and package managers may run lifecycle scripts of git dependencies.
 */
export function rewriteManifest(manifest, { repoUrl, branches }) {
  const out = { ...manifest };
  delete out.scripts;
  delete out.devDependencies;
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    if (!out[field]) continue;
    out[field] = Object.fromEntries(
      Object.entries(out[field]).map(([name, spec]) =>
        branches[name] ? [name, `${repoUrl}#${branches[name]}`] : [name, spec],
      ),
    );
  }
  return out;
}

/** Commit `treeDir` as a parentless commit in this repository and return its sha. */
function commitOrphan(treeDir, message) {
  const indexDir = mkdtempSync(join(tmpdir(), "ts-ghost-index-"));
  const gitDir = resolve(repoRoot, run("git", ["rev-parse", "--git-dir"]));
  // A throwaway index keeps the working checkout's index untouched.
  const env = {
    ...process.env,
    GIT_DIR: gitDir,
    GIT_WORK_TREE: treeDir,
    GIT_INDEX_FILE: join(indexDir, "index"),
  };
  try {
    run("git", ["add", "--all", "--force", "."], { cwd: treeDir, env });
    const tree = run("git", ["write-tree"], { env });
    return run("git", ["commit-tree", tree, "-m", message], { env });
  } finally {
    rmSync(indexDir, { recursive: true, force: true });
  }
}

export function publish({ remote, repoUrl }) {
  const branches = branchesByName();
  const source = run("git", ["rev-parse", "--short", "HEAD"]);
  for (const [dir, branch] of Object.entries(DIST_BRANCHES)) {
    const outDir = mkdtempSync(join(tmpdir(), "ts-ghost-dist-branch-"));
    try {
      stage(dir, outDir);
      const manifestPath = join(outDir, "package.json");
      const manifest = rewriteManifest(JSON.parse(readFileSync(manifestPath, "utf8")), {
        repoUrl,
        branches,
      });
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      const sha = commitOrphan(outDir, `${manifest.name}@${manifest.version} built from ${source}`);
      run("git", ["push", "--force", "--quiet", remote, `${sha}:refs/heads/${branch}`]);
      console.log(`${branch}: ${manifest.name}@${manifest.version} (${sha.slice(0, 7)})`);
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { values } = parseArgs({
    options: { remote: { type: "string" }, "repo-url": { type: "string" } },
  });
  if (!values.remote || !values["repo-url"]) {
    console.error("Usage: publish.mjs --remote <git remote> --repo-url <dependency git url>");
    process.exit(1);
  }
  publish({ remote: values.remote, repoUrl: values["repo-url"] });
}
