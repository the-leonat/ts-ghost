// Builds the public admin-api client for a live Ghost, on a leg's schema target, with either credential.

import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import type { GhostCredentials } from "./bootstrap.ts";
import { clientVersion, type GhostLeg } from "./versions.ts";

/** A started and bootstrapped Ghost of one leg, as the live run's global setup provides it. */
export type LiveGhost = GhostCredentials & {
  url: string;
  version: string;
  composeProject: string;
  leg: GhostLeg;
};

export type CredentialKind = "integration" | "staff";

/**
 * Public admin-api client against a Ghost, on `leg`'s schema target; with `strict`, a key its schema lacks fails
 * the result. Typed as latest; on an older leg a later field is undefined.
 */
export function adminApi(
  ghost: Pick<LiveGhost, "url" | "integrationKey" | "staffToken">,
  leg: Pick<GhostLeg, "ghost" | "target">,
  options: { key?: CredentialKind; strict?: boolean } = {},
) {
  const apiKey = options.key === "staff" ? ghost.staffToken : ghost.integrationKey;
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion(leg.ghost), {
    schema: leg.target as "latest",
    strict: options.strict,
  });
}
