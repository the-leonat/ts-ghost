import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { json, stubFetch } from "../stub-fetch";
import { adminPostsCreateSchema } from "./posts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("posts api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key =
    process.env.VITE_GHOST_ADMIN_API_KEY ||
    "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
  const api = new TSGhostAdminAPI(url, key, "v6.0");
  test(".browse() refuses a filter on an unknown field", () => {
    expect(api.posts).toBeDefined();
    expect(1).toEqual(1);
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slugg:test" })).toThrow();
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slug:test,foo:-[bar,baz]" })).toThrow();
    expect(api.posts.browse({ filter: "slug:test,tags:-[bar,baz]" })).toBeDefined();
    expect(api.posts.browse({ filter: "slug:test,tags:[bar,baz]" })).toBeDefined();
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slug:test,food:-[bar,baz]" })).toThrow();
  });
});

describe("posts and pages input keys Ghost drops", () => {
  const api = new TSGhostAdminAPI("https://my-ghost-blog.com", KEY, "v6.0");
  const notFound = json({ errors: [{ type: "NotFoundError", message: "x" }] });

  const sent = (fetch: ReturnType<typeof stubFetch>) => {
    const [url, init] = fetch.mock.calls.at(-1)!;
    const body = JSON.parse(String(init?.body)) as Record<string, Record<string, unknown>[]>;
    return { url: new URL(String(url)), body: Object.values(body)[0]![0] };
  };
  const dropped = { locale: "de", mobiledoc: "{}" };
  const updated_at = new Date("2026-01-01T00:00:00.000Z");

  test("posts.add sends neither locale, mobiledoc nor the newsletter body key", async () => {
    const fetch = stubFetch([notFound]);
    await api.posts.add({ title: "t", ...dropped, newsletter: { slug: "weekly" } });
    expect(sent(fetch).body).toEqual({ title: "t" });
  });

  test("posts.edit sends neither locale, mobiledoc nor the newsletter body key", async () => {
    const fetch = stubFetch([notFound]);
    await api.posts.edit("1", { title: "t", ...dropped, newsletter: { slug: "weekly" }, updated_at });
    expect(sent(fetch).body).toEqual({ title: "t", updated_at: updated_at.toISOString() });
  });

  test("pages.add sends neither locale nor mobiledoc", async () => {
    const fetch = stubFetch([notFound]);
    await api.pages.add({ title: "t", ...dropped });
    expect(sent(fetch).body).toEqual({ title: "t" });
  });

  test("pages.edit sends neither locale nor mobiledoc", async () => {
    const fetch = stubFetch([notFound]);
    await api.pages.edit("1", { title: "t", ...dropped, updated_at });
    expect(sent(fetch).body).toEqual({ title: "t", updated_at: updated_at.toISOString() });
  });

  test("edit's newsletter option, which schedules an email-only post, is sent as ?newsletter=", async () => {
    const fetch = stubFetch([notFound]);
    await api.posts.edit(
      "1",
      { email_only: true, status: "scheduled", updated_at },
      { newsletter: "weekly" },
    );
    expect(sent(fetch).url.searchParams.get("newsletter")).toBe("weekly");
    expect(sent(fetch).body).toEqual({
      email_only: true,
      status: "scheduled",
      updated_at: updated_at.toISOString(),
    });
  });
});

describe("posts schema validation", () => {
  test("an email_only scheduled post without a newsletter passes: Ghost decides, as edit takes the option", () => {
    const post = { title: "Test Post", email_only: true, status: "scheduled" as const };
    expect(adminPostsCreateSchema.safeParse(post).success).toBe(true);
  });

  test("a scheduled post that is not email-only passes without a newsletter", () => {
    const validPost = {
      title: "Test Post",
      email_only: false,
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });

  test("a scheduled post without email_only passes without a newsletter", () => {
    const validPost = {
      title: "Test Post",
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });
});
