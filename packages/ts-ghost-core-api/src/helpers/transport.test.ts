import createFetchMock from "vitest-fetch-mock";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { APIComposer } from "../api-composer";
import { HTTPClientFactory, type HTTPClientOptions } from "./http-client";

const fetchMocker = createFetchMock(vi);

const credentials: HTTPClientOptions = {
  url: "https://ghost.org",
  key: "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  version: "v6.72",
  endpoint: "admin",
};

const tags = (factory: HTTPClientFactory) =>
  new APIComposer(
    "tags",
    {
      schema: z.object({ id: z.string(), name: z.string() }),
      identitySchema: z.object({ id: z.string() }),
      include: z.object({}),
      createSchema: z.object({ name: z.string() }),
    },
    factory,
  ).access(["browse", "read", "add", "edit", "delete"]);

/** A 204, which must have a null body (the mock's string responses cannot express one). */
const noContent = (headers: Record<string, string> = {}) => new Response(null, { status: 204, headers });

/** The headers of the n-th request fetch received, as a plain lowercase-keyed object. */
function sentHeaders(n = 0) {
  const init = fetchMocker.mock.calls[n][1] as RequestInit;
  return Object.fromEntries(new Headers(init.headers).entries());
}

describe("transport", () => {
  beforeEach(() => {
    fetchMocker.enableMocks();
    fetchMocker.mockResponse(JSON.stringify({ tags: [{ id: "1", name: "a" }] }), {
      headers: { "content-version": "v6.72" },
    });
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    fetchMocker.disableMocks();
  });

  describe("caller-supplied headers", () => {
    test("are merged with the generated ones rather than replacing them", async () => {
      await tags(new HTTPClientFactory(credentials))
        .browse()
        .fetch({ headers: { "X-Trace-Id": "abc" } });

      const headers = sentHeaders();
      expect(headers["x-trace-id"]).toBe("abc");
      expect(headers["authorization"]).toMatch(/^Ghost ey/);
      expect(headers["accept-version"]).toBe("v6.72");
      expect(headers["content-type"]).toBe("application/json");
    });

    test("replace a generated header of the same name, whatever its case", async () => {
      await tags(new HTTPClientFactory(credentials))
        .browse()
        .fetch({ headers: { "accept-version": "v6.0" } });

      const init = fetchMocker.mock.calls[0][1] as RequestInit;
      expect(Object.keys(init.headers as object).filter((name) => /^accept-version$/i.test(name))).toEqual([
        "accept-version",
      ]);
      expect(sentHeaders()["accept-version"]).toBe("v6.0");
    });
  });

  describe("client-level default request options", () => {
    const factory = () =>
      new HTTPClientFactory({
        ...credentials,
        defaultRequestOptions: { redirect: "manual", headers: { "X-Client": "ts-ghost-test" } },
      });

    test("apply to reads and to mutations, which take no per-call options", async () => {
      const api = tags(factory());
      await api.browse().fetch();
      await api.read({ id: "1" }).fetch();
      await api.add({ name: "a" });
      await api.edit("1", { name: "b" });
      fetchMocker.mockImplementationOnce(async () => noContent());
      await api.delete("1");

      expect(fetchMocker.mock.calls).toHaveLength(5);
      fetchMocker.mock.calls.forEach((call, n) => {
        expect((call[1] as RequestInit).redirect).toBe("manual");
        expect(sentHeaders(n)["x-client"]).toBe("ts-ghost-test");
        expect(sentHeaders(n)["authorization"]).toMatch(/^Ghost ey/);
      });
      expect(fetchMocker.mock.calls.map((call) => (call[1] as RequestInit).method)).toEqual([
        undefined,
        undefined,
        "POST",
        "PUT",
        "DELETE",
      ]);
    });

    test("give way to per-call options, header by header", async () => {
      await tags(factory())
        .browse()
        .fetch({ redirect: "follow", headers: { "X-Trace-Id": "abc" } });

      expect((fetchMocker.mock.calls[0][1] as RequestInit).redirect).toBe("follow");
      expect(sentHeaders()["x-client"]).toBe("ts-ghost-test");
      expect(sentHeaders()["x-trace-id"]).toBe("abc");
    });
  });

  describe("failed responses", () => {
    const proxyPage = "<html><body>502 Bad Gateway</body></html>";

    test("a browse keeps the HTTP status and the unparsed body of a non-JSON error", async () => {
      fetchMocker.mockResponseOnce(proxyPage, { status: 502, headers: { "content-type": "text/html" } });

      const result = await tags(new HTTPClientFactory(credentials)).browse().fetch();

      assert(result.success === false);
      expect(result.status).toBe(502);
      expect(result.body).toBe(proxyPage);
      expect(result.errors[0].type).toBe("FetchError");
    });

    test("a browse keeps the unparsed body of a Ghost error next to its parsed errors", async () => {
      const ghostError = JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found", id: "e1" }],
      });
      fetchMocker.mockResponseOnce(ghostError, { status: 404 });

      const result = await tags(new HTTPClientFactory(credentials)).browse().fetch();

      assert(result.success === false);
      expect(result.status).toBe(404);
      expect(result.body).toBe(ghostError);
      expect(result.errors).toEqual([{ type: "NotFoundError", message: "Resource not found" }]);
    });

    test("a read and a paginate keep them too", async () => {
      const api = tags(new HTTPClientFactory(credentials));
      fetchMocker.mockResponseOnce(proxyPage, { status: 503 });
      const read = await api.read({ id: "1" }).fetch();
      fetchMocker.mockResponseOnce(proxyPage, { status: 504 });
      const page = await api.browse().paginate();

      assert(read.success === false);
      expect([read.status, read.body]).toEqual([503, proxyPage]);
      assert(page.current.success === false);
      expect([page.current.status, page.current.body]).toEqual([504, proxyPage]);
    });

    test("a mutation and a delete keep them too", async () => {
      const api = tags(new HTTPClientFactory(credentials));
      fetchMocker.mockResponseOnce(proxyPage, { status: 502 });
      const added = await api.add({ name: "a" });
      fetchMocker.mockResponseOnce(proxyPage, { status: 502 });
      const deleted = await api.delete("1");

      assert(added.success === false);
      expect([added.status, added.body]).toEqual([502, proxyPage]);
      assert(deleted.success === false);
      expect([deleted.status, deleted.body]).toEqual([502, proxyPage]);
    });

    test("a network failure has status 0 and no body", async () => {
      fetchMocker.mockRejectOnce(new TypeError("fetch failed"));

      const result = await tags(new HTTPClientFactory(credentials)).browse().fetch();

      assert(result.success === false);
      expect(result.status).toBe(0);
      expect(result.body).toBeUndefined();
    });
  });
});
