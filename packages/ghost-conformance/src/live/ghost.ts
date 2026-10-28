import { inject, type ProvidedContext, type TestContext } from "vitest";
import { GHOST_FIELDS, TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { lacks, type GhostBehaviour } from "../ghost/behaviours.ts";
import { clientOptions, clientVersion, versionAtLeast } from "../ghost/pin.ts";
import { manifestFor } from "../manifest/manifests.ts";

export type CredentialKind = "integration" | "staff";
export type LiveGhost = Pick<
  ProvidedContext["ghost"],
  "url" | "integrationKey" | "staffToken" | "version" | "leg"
>;

/**
 * Public admin-api client against the live Ghost, on the leg's schema target; `ghost` defaults to the injected
 * one (unset in global setup). With `strict`, a key its schema lacks fails the result unless `ignore` lists it.
 * Typed as v6-latest; on an older leg a later field is undefined at runtime, so tests needing one check the leg.
 */
export function adminApi(
  key: CredentialKind = "integration",
  ghost: LiveGhost = inject("ghost"),
  strict?: { ignore: string[] },
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  const options = clientOptions(ghost.leg.target) as { schema: "latest" };
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion(ghost.version) as `v6.${string}`, {
    ...options,
    strict,
  });
}

/** Skips the running test, saying why, when the live Ghost predates `behaviour`. */
export function requireBehaviour(context: Pick<TestContext, "skip">, behaviour: GhostBehaviour) {
  const reason = lacks(behaviour, inject("ghost").version);
  if (reason) context.skip(reason);
}

/** Skips the running test when the live Ghost's manifest lacks `route`, e.g. "GET /members/metafields/:namespace/". */
export function requireRoute(context: Pick<TestContext, "skip">, route: string) {
  const { version } = inject("ghost");
  if (!manifestFor(version).has(route)) context.skip(`Ghost ${version} has no ${route}`);
}

/** Whether the live Ghost sends `field`, by its GHOST_FIELDS since/until entry. */
export function ghostSends(field: keyof typeof GHOST_FIELDS): boolean {
  const { version } = inject("ghost");
  const range: { since?: string; until?: string } = GHOST_FIELDS[field];
  return (
    (!range.since || versionAtLeast(version, range.since)) &&
    !(range.until && versionAtLeast(version, range.until))
  );
}
