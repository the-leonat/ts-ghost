import { appendFileSync } from "node:fs";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  inject,
  test,
  type ProvidedContext,
  type TestContext,
} from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { lacks, versionAtLeast, type GhostBehaviour } from "../ghost/behaviours.ts";
import { clientOptions, clientVersion } from "../ghost/pin.ts";
import { manifestFor } from "../manifest/manifests.ts";
import { recordResponses, type ResponseRecorder } from "../unknown-keys.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

/** The running test's `liveResponses({ ignore })`; undefined outside one (e.g. seeding in hooks). */
let ignoredInTest: string[] | undefined;

/**
 * Public admin-api client against the live Ghost, on the leg's schema target. Inside a `liveResponses()` test it
 * is strict: a key its schema lacks fails the result unless `ignore` or PENDING_KEYS lists it.
 * Typed as v6-latest; on an older leg a later field is undefined at runtime, so tests needing one check the leg.
 */
export function adminApi(
  key: "integration" | "staff" = "integration",
  ghost: Pick<
    ProvidedContext["ghost"],
    "url" | "integrationKey" | "staffToken" | "version" | "leg"
  > = inject("ghost"),
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  const options = clientOptions(ghost.leg.target) as { schema: "latest" };
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion(ghost.version) as `v6.${string}`, {
    ...options,
    strict: ignoredInTest && { ignore: [...ignoredInTest, ...PENDING_KEYS[ghost.leg.target]] },
  });
}

/**
 * Records raw responses for each test in the calling `describe`, and lets `adminApi()` in those tests pass
 * through the keys in `ignore` (deliberately unmodelled, as `posts[].key`).
 */
export function liveResponses(keys: { ignore?: string[] } = {}): Pick<ResponseRecorder, "all" | "last"> {
  let current: ResponseRecorder | undefined;
  beforeEach(() => {
    current = recordResponses();
    ignoredInTest = keys.ignore ?? [];
  });
  afterEach(() => {
    current?.restore();
    ignoredInTest = undefined;
    // The drift job compares every recorded response with the client's schemas (src/drift/fields.ts).
    const file = process.env.CONFORMANCE_RESPONSES;
    if (file && current)
      appendFileSync(
        file,
        current
          .all()
          .map((r) => `${JSON.stringify(r)}\n`)
          .join(""),
      );
  });
  const active = () => {
    if (!current) throw new Error("liveResponses() is only usable inside a test");
    return current;
  };
  return { all: () => active().all(), last: (pathPart) => active().last(pathPart) };
}

/** Skips the running test, saying why, when the live Ghost predates `behaviour`. */
export function requireBehaviour(context: TestContext, behaviour: GhostBehaviour) {
  const reason = lacks(behaviour, inject("ghost").version);
  if (reason) context.skip(reason);
}

/** Skips the running test when the live Ghost's manifest lacks `route`, e.g. "GET /members/metafields/:namespace/". */
export function requireRoute(context: TestContext, route: string) {
  const { version } = inject("ghost");
  if (!manifestFor(version).has(route)) context.skip(`Ghost ${version} has no ${route}`);
}

/** Whether the live Ghost is `version` or newer, for fields only later Ghost sends. */
export function ghostAtLeast(version: string): boolean {
  return versionAtLeast(inject("ghost").version, version);
}

/** `adminApi()` typed as v6-compat, for tests of deprecated forms that v6-latest's types leave out. */
export function deprecatedApi(...args: Parameters<typeof adminApi>) {
  return adminApi(...args) as unknown as TSGhostAdminAPI<`v6.${string}`>;
}

/** Describes a client resource's live tests; a leg whose manifest lacks `GET /<resource>/` asserts the 404 instead. */
export function describeResource(resource: string, tests: () => void) {
  const { version } = inject("ghost");
  if (manifestFor(version).has(`GET /${resource}/`)) return describe(resource, tests);
  describe(resource, () => {
    test(`Ghost ${version} has no ${resource} and answers 404`, async () => {
      const api = adminApi() as unknown as Record<string, { browse(): { fetch(): Promise<unknown> } }>;
      expect(await api[resource]!.browse().fetch()).toMatchObject({ success: false, status: 404 });
    });
  });
}
