/** Behaviour of a route every leg has that changed in some Ghost, with the first version that has it.
 * Whether a route exists at all is the manifests' job (manifestFor). */
export const GHOST_BEHAVIOURS = {
  /** Offers without a tier (`redemption_type: "retention"`); older Ghost answers 500. */
  retentionOffers: "6.18.0",
  /** Adding a scheduled email-only post fails without edit's `newsletter` option. */
  emailOnlyScheduleNeedsNewsletter: "6.33.0",
  /** Integration tokens are refused on staff routes such as `PUT /settings/` (Ghost 5 let them in). */
  integrationAllowlist: "6.0.0",
} as const;

export type GhostBehaviour = keyof typeof GHOST_BEHAVIOURS;

/** Whether Ghost `version` (e.g. "6.72.0") has `behaviour`. */
export function ghostHas(behaviour: GhostBehaviour, version: string): boolean {
  return compareVersions(version, GHOST_BEHAVIOURS[behaviour]) >= 0;
}

/** Why a test needing `behaviour` is skipped on Ghost `version`, for skip messages. */
export function lacks(behaviour: GhostBehaviour, version: string): string | undefined {
  return ghostHas(behaviour, version)
    ? undefined
    : `Ghost ${version} predates ${behaviour} (${GHOST_BEHAVIOURS[behaviour]})`;
}

/** Whether Ghost `version` is `min` or newer, comparing each part numerically. */
export function versionAtLeast(version: string, min: string): boolean {
  return compareVersions(version, min) >= 0;
}

function compareVersions(a: string, b: string): number {
  const [x, y] = [a, b].map((v) => v.split(".").map(Number));
  for (let i = 0; i < 3; i++) if (x![i] !== y![i]) return (x![i] ?? 0) - (y![i] ?? 0);
  return 0;
}
