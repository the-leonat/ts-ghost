#!/usr/bin/env node
// Version-watch helpers for the drift job.
//
//   node scripts/drift/release.mjs latest              # newest Ghost release tag, e.g. v6.72.0
//   node scripts/drift/release.mjs fixture-dir v6.72.0 # ghost-6.72
//
// `latest` reads Ghost's tags anonymously with `git ls-remote`, so it needs no token.
import { execFileSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const GHOST_REPOSITORY = "https://github.com/TryGhost/Ghost.git";
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

/**
 * The newest stable release tag (`vX.Y.Z`, compared numerically) among tag names
 * or raw `git ls-remote --tags` output. Prereleases and other tags are ignored.
 */
export function newestRelease(tags) {
  const names =
    typeof tags === "string"
      ? tags
          .split("\n")
          .map((line) => line.split("\t")[1] ?? "")
          .map((ref) => ref.replace(/^refs\/tags\//, ""))
      : tags;
  const releases = names
    .map((name) => ({ name, match: RELEASE_TAG.exec(name) }))
    .filter(({ match }) => match !== null)
    .map(({ name, match }) => ({ name, version: match.slice(1).map(Number) }));
  if (releases.length === 0) throw new Error("No release tag found among Ghost's tags");
  releases.sort((a, b) => {
    for (let i = 0; i < 3; i++) if (a.version[i] !== b.version[i]) return b.version[i] - a.version[i];
    return 0;
  });
  return releases[0].name;
}

/** The Ghost-minor-keyed artefact directory name for a release tag. */
export function fixtureDirName(ref) {
  const match = RELEASE_TAG.exec(ref);
  if (!match) throw new Error(`Expected a Ghost release tag like v6.72.0, got: ${ref}`);
  return `ghost-${match[1]}.${match[2]}`;
}

function main([command, ...args]) {
  if (command === "latest") {
    const output = execFileSync("git", ["ls-remote", "--tags", "--refs", GHOST_REPOSITORY], {
      encoding: "utf8",
    });
    return newestRelease(output);
  }
  if (command === "fixture-dir" && args.length === 1) return fixtureDirName(args[0]);
  throw new Error("usage: release.mjs latest | release.mjs fixture-dir <ref>");
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(main(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
