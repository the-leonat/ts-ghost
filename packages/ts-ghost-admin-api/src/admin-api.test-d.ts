import { describe, expectTypeOf, test } from "vitest";

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
