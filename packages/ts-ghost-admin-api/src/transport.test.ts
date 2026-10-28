import { afterEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

const site = { title: "t", description: "d", logo: null, version: "6.72", url: "https://ghost.org/" };
const siteResponse = (version: string) =>
  new Response(JSON.stringify({ site }), { headers: { "content-version": version } });

describe("admin-api transport", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("default request options apply to every request, a delete included, next to authentication", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(async () => siteResponse("v6.72"))
      .mockImplementationOnce(async () => new Response(null, { status: 204 }));
    const api = new TSGhostAdminAPI("https://ghost.org", KEY, "v6.72", {
      defaultRequestOptions: { redirect: "manual", headers: { "X-Client": "ts-ghost-test" } },
    });

    expect((await api.site.fetch()).success).toBe(true);
    expect(await api.tags.delete("1")).toEqual({ success: true });

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    for (const [, init] of fetchSpy.mock.calls) {
      const headers = new Headers(init?.headers);
      expect(init?.redirect).toBe("manual");
      expect(headers.get("x-client")).toBe("ts-ghost-test");
      expect(headers.get("authorization")).toMatch(/^Ghost ey/);
    }
  });

  test("getServerVersion() is the content-version of the latest response, undefined before one", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(async () => siteResponse("v6.72"))
      .mockImplementationOnce(async () => siteResponse("v6.73"));
    const api = new TSGhostAdminAPI("https://ghost.org", KEY, "v6.72");

    expect(api.getServerVersion()).toBeUndefined();
    await api.site.fetch();
    expect(api.getServerVersion()).toBe("v6.72");
    await api.site.fetch();
    expect(api.getServerVersion()).toBe("v6.73");
  });
});
