import { afterEach, beforeEach, inject, type ProvidedContext } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { clientVersion } from "../ghost/pin.ts";
import { recordResponses, type ResponseRecorder } from "../unknown-keys.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

/** The running test's `liveResponses({ ignore })`; undefined outside one (e.g. seeding in hooks). */
let ignoredInTest: string[] | undefined;

/**
 * Public admin-api client against the live Ghost. Inside a `liveResponses()` test it is strict: a key its schema
 * lacks fails the result unless `ignore` or PENDING_KEYS lists it. `ghost` defaults to the injected one.
 */
export function adminApi(
  key: "integration" | "staff" = "integration",
  ghost: Pick<ProvidedContext["ghost"], "url" | "integrationKey" | "staffToken"> = inject("ghost"),
) {
  const apiKey = key === "integration" ? ghost.integrationKey : ghost.staffToken;
  return new TSGhostAdminAPI(ghost.url, apiKey, clientVersion(), {
    strict: ignoredInTest && { ignore: [...ignoredInTest, ...PENDING_KEYS] },
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
  });
  const active = () => {
    if (!current) throw new Error("liveResponses() is only usable inside a test");
    return current;
  };
  return { all: () => active().all(), last: (pathPart) => active().last(pathPart) };
}
