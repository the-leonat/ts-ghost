// The live test (`liveTest`) with the leg's Ghost and strict clients, plus `onLatest` and `assertOk`.

import { assert, inject, test } from "vitest";

import { adminApi, type CredentialKind, type LiveGhost } from "../ghost/admin-client.ts";

type LiveApi = ReturnType<typeof adminApi>;

type LiveFixtures = {
  /** The live Ghost. */
  ghost: LiveGhost;
  /** A strict client on the leg's target with that credential: a key its schema lacks fails the result. */
  apiFor: (key: CredentialKind) => LiveApi;
  /** `apiFor("integration")`. */
  api: LiveApi;
};

/** What a live test's function receives. */
export type LiveContext = LiveFixtures;

/** A live test: its clients are strict, so every response must match the leg's schemas exactly. */
export const liveTest = test.extend<LiveFixtures>({
  ghost: async ({}, use) => {
    await use(inject("ghost"));
  },
  apiFor: async ({ ghost }, use) => {
    await use((key) => adminApi(ghost, ghost.leg, { key, strict: true }));
  },
  api: async ({ apiFor }, use) => {
    await use(apiFor("integration"));
  },
});

/** Whether the leg checks the latest target: only there a round trip checks the inputs, `liveTest.runIf(onLatest)`. */
export const onLatest = inject("ghost").leg.target === "latest";

/** Narrows a client result to success; on failure, the message carries the result's errors. */
export function assertOk<R extends { success: boolean }>(
  result: R,
): asserts result is Extract<R, { success: true }> {
  assert(result.success, `Expected success, got ${JSON.stringify((result as { errors?: unknown }).errors)}`);
}
