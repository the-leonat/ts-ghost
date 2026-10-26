import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { serveFixtures, type FixtureServer } from "./fixture-server";

const fetchMocker = createFetchMock(vi);

describe("client check: site", () => {
  let server: FixtureServer;
  let api: TSGhostAdminAPI;

  beforeEach(() => {
    fetchMocker.enableMocks();
    server = serveFixtures(fetchMocker, "ghost-6.72");
    api = new TSGhostAdminAPI(
      "https://ghost.org",
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v6.72",
    );
  });

  afterEach(() => {
    server.assertAllRequestsMatched();
    fetchMocker.disableMocks();
  });

  test("GET /site/ returns the recorded site", async () => {
    const result = await api.site.fetch();

    expect(result).toEqual({
      success: true,
      data: {
        title: "Ghost",
        description: "Thoughts, stories and ideas",
        logo: null,
        version: "6.72",
        url: "http://127.0.0.1:2369/",
      },
    });
  });
});
