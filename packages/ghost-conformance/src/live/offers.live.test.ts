import { assert, beforeAll, describe, expect, inject } from "vitest";

import { seedOffers } from "../seeds/offers.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { ghostAtLeast, requireBehaviour } from "./ghost.ts";
import { assertOk, liveTest } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedOffers>>;
beforeAll(async () => {
  seed = await seedOffers(inject("ghost"));
});

const ISO_MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("offers", () => {
  liveTest("add creates a fixed signup offer on a tier; edits read back", async ({ api }) => {
    const code = `fixed-${uniqueSuffix()}`;
    const sent = {
      name: `Fixed ${code}`,
      code,
      display_title: "Five off",
      display_description: "Five dollars off once",
      type: "fixed",
      cadence: "year",
      amount: 500,
      duration: "once",
      currency: "USD",
      tier: { id: seed.tierId },
    } as const;
    const added = await api.offers.add(sent);
    assertOk(added);

    const edited = await api.offers.edit(added.data.id, {
      name: `Renamed ${code}`,
      display_title: "Still five off",
    });
    assertOk(edited);

    const read = await api.offers.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({
      ...sent,
      name: `Renamed ${code}`,
      display_title: "Still five off",
      duration_in_months: null,
      status: "active",
      redemption_count: 0,
      tier: { id: seed.tierId, name: expect.any(String) },
    });
  });

  liveTest("a percent offer repeats for its months", async ({ api }) => {
    const result = await api.offers.read({ id: seed.repeating.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({
      type: "percent",
      duration: "repeating",
      duration_in_months: 3,
      currency: null,
      display_title: "",
      display_description: "",
    });
  });

  liveTest("a retention offer reads with no tier", async ({ api, skip }) => {
    requireBehaviour({ skip }, "retentionOffers");
    const result = await api.offers.read({ id: seed.retention!.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({ code: seed.retention!.code, type: "percent", tier: null });
  });

  liveTest("browse lists the retention and the trial offer", async ({ api, skip }) => {
    requireBehaviour({ skip }, "retentionOffers");
    const result = await api.offers.browse({ limit: "all" }).fetch();

    assertOk(result);
    const byCode = new Map(result.data.map((offer) => [offer.code, offer]));
    expect(byCode.get(seed.retention!.code)).toMatchObject({ tier: null });
    expect(byCode.get(seed.trial.code)).toMatchObject({ tier: { id: seed.tierId } });
  });

  // PhilDL/ts-ghost#314: a retention offer's null tier failed the whole browse.
  liveTest("browse of active offers parses with a retention offer among them", async ({ api, skip }) => {
    requireBehaviour({ skip }, "retentionOffers");
    const result = await api.offers.browse({ filter: "status:active" }).fetch();

    assertOk(result);
    expect(result.data.find((offer) => offer.code === seed.retention!.code)).toMatchObject({
      redemption_type: "retention",
      tier: null,
    });
  });

  liveTest("add creates a trial offer of a number of trial days on a tier", async ({ api }) => {
    const code = `trial-${uniqueSuffix()}`;
    const trial = {
      name: `Trial ${code}`,
      code,
      type: "trial",
      cadence: "year",
      amount: 14,
      duration: "trial",
      currency: "USD",
      tier: { id: seed.tierId },
    } as const;
    const added = await api.offers.add(trial);

    assertOk(added);
    const read = await api.offers.read({ id: added.data.id }).fetch();
    assertOk(read);
    // Ghost stores no currency on a trial offer.
    expect(read.data).toMatchObject({ ...trial, currency: null, tier: { id: seed.tierId } });
  });

  liveTest(
    "a trial offer must have a trial duration, and other offers cannot have one",
    async ({ api, responses }) => {
      const base = {
        name: "n",
        code: "trial-check",
        cadence: "year",
        amount: 14,
        tier: { id: seed.tierId },
      } as const;
      const rejectsDuration = {
        name: "ZodError",
        issues: [expect.objectContaining({ path: ["duration"] })],
      };
      await expect(
        // @ts-expect-error a trial offer's duration is "trial"
        api.offers.add({ ...base, type: "trial", duration: "once" }),
      ).rejects.toMatchObject(rejectsDuration);
      await expect(
        // @ts-expect-error only a trial offer has a trial duration
        api.offers.add({ ...base, type: "percent", duration: "trial" }),
      ).rejects.toMatchObject(rejectsDuration);
      expect(responses.all()).toEqual([]);
    },
  );

  liveTest(
    "a trial offer reads back with its tier, redemption type, creation time and last redemption",
    async ({ api }) => {
      const result = await api.offers.read({ id: seed.trial.id }).fetch();

      assertOk(result);
      expect(result.data).toMatchObject({
        type: "trial",
        duration: "trial",
        amount: 14,
        // Ghost sends redemption_type since 6.13.
        ...(ghostAtLeast("6.13.0") && { redemption_type: "signup" }),
        tier: { id: seed.tierId, name: expect.any(String) },
        created_at: expect.stringMatching(ISO_MS),
        last_redeemed: null,
      });
    },
  );

  // The deprecated slug read stays callable; Ghost has no /offers/slug/:slug/ route.
  liveTest("the deprecated read by slug gets Ghost's 404", async ({ deprecatedApi }) => {
    const result = await deprecatedApi.offers.read({ slug: seed.trial.code }).fetch();

    assert(!result.success);
    expect(result.status).toBe(404);
  });

  liveTest("an offer carries no key the client's schema lacks", async ({ api }) => {
    const result = await api.offers.read({ id: seed.trial.id }).fetch();
    expect(undeclaredKeys(result)).toEqual([]);
    assertOk(result);
  });
});
