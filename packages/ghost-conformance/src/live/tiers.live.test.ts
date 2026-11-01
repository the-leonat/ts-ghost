// Live: the tiers schemas, shape and nullability.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminSchemas } from "@ts-ghost/admin-api";

import { seedTiers } from "../seeds/tiers.ts";
import { assertOk, liveTest } from "./live-test.ts";
import { nullabilityGaps } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedTiers>>;
beforeAll(async () => {
  seed = await seedTiers(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].tiers;

// No mutations in the client, and its includes are no-ops: one shape test.
describe("tiers", () => {
  liveTest("every tier parses, each nullable field both null and set", async ({ api }) => {
    const browsed = await api.tiers.browse({ limit: "all" }).fetch();
    assertOk(browsed);
    const read = async (id: string) => {
      const result = await api.tiers.read({ id }).fetch();
      assertOk(result);
      return result.data;
    };
    const free = browsed.data.find((tier) => tier.type === "free")!;
    // The free tier has no prices; the bare paid tier no description.
    const variants = await Promise.all(
      [free.id, seed.bare.id, seed.full.id, seed.archived.id, seed.defaultTierId].map(read),
    );
    expect(variants.map((tier) => tier.active)).toContain(false);

    const except = { currency: "no tier under /tiers/ sends null: the free tier leaves it out" };
    expect(nullabilityGaps(schema, variants, except)).toEqual([]);
  });
});
