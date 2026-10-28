import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { ReadFetcher } from "../fetchers/read-fetcher";
import { HTTPClient } from "./http-client";
import { ignoredInclude, sparseInclude } from "./includes";

const fetchMocker = createFetchMock(vi);

const schema = z.object({
  id: z.string(),
  tiers: z.array(z.string()).optional(),
  metafields: z.record(z.string(), z.unknown()).optional(),
});
const include = z.object({
  tiers: z.literal(true).optional(),
  benefits: ignoredInclude(),
  metafields: sparseInclude(),
});
const config = { schema, output: schema, include };
const meta = { pagination: { pages: 1, page: 1, limit: 15, total: 2, prev: null, next: null } };
const sentUrls = () => fetchMocker.mock.calls.map(([url]) => new URL(String(url)).searchParams);

describe("include keys", () => {
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
  afterEach(() => fetchMocker.resetMocks());

  test("an ignored include is accepted but never sent", async () => {
    fetchMocker.mockResponse(JSON.stringify({ tiers: [{ id: "1", tiers: [] }], meta }));
    await new ReadFetcher("tiers", config, { identity: { id: "1" } }, httpClient)
      .include({ benefits: true, tiers: true })
      .fetch();
    await new BrowseFetcher("tiers", config, {}, httpClient).include({ benefits: true }).fetch();

    const [read, browse] = sentUrls();
    expect(read?.get("include")).toBe("tiers");
    expect(browse?.has("include")).toBe(false);
  });

  test("a sparse include is sent but does not make its key required", async () => {
    fetchMocker.mockResponse(
      JSON.stringify({ members: [{ id: "1" }, { id: "2", metafields: { a: 1 } }], meta }),
    );
    const result = await new BrowseFetcher("members", config, {}, httpClient)
      .include({ metafields: true })
      .fetch();

    expect(sentUrls()[0]?.get("include")).toBe("metafields");
    expect(result).toMatchObject({ success: true, data: [{ id: "1" }, { id: "2", metafields: { a: 1 } }] });
  });
});
