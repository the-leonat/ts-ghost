import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { HTTPClient } from "./http-client";

const fetchMocker = createFetchMock(vi);

const schema = z.object({
  id: z.string(),
  tiers: z.array(z.string()).optional(),
  metafields: z.record(z.string(), z.unknown()).optional(),
});
const include = z.object({
  tiers: z.literal(true).optional(),
  metafields: z.literal(true).optional().meta({ omittedWhenEmpty: true }),
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
  afterEach(() => {
    fetchMocker.resetMocks();
    fetchMocker.disableMocks();
  });

  test("an include flagged omittedWhenEmpty is sent but does not make its key required", async () => {
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
