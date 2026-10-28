import { afterEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

// PhilDL/ts-ghost#320: an explicit include replaces Ghost's default `authors,tags`, so authors went missing.
describe("posts and pages includes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const sentIncludes = (fetch: { mock: { calls: unknown[][] } }) =>
    new URL(String(fetch.mock.calls.at(-1)?.[0])).searchParams.get("include")?.split(",").sort();

  test("an include always asks for authors, which the post and page schemas require", async () => {
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async () => new Response(JSON.stringify({ errors: [{ type: "E", message: "m" }] })),
      );
    const api = new TSGhostAdminAPI("https://ghost.org", KEY, "v6.0");

    await api.posts.read({ slug: "s" }).include({ tags: true }).fetch();
    expect(sentIncludes(fetch)).toEqual(["authors", "tags"]);
    await api.pages.browse().include({ tiers: true }).fetch();
    expect(sentIncludes(fetch)).toEqual(["authors", "tiers"]);
  });

  test("an email-only post Ghost has sent reads with status sent", async () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const api = new TSGhostAdminAPI("https://ghost.org", KEY, "v6.0");
    fetch.mockImplementationOnce(
      async () => new Response(JSON.stringify({ posts: [{ id: "1", status: "sent" }] })),
    );
    expect(await api.posts.read({ slug: "s" }).fields({ id: true, status: true }).fetch()).toEqual({
      success: true,
      data: { id: "1", status: "sent" },
    });
  });
});
