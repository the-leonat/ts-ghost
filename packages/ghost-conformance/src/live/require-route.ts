// Skips a live test when the leg's Ghost lacks a route, by that Ghost's manifest.

import { inject, type TestContext } from "vitest";

import { manifestFor } from "../manifest/manifest-files.ts";

/** Skips the running test when the live Ghost's manifest lacks `route`, e.g. "GET /members/metafields/:namespace/". */
export function requireRoute(context: Pick<TestContext, "skip">, route: string) {
  const { version } = inject("ghost");
  if (!manifestFor(version).has(route)) context.skip(`Ghost ${version} has no ${route}`);
}
