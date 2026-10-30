import createFetchMock from "vitest-fetch-mock";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { HTTPClient } from "../helpers/http-client";
import type { StrictOption } from "../helpers/response-schema";
import { BrowseFetcher } from "./browse-fetcher";
import { MutationFetcher } from "./mutation-fetcher";
import { ReadFetcher } from "./read-fetcher";

const fetchMocker = createFetchMock(vi);

const schema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.object({ name: z.string() }),
  tags: z.array(z.object({ slug: z.string() })),
});
const meta = { pagination: { page: 1, limit: 15, pages: 1, total: 1, next: null, prev: null } };
const post = {
  id: "1",
  title: "T",
  extra: 1,
  author: { name: "A", bio: "B" },
  tags: [{ slug: "s", color: "red" }],
};

const httpClient = new HTTPClient({
  url: "https://ghost.org",
  key: "1234",
  version: "v6.0",
  endpoint: "content",
});

beforeEach(() => {
  fetchMocker.enableMocks();
});
afterEach(() => {
  fetchMocker.resetMocks();
  fetchMocker.disableMocks();
});

describe("keys Ghost sends that the schema doesn't declare", () => {
  const browse = (strict?: StrictOption) =>
    new BrowseFetcher("posts", { schema, output: schema, include: z.object({}), strict }, {}, httpClient);

  test("browse passes them through at any depth by default", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const result = await browse().fetch();
    expect(result).toEqual({ success: true, meta, data: [post] });
  });

  test("strict mode fails browse with a ResponseSchemaError naming each path", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const result = await browse(true).fetch();
    expect(result).toMatchObject({ success: false, status: 200 });
    assert(!result.success);
    expect(result.errors.map(({ type, kind, path }) => ({ type, kind, path }))).toEqual(
      ["posts[0].extra", "posts[0].author.bio", "posts[0].tags[0].color"].map((path) => ({
        type: "ResponseSchemaError",
        kind: "undeclared",
        path,
      })),
    );
  });

  test("strict mode passes through the paths it ignores, with [] for any index", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const ignore = ["posts[].extra", "posts[].author.bio", "posts[].tags[].color"];
    const result = await browse({ ignore }).fetch();
    expect(result).toEqual({ success: true, meta, data: [post] });
  });

  describe("with a fields selection Ghost ignores", () => {
    const narrowed = (strict?: StrictOption) => browse(strict).fields({ id: true });

    test("unselected declared keys stay out while undeclared ones pass through", async () => {
      fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
      const result = await narrowed().fetch();
      expect(result).toEqual({ success: true, meta, data: [{ id: "1", extra: 1 }] });
    });

    test("strict mode fails only on the undeclared keys", async () => {
      fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
      const result = await narrowed(true).fetch();
      expect(result).toMatchObject({
        success: false,
        errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].extra") }],
      });
      assert(!result.success);
      expect(result.errors).toHaveLength(1);
    });
  });

  const read = (strict?: StrictOption) =>
    new ReadFetcher(
      "posts",
      { schema, output: schema, include: z.object({}), strict },
      { identity: { id: "1" } },
      httpClient,
    );
  const edit = (strict?: StrictOption) =>
    new MutationFetcher(
      "posts",
      { output: schema, strict },
      { id: "1" },
      { method: "PUT", body: { title: "T" } },
      httpClient,
    );

  test.each([
    ["read", () => read().fetch()],
    ["edit", () => edit().submit()],
  ])("%s passes them through by default", async (_, call) => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post] }));
    expect(await call()).toEqual({ success: true, data: post });
  });

  test.each([
    ["read", () => read(true).fetch()],
    ["edit", () => edit(true).submit()],
  ])("strict mode fails %s naming the path", async (_, call) => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [{ ...post, author: { name: "A" }, tags: [] }] }));
    expect(await call()).toEqual({
      success: false,
      status: 200,
      body: expect.any(String),
      errors: [
        {
          type: "ResponseSchemaError",
          kind: "undeclared",
          path: "posts[0].extra",
          message: expect.stringContaining("posts[0].extra"),
        },
      ],
    });
  });
});
