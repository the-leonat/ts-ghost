import { describe, expectTypeOf, test } from "vitest";
import type { InferFetcherDataShape } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "./admin-api";

const api = new TSGhostAdminAPI("https://ghost.org", "id:secret", "v6.72");

describe("read identity forms follow the routes Ghost registers", () => {
  test("tiers are read by id only: Ghost registers no GET /tiers/slug/:slug/", () => {
    expectTypeOf(api.tiers.read).parameter(0).toEqualTypeOf<{ id: string }>();
    // @ts-expect-error a read by slug on tiers does not compile
    api.tiers.read({ slug: "default-product" });
  });

  test("offers are read by id only: Ghost registers no GET /offers/slug/:slug/", () => {
    expectTypeOf(api.offers.read).parameter(0).toEqualTypeOf<{ id: string }>();
    // @ts-expect-error a read by slug on offers does not compile
    api.offers.read({ slug: "black-friday" });
  });

  test("newsletters are read by id only: Ghost registers no GET /newsletters/slug/:slug/", () => {
    expectTypeOf(api.newsletters.read).parameter(0).toEqualTypeOf<{ id: string }>();
    // @ts-expect-error a read by slug on newsletters does not compile
    api.newsletters.read({ slug: "default-newsletter" });
  });

  test("resources Ghost does route by slug keep their read by slug", () => {
    expectTypeOf(api.posts.read).parameter(0).toEqualTypeOf<{ slug: string } | { id: string }>();
    expectTypeOf(api.pages.read).parameter(0).toEqualTypeOf<{ slug: string } | { id: string }>();
    expectTypeOf(api.tags.read).parameter(0).toEqualTypeOf<{ slug: string } | { id: string }>();
    expectTypeOf(api.labels.read).parameter(0).toEqualTypeOf<{ slug: string } | { id: string }>();
  });
});

describe("labels", () => {
  test("the member count is the one include labels offer", () => {
    api.labels.browse().include({ "count.members": true });
    api.labels.read({ slug: "vip" }).include({ "count.members": true });
    // @ts-expect-error labels offer no post count
    api.labels.browse().include({ "count.posts": true });
  });

  // Like tags' `count.posts`, a dotted include does not make `count` required.
  test("a label's member count is typed", async () => {
    const counted = await api.labels.browse().include({ "count.members": true }).fetch();
    if (counted.success) {
      expectTypeOf(counted.data[0].count).toEqualTypeOf<{ members: number } | undefined>();
    }
  });
});

// Ghost's tiers controller takes no `include` option and always sends prices
// and benefits (recorded in fixtures/ghost-6.72/tiers): a free tier omits its
// prices, every tier carries its benefits.
describe("tiers", () => {
  test("prices and benefits are typed without asking for them", async () => {
    const browsed = await api.tiers.browse().fetch();
    if (browsed.success) {
      expectTypeOf(browsed.data[0].benefits).toEqualTypeOf<string[]>();
      expectTypeOf(browsed.data[0].monthly_price).toEqualTypeOf<number | null>();
      expectTypeOf(browsed.data[0].yearly_price).toEqualTypeOf<number | null>();
    }
    const read = await api.tiers.read({ id: "x" }).fetch();
    if (read.success) {
      expectTypeOf(read.data.benefits).toEqualTypeOf<string[]>();
      expectTypeOf(read.data.monthly_price).toEqualTypeOf<number | null>();
    }
  });

  test("the deprecated price and benefit includes still compile and change no type", () => {
    const browse = api.tiers.browse().include({ monthly_price: true, yearly_price: true, benefits: true });
    const read = api.tiers
      .read({ id: "x" })
      .include({ monthly_price: true, yearly_price: true, benefits: true });
    expectTypeOf(browse.fetch).toBeFunction();
    expectTypeOf(read.fetch).toBeFunction();
    expectTypeOf<InferFetcherDataShape<typeof browse>>().toEqualTypeOf<
      InferFetcherDataShape<ReturnType<typeof api.tiers.browse>>
    >();
    expectTypeOf<InferFetcherDataShape<typeof read>>().toEqualTypeOf<
      InferFetcherDataShape<ReturnType<typeof api.tiers.read>>
    >();
    // @ts-expect-error tiers offer no other include
    api.tiers.browse().include({ members: true });
  });
});
