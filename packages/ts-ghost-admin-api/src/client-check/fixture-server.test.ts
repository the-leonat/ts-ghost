import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { loadFixtures, serveFixtures } from "./fixture-server";

const fetchMocker = createFetchMock(vi);

describe("fixture server", () => {
  let api: TSGhostAdminAPI;

  beforeEach(() => {
    fetchMocker.enableMocks();
    api = new TSGhostAdminAPI(
      "https://ghost.org",
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v6.72",
    );
  });

  afterEach(() => {
    fetchMocker.disableMocks();
  });

  test("fails closed on a request no fixture matches, reporting the request it received", async () => {
    const [site] = loadFixtures("ghost-6.72").filter((f) => f.request.path === "/ghost/api/admin/site/");
    const altered = { ...site, request: { ...site.request, path: "/ghost/api/admin/sites/" } };
    const server = serveFixtures(fetchMocker, [altered]);

    const result = await api.site.fetch();

    expect(result.success).toBe(false);
    expect(() => server.assertAllRequestsMatched()).toThrow(
      "No fixture matches GET /ghost/api/admin/site/; nearest recorded: GET /ghost/api/admin/sites/",
    );
  });

  test("matches the query regardless of parameter order", async () => {
    const [site] = loadFixtures("ghost-6.72").filter((f) => f.request.path === "/ghost/api/admin/site/");
    const server = serveFixtures(fetchMocker, [
      { ...site, request: { ...site.request, path: "/ghost/api/admin/x/", query: { b: "2", a: "1" } } },
    ]);

    const response = await fetch("https://ghost.org/ghost/api/admin/x/?b=2&a=1");

    expect(response.status).toBe(200);
    server.assertAllRequestsMatched();
  });
});
