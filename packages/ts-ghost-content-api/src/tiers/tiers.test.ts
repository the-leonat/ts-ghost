import { afterEach, describe, expect, test, vi } from "vitest";

import { TSGhostContentAPI } from "../content-api";

/** A free tier as Ghost sends it: no price keys at all. */
const freeTier = {
  id: "6388f5e4c5b8d1000139d3b1",
  name: "Free",
  slug: "free",
  description: null,
  active: true,
  type: "free",
  welcome_page_url: null,
  created_at: "2022-12-01T12:00:00.000Z",
  updated_at: "2022-12-01T12:00:00.000Z",
  benefits: [],
  visibility: "public",
  trial_days: 0,
};
const pagination = { page: 1, limit: 15, pages: 1, total: 1, next: null, prev: null };

describe("tiers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Guards zod bumps: a Renovate branch failed this with `expected nonoptional, received undefined`.
  test("a free tier with no price keys parses when the prices are included", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ tiers: [freeTier], meta: { pagination } }))),
    );
    const api = new TSGhostContentAPI("https://ghost.org", "59d4bf56c73c04a18c867dc3ba", "v6.0");

    const result = await api.tiers.browse().include({ monthly_price: true, yearly_price: true }).fetch();

    expect(result).toMatchObject({
      success: true,
      data: [{ id: freeTier.id, monthly_price: null, yearly_price: null }],
    });
  });
});
