import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { PINNED_GHOST, serveFixtures, type FixtureServer } from "./fixture-server";

const fetchMocker = createFetchMock(vi);

describe("client check: site", () => {
  let server: FixtureServer;
  let api: TSGhostAdminAPI;

  beforeEach(() => {
    fetchMocker.enableMocks();
    server = serveFixtures(fetchMocker, PINNED_GHOST.fixtureDir);
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
        icon: null,
        cover_image: "https://static.ghost.org/v5.0.0/images/publication-cover.jpg",
        accent_color: "#FF1A75",
        locale: "en",
        timezone: "Etc/UTC",
        site_uuid: "00000000-0000-4000-8000-000000000000",
        allow_external_signup: true,
        version: "6.72",
        url: "http://127.0.0.1:2369/",
      },
    });
  });
});
