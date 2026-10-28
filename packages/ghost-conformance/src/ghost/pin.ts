import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { SchemaTarget } from "@ts-ghost/admin-api";

export type { SchemaTarget };

/** The one file pinning every Ghost image: the last Ghost 5, Ghost 6.0.0 and the drift-maintained pin. */
export const GHOST_VERSIONS_FILE = fileURLToPath(new URL("../../ghost-versions.json", import.meta.url));

export type GhostVersions = { v5: string; "v6.0": string; pin: string };

/** Each matrix leg: which pinned Ghost it runs and the client schema target it checks. */
const LEGS = {
  v5: { image: "v5", target: "v5" },
  "v6.0": { image: "v6.0", target: "v6-compat" },
  pin: { image: "pin", target: "v6-latest" },
  "pin-compat": { image: "pin", target: "v6-compat" },
} as const satisfies Record<string, { image: keyof GhostVersions; target: SchemaTarget }>;

export type LegName = keyof typeof LEGS;
export type GhostLeg = { name: LegName; ghost: string; target: SchemaTarget };
export const LEG_NAMES = Object.keys(LEGS) as LegName[];

export function ghostVersions(): GhostVersions {
  const versions = JSON.parse(readFileSync(GHOST_VERSIONS_FILE, "utf8")) as GhostVersions;
  for (const [name, version] of Object.entries(versions)) {
    if (!/^\d+\.\d+\.\d+$/.test(version))
      throw new Error(`Invalid Ghost version "${version}" for ${name} in ${GHOST_VERSIONS_FILE}`);
  }
  return versions;
}

/** The pinned Ghost 6 (image tag of the pin legs, the manifest and the drift job). */
export function ghostVersion(): string {
  return ghostVersions().pin;
}

/** Rewrites the pin, keeping the other legs. */
export function setPin(version: string) {
  writeFileSync(GHOST_VERSIONS_FILE, `${JSON.stringify({ ...ghostVersions(), pin: version }, null, 2)}\n`);
}

/**
 * The leg named by `name` (GHOST_LEG), the pin on v6-latest by default. GHOST_LEG_VERSION runs its target
 * against another Ghost, e.g. a matrix over older minors.
 */
export function ghostLeg(
  name: string | undefined = process.env.GHOST_LEG,
  version: string | undefined = process.env.GHOST_LEG_VERSION,
): GhostLeg {
  const leg = name || "pin";
  if (!(leg in LEGS)) throw new Error(`Unknown GHOST_LEG "${leg}"; use one of ${LEG_NAMES.join(", ")}`);
  const { image, target } = LEGS[leg as LegName];
  return { name: leg as LegName, ghost: version || ghostVersions()[image], target };
}

/** Why the client can't talk to Ghost `version`, or undefined when it can. */
export function unsupportedGhost(version: string): string | undefined {
  const major = version.split(".")[0];
  if (major === "5" || major === "6") return undefined;
  return `Ghost ${major} isn't supported by the client yet: its version type only covers Ghost 5 and 6.`;
}

/** Version string the client sends, e.g. "v6.72" for Ghost 6.72.0. */
export function clientVersion(version: string): `v5.${string}` | `v6.${string}` {
  const unsupported = unsupportedGhost(version);
  if (unsupported) throw new Error(unsupported);
  const [major, minor] = version.split(".");
  return `v${major as "5" | "6"}.${minor}`;
}

/** Client options selecting `target` on top of the version string. */
export function clientOptions(target: SchemaTarget): { schema?: "latest" } {
  return target === "v6-latest" ? { schema: "latest" } : {};
}

/** Compares Ghost versions part by part, numerically; a missing part counts as 0. */
export function compareVersions(a: string, b: string): number {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (x![i] !== y![i]) return (x![i] ?? 0) - (y![i] ?? 0);
  return 0;
}

/** Whether Ghost `version` is `min` or newer. */
export function versionAtLeast(version: string, min: string): boolean {
  return compareVersions(version, min) >= 0;
}
