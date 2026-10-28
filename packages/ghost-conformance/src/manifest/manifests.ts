import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { ghostVersions, type GhostVersions } from "../ghost/pin.ts";
import { MANIFEST_FILE, parseManifest, type Manifest } from "./manifest.ts";

/** Manifests of the frozen legs (last Ghost 5, Ghost 6.0.0); the pin's stays at manifest.json for the drift job. */
const MANIFESTS_DIR = fileURLToPath(new URL("../../manifests/", import.meta.url));

/** The committed manifest file of a pinned image: `manifest.json` for the pin, `manifests/ghost-<version>.json` else. */
export function manifestFile(image: keyof GhostVersions): string {
  return image === "pin" ? MANIFEST_FILE : `${MANIFESTS_DIR}ghost-${ghostVersions()[image]}.json`;
}

const cache = new Map<string, Manifest>();

/** The committed manifest of a pinned Ghost; `has("GET /posts/")` tells whether that Ghost has the route. */
export function manifestFor(version: string) {
  if (!cache.has(version)) {
    const versions = ghostVersions();
    const image = (Object.keys(versions) as (keyof GhostVersions)[]).find((k) => versions[k] === version);
    const file = image && manifestFile(image);
    if (!file || !existsSync(file))
      throw new Error(
        `No manifest for Ghost ${version}; pin it in ghost-versions.json and run pnpm manifest <leg>`,
      );
    cache.set(version, parseManifest(readFileSync(file, "utf8")));
  }
  const manifest = cache.get(version)!;
  return {
    manifest,
    /** Whether the route, as "METHOD /path/", exists. */
    has: (route: string) => manifest.routes.some((r) => `${r.method} ${r.path}` === route),
  };
}
