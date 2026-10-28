import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { adminPostsCreateSchema } from "./posts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("posts api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key =
    process.env.VITE_GHOST_ADMIN_API_KEY ||
    "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
  const api = new TSGhostAdminAPI(url, key, "v6.0");
  test(".browse() params shouldnt accept invalid params", () => {
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
  const fetch = vi.spyOn(globalThis, "fetch");
  beforeEach(() => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ type: "NotFoundError", message: "x" }] })),
    );
  });
  afterAll(() => fetch.mockRestore());

  const sent = () => {
    const [url, init] = fetch.mock.calls.at(-1)!;
    const body = JSON.parse(String(init?.body)) as Record<string, Record<string, unknown>[]>;
    return { url: new URL(String(url)), body: Object.values(body)[0]![0] };
  };
  const dropped = { locale: "de", mobiledoc: "{}" };
  const updated_at = new Date("2026-01-01T00:00:00.000Z");

  test("posts.add and posts.edit accept locale, mobiledoc and the newsletter body key but send none", async () => {
    await api.posts.add({ title: "t", ...dropped, newsletter: { slug: "weekly" } });
    expect(sent().body).toEqual({ title: "t" });
    await api.posts.edit("1", { title: "t", ...dropped, newsletter: { slug: "weekly" }, updated_at });
    expect(sent().body).toEqual({ title: "t", updated_at: updated_at.toISOString() });
  });

  test("pages.add and pages.edit accept locale and mobiledoc but send neither", async () => {
    await api.pages.add({ title: "t", ...dropped });
    expect(sent().body).toEqual({ title: "t" });
    await api.pages.edit("1", { title: "t", ...dropped, updated_at });
    expect(sent().body).toEqual({ title: "t", updated_at: updated_at.toISOString() });
  });

  test("an email-only post is scheduled through edit's newsletter option, which is sent as ?newsletter=", async () => {
    await api.posts.edit(
      "1",
      { email_only: true, status: "scheduled", updated_at },
      { newsletter: "weekly" },
    );
    expect(sent().url.searchParams.get("newsletter")).toBe("weekly");
    expect(sent().body).toEqual({
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

  test("non-email_only scheduled post without newsletter should succeed", () => {
    const validPost = {
      title: "Test Post",
      email_only: false,
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });

  test("scheduled post without email_only field and without newsletter should succeed", () => {
    const validPost = {
      title: "Test Post",
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });
});
