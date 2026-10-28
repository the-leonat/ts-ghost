import { assert, beforeAll, describe, expect, inject, test } from "vitest";

import { seedTiers } from "../seeds/tiers.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedTiers>>;
beforeAll(async () => {
  seed = await seedTiers(inject("ghost"));
});

describe("tiers", () => {
  const responses = liveResponses();

  test("browse returns the free tier, active paid tiers and an archived one", async () => {
    const result = await adminApi().tiers.browse({ limit: "all" }).fetch();

    assert(result.success);
    const bySlug = new Map(result.data.map((tier) => [tier.slug, tier]));
    expect(bySlug.get("free")).toMatchObject({ type: "free", active: true });
    expect(bySlug.get("default-product")).toMatchObject({ type: "paid", active: true });
    expect(bySlug.get(seed.full.slug)).toMatchObject({ type: "paid", active: true });
    expect(bySlug.get(seed.archived.slug)).toMatchObject({ type: "paid", active: false });
  });

  test("read by id returns Ghost's default paid tier with its prices", async () => {
    const result = await adminApi().tiers.read({ id: seed.defaultTierId }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      slug: "default-product",
      currency: "USD",
      monthly_price: 500,
      yearly_price: 5000,
      // Renamed by the first-run setup; Ghost leaves updated_at null on tier edits over the API.
      updated_at: expect.any(String),
    });
  });

  test("an edited tier reads back with every value it was given", async () => {
    const result = await adminApi().tiers.read({ id: seed.full.id }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      name: seed.full.editedName,
      description: "A tier with every field set",
      welcome_page_url: "https://example.com/welcome",
      visibility: "public",
      currency: "USD",
      monthly_price: 700,
      yearly_price: 7000,
      benefits: ["First benefit", "Second benefit"],
      trial_days: 7,
    });
  });

  test("a tier never edited has its nullable fields null", async () => {
    const result = await adminApi().tiers.read({ id: seed.bare.id }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      description: null,
      welcome_page_url: null,
      updated_at: null,
      benefits: [],
      trial_days: 0,
    });
  });

  test("a free tier has benefits but no prices, a paid one both, without includes", async () => {
    const result = await adminApi().tiers.browse({ limit: "all" }).fetch();

    assert(result.success);
    const bySlug = new Map(result.data.map((tier) => [tier.slug, tier]));
    expect(bySlug.get("free")).toMatchObject({ benefits: [], monthly_price: null, yearly_price: null });
    expect(bySlug.get("default-product")).toMatchObject({
      benefits: [],
      monthly_price: 500,
      yearly_price: 5000,
    });
    expect(responses.all().map((r) => new URL(r.url).searchParams.has("include"))).toEqual([false]);
  });

  test("the deprecated price and benefit includes are not sent", async () => {
    const include = { monthly_price: true, yearly_price: true, benefits: true } as const;
    const browsed = await adminApi().tiers.browse({ limit: "all" }).include(include).fetch();
    const read = await adminApi().tiers.read({ id: seed.full.id }).include(include).fetch();

    assert(browsed.success && read.success);
    expect(responses.all().map((r) => new URL(r.url).searchParams.has("include"))).toEqual([false, false]);
  });

  // The deprecated slug read stays callable; Ghost has no /tiers/slug/:slug/ route.
  test("the deprecated read by slug gets Ghost's 404", async () => {
    const result = await adminApi().tiers.read({ slug: "default-product" }).fetch();

    assert(!result.success);
    expect(result.status).toBe(404);
  });

  test("tiers carry no key the client's schema lacks", async () => {
    const result = await adminApi().tiers.browse({ limit: "all" }).fetch();
    expect(undeclaredKeys(result)).toEqual([]);
    expect(result.success).toBe(true);
  });
});
