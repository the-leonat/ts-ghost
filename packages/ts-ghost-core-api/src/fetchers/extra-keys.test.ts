import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { HTTPClient, type HTTPClientOptions } from "../helpers/http-client";
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

const client = (options: Partial<HTTPClientOptions> = {}) =>
  new HTTPClient({
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
    ...options,
  });

beforeEach(() => {
  fetchMocker.enableMocks();
});
afterEach(() => {
  fetchMocker.resetMocks();
});

describe("keys Ghost sends that the schema doesn't declare", () => {
  const browse = (httpClient: HTTPClient) =>
    new BrowseFetcher("posts", { schema, output: schema, include: z.object({}) }, {}, httpClient);

  test("browse passes them through at any depth by default", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const result = await browse(client()).fetch();
    expect(result).toEqual({ success: true, meta, data: [post] });
  });

  test("strict mode fails browse with a ResponseSchemaError naming each path", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const result = await browse(client({ strict: true })).fetch();
    expect(result).toMatchObject({ success: false, status: 200 });
    if (result.success) return;
    expect(result.errors.map((e) => e.type)).toEqual(Array(3).fill("ResponseSchemaError"));
    expect(result.errors.map((e) => e.message.match(/at (\S+):/)?.[1])).toEqual([
      "posts[0].extra",
      "posts[0].author.bio",
      "posts[0].tags[0].color",
    ]);
  });

  test("strict mode passes through the paths it ignores, with [] for any index", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
    const ignore = ["posts[].extra", "posts[].author.bio", "posts[].tags[].color"];
    const result = await browse(client({ strict: { ignore } })).fetch();
    expect(result).toEqual({ success: true, meta, data: [post] });
  });

  describe("with a fields selection Ghost ignores", () => {
    const narrowed = (httpClient: HTTPClient) => browse(httpClient).fields({ id: true });

    test("unselected declared keys stay out while undeclared ones pass through", async () => {
      fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
      const result = await narrowed(client()).fetch();
      expect(result).toEqual({ success: true, meta, data: [{ id: "1", extra: 1 }] });
    });

    test("strict mode fails only on the undeclared keys", async () => {
      fetchMocker.doMockOnce(JSON.stringify({ posts: [post], meta }));
      const result = await narrowed(client({ strict: true })).fetch();
      expect(result).toMatchObject({
        success: false,
        errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].extra") }],
      });
      if (!result.success) expect(result.errors).toHaveLength(1);
    });
  });

  const read = (httpClient: HTTPClient) =>
    new ReadFetcher(
      "posts",
      { schema, output: schema, include: z.object({}) },
      { identity: { id: "1" } },
      httpClient,
    );
  const edit = (httpClient: HTTPClient) =>
    new MutationFetcher(
      "posts",
      { output: schema },
      { id: "1" },
      { method: "PUT", body: { title: "T" } },
      httpClient,
    );

  test.each([
    ["read", () => read(client()).fetch()],
    ["edit", () => edit(client()).submit()],
  ])("%s passes them through by default", async (_, call) => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [post] }));
    expect(await call()).toEqual({ success: true, data: post });
  });

  test.each([
    ["read", () => read(client({ strict: true })).fetch()],
    ["edit", () => edit(client({ strict: true })).submit()],
  ])("strict mode fails %s naming the path", async (_, call) => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [{ ...post, author: { name: "A" }, tags: [] }] }));
    expect(await call()).toEqual({
      success: false,
      status: 200,
      body: expect.any(String),
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].extra") }],
    });
  });
});
