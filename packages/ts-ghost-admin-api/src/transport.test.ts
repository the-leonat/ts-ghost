import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";
import { json, stubFetch } from "./stub-fetch";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

const site = {
  title: "t",
  description: "d",
  logo: null,
  icon: null,
  cover_image: null,
  accent_color: null,
  locale: "en",
  version: "6.72",
  url: "https://ghost.org/",
  site_uuid: "3a6509ac-c05d-4ab0-b201-b09512b9ad72",
  allow_external_signup: true,
};
const withBrand = json({ site: { ...site, brand: { color: "#fff" } } });

describe("admin-api transport", () => {
  test("default request options apply to every request, a delete included, next to authentication", async () => {
    const fetchSpy = stubFetch([
      json({ site }, { headers: { "content-version": "v6.72" } }),
      () => new Response(null, { status: 204 }),
    ]);
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

  test("keys the schema doesn't declare pass through by default", async () => {
    stubFetch([withBrand]);
    const result = await new TSGhostAdminAPI("https://ghost.org", KEY, "v6.72").site.fetch();
    expect(result).toEqual({ success: true, data: { ...site, brand: { color: "#fff" } } });
  });

  test("the strict option fails a result carrying an undeclared key, naming its path", async () => {
    stubFetch([withBrand]);
    const api = new TSGhostAdminAPI("https://ghost.org", KEY, "v6.72", { strict: true });
    expect(await api.site.fetch()).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("site.brand") }],
    });
  });
});
