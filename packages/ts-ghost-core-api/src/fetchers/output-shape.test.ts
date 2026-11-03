import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { HTTPClient } from "../helpers/http-client";
import { BrowseFetcher } from "./browse-fetcher";
import { ReadFetcher } from "./read-fetcher";

const fetchMocker = createFetchMock(vi);

const relation = z.object({ id: z.string(), url: z.string() });
const schema = z.object({
  id: z.string(),
  url: z.string(),
  slug: z.string(),
  title: z.string(),
  authors: z.array(relation).optional(),
  tags: z.array(relation).optional(),
  primary_author: relation.optional(),
  primary_tag: relation.nullish(),
});
const include = z.object({ authors: z.literal(true).optional(), tags: z.literal(true).optional() });
const config = { schema, output: schema, include };

// Ghost rejects a relation in `fields`, wants its include, and blanks relations without `id` and `url`.
describe("fields naming relations", () => {
  let httpClient: HTTPClient;
  beforeEach(() => {
    httpClient = new HTTPClient({
      url: "https://ghost.org",
      key: "1234",
      version: "v6.0",
      endpoint: "content",
    });
    fetchMocker.enableMocks();
    fetchMocker.doMock(JSON.stringify({ errors: [{ type: "E", message: "m" }] }));
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  const browse = () => new BrowseFetcher("posts", config, { browseParams: {} }, httpClient);
  const read = () => new ReadFetcher("posts", config, { identity: { id: "abc" } }, httpClient);
  const sent = async (fetcher: { fetch(): Promise<unknown> }) => {
    await fetcher.fetch();
    const params = new URL(String(fetchMocker.mock.calls.at(-1)?.[0])).searchParams;
    return { fields: params.get("fields"), include: params.get("include") };
  };

  test.each([
    ["browse", browse],
    ["read", read],
  ] as const)("%s: a selected relation is sent as an include, with id and url", async (_, fetcher) => {
    expect(await sent(fetcher().fields({ slug: true, authors: true }))).toEqual({
      fields: "slug,id,url",
      include: "authors",
    });
  });

  test("a primary key stays in fields and brings its relation", async () => {
    expect(await sent(read().fields({ slug: true, primary_tag: true }))).toEqual({
      fields: "slug,primary_tag,id,url",
      include: "tags",
    });
  });

  test("only relations selected still narrows the record", async () => {
    expect(await sent(browse().fields({ tags: true }))).toEqual({ fields: "id,url", include: "tags" });
  });

  test("an include and a selected relation are sent once", async () => {
    const fetcher = read().include({ authors: true, tags: true }).fields({ slug: true, authors: true });
    const { fields, include: sentInclude } = await sent(fetcher);
    expect(fields).toBe("slug,id,url");
    expect(sentInclude?.split(",").sort()).toEqual(["authors", "tags"]);
  });

  test("no relation asked for sends plain fields and no include", async () => {
    expect(await sent(read().fields({ slug: true, title: true }))).toEqual({
      fields: "slug,title",
      include: null,
    });
  });

  test("id and url are only added when the resource has them", async () => {
    const noUrl = z.object({ id: z.string(), email: z.string(), tiers: z.array(z.string()).optional() });
    const members = {
      schema: noUrl,
      output: noUrl,
      include: z.object({ tiers: z.literal(true).optional() }),
    };
    const fetcher = new ReadFetcher("members", members, { identity: { id: "abc" } }, httpClient);
    expect(await sent(fetcher.fields({ email: true, tiers: true }))).toEqual({
      fields: "email,id",
      include: "tiers",
    });
  });

  test("including a relation makes its primary key required", async () => {
    const record = { id: "1", url: "u", slug: "s", title: "t", authors: [], tags: [] };
    fetchMocker.resetMocks();
    fetchMocker.doMock(JSON.stringify({ posts: [record] }));
    expect((await read().include({ authors: true }).fetch()).success).toBe(false);
    expect((await read().fetch()).success).toBe(true);
  });

  test("a null primary_tag on included tags parses", async () => {
    const record = { id: "1", url: "u", slug: "s", title: "t", tags: [], primary_tag: null };
    fetchMocker.resetMocks();
    fetchMocker.doMock(JSON.stringify({ posts: [record] }));
    expect((await read().include({ tags: true }).fetch()).success).toBe(true);
  });
});
