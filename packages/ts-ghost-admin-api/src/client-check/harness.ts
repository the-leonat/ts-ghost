import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { PINNED_GHOST, serveFixtures, type FixtureServer } from "./fixture-server";

export const fetchMocker = createFetchMock(vi);

export const ADMIN_KEY =
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

/**
 * Registers hooks that answer fetch from the pinned fixtures and fail the test
 * on any request no fixture matches. Returns a holder whose `api` is a fresh
 * admin client per test, built with `options`.
 */
export function useClientCheck(options?: ConstructorParameters<typeof TSGhostAdminAPI>[3]) {
  const context = {} as { api: TSGhostAdminAPI; server: FixtureServer };

  beforeEach(() => {
    fetchMocker.enableMocks();
    context.server = serveFixtures(fetchMocker, PINNED_GHOST.fixtureDir);
    context.api = new TSGhostAdminAPI(
      "https://ghost.org",
      ADMIN_KEY,
      `v${PINNED_GHOST.minor}` as `v6.${string}`,
      options,
    );
  });

  afterEach(() => {
    context.server.assertAllRequestsMatched();
    fetchMocker.resetMocks();
    fetchMocker.disableMocks();
  });

  return context;
}

/** The JSON body of the n-th request fetch received. */
export function sentBody(n: number) {
  const body = fetchMocker.mock.calls[n][1]?.body;
  return typeof body === "string" ? (JSON.parse(body) as unknown) : undefined;
}
