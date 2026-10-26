import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { fixtureId, loadFixtures, serveFixtures } from "./fixture-server";

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

  const created = (path: string, status: number, body: unknown, headers: Record<string, string> = {}) => ({
    request: { method: "GET", path, query: {} },
    response: { status, headers: { "content-version": "v6.72", ...headers }, body },
  });

  test("resolves a named id marker to one id, in request paths, bodies and embedded in strings", async () => {
    const server = serveFixtures(fetchMocker, [
      created(
        "/ghost/api/admin/x/{{anyObjectId:x.created}}/",
        200,
        { x: [{ id: "{{anyObjectId:x.created}}", other: "{{anyObjectId:y.created}}" }] },
        { location: "http://127.0.0.1:2369/ghost/api/admin/x/{{anyObjectId:x.created}}/" },
      ),
    ]);
    const id = fixtureId("x.created");

    const response = await fetch(`https://ghost.org/ghost/api/admin/x/${id}/`);

    expect(id).toMatch(/^[a-f0-9]{24}$/);
    expect(await response.json()).toEqual({ x: [{ id, other: fixtureId("y.created") }] });
    expect(fixtureId("y.created")).not.toBe(id);
    expect(response.headers.get("location")).toBe(`http://127.0.0.1:2369/ghost/api/admin/x/${id}/`);
    server.assertAllRequestsMatched();
  });

  test("resolves every marker the recorder writes to a value of its shape", async () => {
    serveFixtures(fetchMocker, [
      created("/ghost/api/admin/x/", 200, {
        id: "{{anyObjectId}}",
        uuid: "{{anyUuid}}",
        at: "{{anyISODateTime}}",
        atTZ: "{{anyISODateTimeWithTZ}}",
        hash: "{{publicHash}}",
        preview: "http://127.0.0.1:2369/p/{{anyUuid}}/",
      }),
    ]);

    const body = await (await fetch("https://ghost.org/ghost/api/admin/x/")).json();

    expect(body.id).toMatch(/^[a-f0-9]{24}$/);
    expect(body.uuid).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/);
    expect(body.at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000Z$/);
    expect(body.atTZ).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000\+\d{2}:\d{2}$/);
    expect(body.hash).toMatch(/^[a-z0-9]{30}$/);
    expect(body.preview).toBe(`http://127.0.0.1:2369/p/${body.uuid}/`);
  });

  test("leaves recorded content that merely uses braces alone", async () => {
    serveFixtures(fetchMocker, [
      created("/ghost/api/admin/x/", 200, { html: '<p class="{{post_class}}">' }),
    ]);

    const body = await (await fetch("https://ghost.org/ghost/api/admin/x/")).json();

    expect(body.html).toBe('<p class="{{post_class}}">');
  });

  test("answers a recorded 204 with an empty body", async () => {
    serveFixtures(fetchMocker, [created("/ghost/api/admin/x/", 204, null)]);

    const response = await fetch("https://ghost.org/ghost/api/admin/x/");

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});
