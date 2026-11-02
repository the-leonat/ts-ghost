// Loads a Ghost version's manifest: manifest.json for the pin, manifests/ for the others.

import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { ghostVersions } from "../ghost/versions.ts";
import { MANIFEST_FILE, parseManifest, type Manifest } from "./manifest.ts";

/** Manifests of every Ghost but the pin: the frozen legs' are committed, the compat sweep generates its own. */
const MANIFESTS_DIR = fileURLToPath(new URL("../../manifests/", import.meta.url));

/** The manifest file of Ghost `version`: `manifest.json` for the pin, `manifests/ghost-<version>.json` else. */
export function manifestFile(version: string): string {
  return version === ghostVersions().pin ? MANIFEST_FILE : `${MANIFESTS_DIR}ghost-${version}.json`;
}

const cache = new Map<string, Manifest>();

/** The manifest of Ghost `version`; `has("GET /posts/")` tells whether that Ghost has the route. */
export function manifestFor(version: string) {
  if (!cache.has(version)) {
    const file = manifestFile(version);
    if (!existsSync(file))
      throw new Error(`No manifest for Ghost ${version}; generate it with pnpm manifest ${version}`);
    cache.set(version, parseManifest(readFileSync(file, "utf8")));
  }
  const manifest = cache.get(version)!;
  return {
    manifest,
    /** Whether the route, as "METHOD /path/", exists. */
    has: (route: string) => manifest.routes.some((r) => `${r.method} ${r.path}` === route),
  };
}
