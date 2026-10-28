import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { HTTPClient } from "../helpers/http-client";
import { BasicFetcher } from "./basic-fetcher";
import { BrowseFetcher } from "./browse-fetcher";
import { DeleteFetcher } from "./delete-fetcher";
import { MutationFetcher } from "./mutation-fetcher";
import { ReadFetcher } from "./read-fetcher";

const fetchMocker = createFetchMock(vi);

const schema = z.object({ id: z.string(), title: z.string() });
const meta = { pagination: { page: 1, limit: 15, pages: 1, total: 1, next: null, prev: null } };

describe("a response that doesn't match the schema", () => {
  let httpClient: HTTPClient;

  beforeEach(() => {
    httpClient = new HTTPClient({
      url: "https://ghost.org",
      key: "1234",
      version: "v6.0",
      endpoint: "content",
    });
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    fetchMocker.resetMocks();
  });

  const browse = () =>
    new BrowseFetcher("posts", { schema, output: schema, include: z.object({}) }, {}, httpClient);

  test("browse returns a ResponseSchemaError naming the failing path", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [{ id: "1", title: null }], meta }));
    const result = await browse().fetch();
    expect(result).toMatchObject({ success: false, status: 200 });
    if (result.success) return;
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]!.type).toBe("ResponseSchemaError");
    expect(result.errors[0]!.message).toContain("posts[0].title");
  });

  test("paginate returns the same error as its current page", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [{ id: "1" }], meta }));
    const { current, next } = await browse().paginate();
    expect(next).toBeUndefined();
    expect(current).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].title") }],
    });
  });

  test("a Ghost error item without type and message becomes a ResponseSchemaError carrying the item", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ errors: [{ code: "WEIRD" }] }), { status: 500 });
    const result = await browse().fetch();
    expect(result).toMatchObject({ success: false, status: 500 });
    if (result.success) return;
    expect(result.errors).toEqual([
      { type: "ResponseSchemaError", message: expect.stringContaining('errors[0]: {"code":"WEIRD"}') },
    ]);
    expect(result.body).toBe(JSON.stringify({ errors: [{ code: "WEIRD" }] }));
  });

  test("Ghost's usable error items are kept next to a ResponseSchemaError for each unusable one", async () => {
    const ghostError = { type: "ValidationError", message: "Title is required" };
    fetchMocker.doMockOnce(JSON.stringify({ errors: [ghostError, { code: "WEIRD" }] }), { status: 422 });
    expect(await browse().fetch()).toMatchObject({
      success: false,
      status: 422,
      errors: [ghostError, { type: "ResponseSchemaError", message: expect.stringContaining("errors[1]") }],
    });
  });

  test("an errors value that is not a list becomes one ResponseSchemaError", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ errors: "boom" }), { status: 500 });
    expect(await browse().fetch()).toMatchObject({
      success: false,
      status: 500,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining('errors: "boom"') }],
    });
  });

  test("read returns a ResponseSchemaError naming the failing path", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ posts: [{ id: "1", title: 7 }] }));
    const read = new ReadFetcher(
      "posts",
      { schema, output: schema, include: z.object({}) },
      { identity: { id: "1" } },
      httpClient,
    );
    expect(await read.fetch()).toMatchObject({
      success: false,
      status: 200,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].title") }],
    });
  });

  test("read of a body without the resource key returns an error result", async () => {
    fetchMocker.doMockOnce(JSON.stringify({}));
    const read = new ReadFetcher(
      "posts",
      { schema, output: schema, include: z.object({}) },
      { identity: { id: "1" } },
      httpClient,
    );
    expect(await read.fetch()).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0]") }],
    });
  });

  test.each(["POST", "PUT"] as const)(
    "%s (add/edit) returns a ResponseSchemaError naming the failing path",
    async (method) => {
      fetchMocker.doMockOnce(JSON.stringify({ posts: [{ id: "1", title: false }] }));
      const params = method === "PUT" ? { id: "1" } : undefined;
      const mutation = new MutationFetcher(
        "posts",
        { output: schema },
        params,
        { method, body: { title: "t" } },
        httpClient,
      );
      expect(await mutation.submit()).toMatchObject({
        success: false,
        status: 200,
        errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("posts[0].title") }],
      });
    },
  );

  test("add with a malformed Ghost error body returns an error result", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ errors: [{ type: "ValidationError" }] }), { status: 422 });
    const mutation = new MutationFetcher(
      "posts",
      { output: schema },
      undefined,
      { method: "POST", body: {} },
      httpClient,
    );
    expect(await mutation.submit()).toMatchObject({
      success: false,
      status: 422,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("errors[0]") }],
    });
  });

  test("delete with a malformed Ghost error body returns an error result", async () => {
    const body = JSON.stringify({ errors: [{ message: "gone" }] });
    fetchMocker.doMockOnce(body, { status: 404 });
    expect(await new DeleteFetcher("posts", { id: "1" }, httpClient).submit()).toEqual({
      success: false,
      status: 404,
      body,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining('errors[0]: {"message":"gone"}') }],
    });
  });

  test("a single-object fetch (site, settings) returns a ResponseSchemaError naming the failing path", async () => {
    fetchMocker.doMockOnce(JSON.stringify({ site: { title: 1 } }));
    const site = new BasicFetcher("site", { output: z.object({ title: z.string() }) }, httpClient);
    expect(await site.fetch()).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", message: expect.stringContaining("site.title") }],
    });
  });
});
