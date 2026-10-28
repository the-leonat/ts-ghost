import { appendFileSync } from "node:fs";
import { assert, inject, test } from "vitest";
import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { recordResponses, type ResponseRecorder } from "../unknown-keys.ts";
import { adminApi, type CredentialKind, type LiveGhost } from "./ghost.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

type LiveApi = ReturnType<typeof adminApi>;

// Apart from ghost.ts: global setup imports adminApi, and test.extend needs a test file.
type LiveFixtures = {
  /** The live Ghost; a unit test of the fixtures overrides it with a stub. */
  ghost: LiveGhost;
  /** Unknown-key paths deliberately left unmodelled; set per describe with `liveTest.override({ ignore })`. */
  ignore: string[];
  /** This test's raw responses, appended to $CONFORMANCE_RESPONSES for the drift job (src/drift/fields.ts). */
  responses: Pick<ResponseRecorder, "all" | "last">;
  /** Strict client: a key its schema lacks fails the result unless `ignore` or PENDING_KEYS lists it. */
  apiFor: (key: CredentialKind) => LiveApi;
  /** `apiFor("integration")`. */
  api: LiveApi;
  /** `api` typed as v6-compat, for tests of deprecated forms that v6-latest's types leave out. */
  deprecatedApi: TSGhostAdminAPI<`v6.${string}`>;
};

/** What a live test's function receives. */
export type LiveContext = LiveFixtures;

/** A live test: every one records its responses, and its clients fail on keys their schema lacks. */
export const liveTest = test.extend<LiveFixtures>({
  ghost: async ({}, use) => {
    await use(inject("ghost"));
  },
  ignore: [],
  responses: [
    async ({}, use) => {
      const recorder = recordResponses();
      try {
        await use(recorder);
      } finally {
        recorder.restore();
      }
      const file = process.env.CONFORMANCE_RESPONSES;
      if (file)
        appendFileSync(
          file,
          recorder
            .all()
            .map((r) => `${JSON.stringify(r)}\n`)
            .join(""),
        );
    },
    { auto: true },
  ],
  apiFor: async ({ ghost, ignore }, use) => {
    const strict = { ignore: [...ignore, ...PENDING_KEYS[ghost.leg.target]] };
    await use((key) => adminApi(key, ghost, strict));
  },
  api: async ({ apiFor }, use) => {
    await use(apiFor("integration"));
  },
  deprecatedApi: async ({ api }, use) => {
    await use(api as unknown as TSGhostAdminAPI<`v6.${string}`>);
  },
});

/** Narrows a client result to success; on failure, the message carries the result's errors. */
export function assertOk<R extends { success: boolean }>(
  result: R,
): asserts result is Extract<R, { success: true }> {
  assert(result.success, `Expected success, got ${JSON.stringify((result as { errors?: unknown }).errors)}`);
}
