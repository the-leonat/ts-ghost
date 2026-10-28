import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostContentAPI } from "./content-api";

describe("content-api", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI("https://ghost.org", "59d4bf56c73c04a18c867dc3ba", "v6.0");
  });

  test("content-api", () => {
    expect(api).toBeDefined();
  });

  test("selects its schema target from the version and the schema option", () => {
    const key = "59d4bf56c73c04a18c867dc3ba";
    expect(new TSGhostContentAPI("https://ghost.org", key, "v5.130").target).toBe("v5");
    expect(api.target).toBe("v6-compat");
    expect(new TSGhostContentAPI("https://ghost.org", key, "v6.72", { schema: "latest" }).target).toBe(
      "v6-latest",
    );
    // @ts-expect-error Ghost 5 has one schema target
    expect(() => new TSGhostContentAPI("https://ghost.org", key, "v5.130", { schema: "latest" })).toThrow(
      /Ghost 6 version/,
    );
  });

  test("content-api shouldn't instantiate with an incorrect url", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI("ghost.org", "59d4bf56c73c04a18c867dc3ba", "v6.0");
      api.settings;
    });
  });

  test("content-api shouldn't instantiate with an incorrect key", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI("https://ghost.org", "a", "v6.0");
      api.settings;
    });
  });

  test("content-api shouldn't instantiate with an incorrect version", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI(
        "https://ghost.org",
        "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
        // @ts-expect-error
        "v4.0",
      );
      api.settings;
    });
  });

  test("content-api.posts", () => {
    expect(api.posts).toBeDefined();
    expect(api.posts.browse).toBeDefined();
    expect(api.posts.read).toBeDefined();
  });

  test("content-api.pages", () => {
    expect(api.pages).toBeDefined();
    expect(api.pages.browse).toBeDefined();
    expect(api.pages.read).toBeDefined();
  });

  test("content-api.tags", () => {
    expect(api.tags).toBeDefined();
    expect(api.tags.browse).toBeDefined();
    expect(api.tags.read).toBeDefined();
  });

  test("content-api.tiers", () => {
    expect(api.tiers).toBeDefined();
    expect(api.tiers.browse).toBeDefined();
    expect(api.tiers.read).toBeDefined();
  });

  test("content-api.authors", () => {
    expect(api.authors).toBeDefined();
    expect(api.authors.browse).toBeDefined();
    expect(api.authors.read).toBeDefined();
    // @ts-expect-error
    expect(api.authors.add).toBeUndefined();
    // @ts-expect-error
    expect(api.authors.edit).toBeUndefined();
    expect(api.authors).toBeDefined();
  });

  test("content-api.settings", () => {
    expect(api.settings).toBeDefined();
    expect(api.settings.fetch).toBeDefined();
    // @ts-expect-error
    expect(api.settings.read).toBeUndefined();
    // @ts-expect-error
    expect(api.settings.browse).toBeUndefined();
  });
});

describe("content-api client options", () => {
  const KEY = "59d4bf56c73c04a18c867dc3ba";
  const tag = {
    id: "1",
    name: "n",
    slug: "s",
    description: null,
    feature_image: null,
    visibility: "public",
    meta_title: null,
    meta_description: null,
    og_image: null,
    og_title: null,
    og_description: null,
    twitter_image: null,
    twitter_title: null,
    twitter_description: null,
    codeinjection_head: null,
    codeinjection_foot: null,
    canonical_url: null,
    accent_color: null,
    url: "https://ghost.org/tag/s/",
    extra: { nested: 1 },
  };
  afterEach(() => {
    vi.restoreAllMocks();
  });
  const respond = () =>
    vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(async () => new Response(JSON.stringify({ tags: [tag] })));

  test("pass through by default", async () => {
    respond();
    const result = await new TSGhostContentAPI("https://ghost.org", KEY, "v6.0").tags
      .read({ id: "1" })
      .fetch();
    expect(result).toEqual({ success: true, data: expect.objectContaining({ extra: { nested: 1 } }) });
  });

  test("fail the result with the strict option, naming the path", async () => {
    respond();
    const api = new TSGhostContentAPI("https://ghost.org", KEY, "v6.0", { strict: true });
    expect(await api.tags.read({ id: "1" }).fetch()).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("tags[0].extra") }],
    });
  });

  test("default request options apply to every request, next to the content key", async () => {
    const fetch = respond();
    const api = new TSGhostContentAPI("https://ghost.org", KEY, "v6.0", {
      defaultRequestOptions: { redirect: "manual", headers: { "X-Client": "ts-ghost-test" } },
    });
    await api.tags.read({ id: "1" }).fetch();

    const [url, init] = fetch.mock.calls[0]!;
    expect(init?.redirect).toBe("manual");
    expect(new Headers(init?.headers).get("x-client")).toBe("ts-ghost-test");
    expect(new URL(String(url)).searchParams.get("key")).toBe(KEY);
  });
});
