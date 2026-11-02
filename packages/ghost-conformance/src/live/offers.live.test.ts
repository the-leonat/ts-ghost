// Live: the offers schemas, shape and nullability, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminOffersUpdateSchema, adminSchemas } from "@ts-ghost/admin-api";

import { uniqueSuffix } from "../seeds/helpers.ts";
import { seedOffers } from "../seeds/offers.ts";
import { assertOk, liveTest, onLatest } from "./live-test.ts";
import { nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedOffers>>;
beforeAll(async () => {
  seed = await seedOffers(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].offers;

describe("offers", () => {
  liveTest("every offer parses, each nullable field both null and set", async ({ api }) => {
    const browsed = await api.offers.browse({ limit: "all" }).fetch();
    assertOk(browsed);
    const variants = await Promise.all(
      browsed.data.map(async ({ id }) => {
        const result = await api.offers.read({ id }).fetch();
        assertOk(result);
        return result.data;
      }),
    );
    expect(variants.map((offer) => offer.type)).toEqual(
      expect.arrayContaining(["fixed", "percent", "trial"]),
    );

    // Only a retention offer has no tier, and Ghost has them from 6.18.
    const except: Record<string, string> = seed.retention
      ? {}
      : { tier: `Ghost ${inject("ghost").version} has no retention offers` };
    expect(nullabilityGaps(schema, variants, except)).toEqual([]);
  });

  liveTest.runIf(onLatest)("add and edit with every input read back what was sent", async ({ api }) => {
    const code = `fixed-${uniqueSuffix()}`;
    const add = {
      name: `Fixed ${code}`,
      code,
      display_title: "Five off",
      display_description: "Five dollars off once",
      type: "fixed",
      cadence: "year",
      amount: 500,
      duration: "once",
      duration_in_months: null,
      currency_restriction: true,
      currency: "USD",
      status: "active",
      redemption_count: 0,
      tier: { id: seed.tierId },
    } as const;
    const added = await api.offers.add(add);
    assertOk(added);
    const read = async () => {
      const result = await api.offers.read({ id: added.data.id }).fetch();
      assertOk(result);
      return result.data;
    };
    expect(await read()).toMatchObject(readBack(add));

    const edit = {
      name: `Renamed ${code}`,
      code: `renamed-${code}`,
      display_title: "Still five off",
      display_description: "Renamed",
      status: "archived",
    } as const;
    assertOk(await api.offers.edit(added.data.id, edit));
    expect(await read()).toMatchObject(readBack(edit));

    // The client has no offer delete; the archived offer stays.
    expect(unsentInputs(adminOffersUpdateSchema, edit)).toEqual([]);
  });
});
