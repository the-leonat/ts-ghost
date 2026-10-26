/**
 * Client checks over the paid side of the recorded state: members (free, paid
 * on a Stripe subscription, comped), tiers and offers. Several of these shapes
 * fail the current schemas; each such failure is kept as a "known defect"
 * assertion that it currently fails, titled with the defect. Fixing one
 * (#8 members) deletes its assertion and turns it into a passing check.
 */
import { assert, describe, expect, test } from "vitest";

import { fixtureId, loadFixtures, PINNED_GHOST, type Fixture } from "./fixture-server";
import { fetchMocker, sentBody, useClientCheck } from "./harness";

const BY_SLUG = { order: "slug asc" } as const;

function recorded(name: string): Fixture {
  const fixture = loadFixtures(PINNED_GHOST.fixtureDir).find(
    (candidate) =>
      `${candidate.request.method} ${candidate.request.path}?${new URLSearchParams(candidate.request.query)}` ===
      name,
  );
  assert(fixture !== undefined, `no fixture for ${name}`);
  return fixture;
}

function recordedMembers(name: string) {
  return (recorded(name).response.body as { members: Record<string, any>[] }).members;
}

describe("client check: members", () => {
  const check = useClientCheck();

  test("the seeded members hold paid members with Stripe subscriptions on the seeded tier", () => {
    const members = recordedMembers("GET /ghost/api/admin/members/?order=email+asc");
    expect(new Set(members.map((member) => member.status))).toEqual(new Set(["free", "paid"]));
    const paid = members.find((member) => member.id === "{{anyObjectId:members.seeded}}");
    assert(paid !== undefined);
    expect(paid.subscriptions).toContainEqual(
      expect.objectContaining({
        status: "active",
        customer: expect.objectContaining({ id: expect.stringMatching(/^cus_/) }),
        tier: expect.objectContaining({ id: "{{anyObjectId:tiers.seeded}}" }),
      }),
    );
  });

  test("a comped member's subscription is Ghost's stand-in: no Stripe ids and no period end", () => {
    const [comped] = recordedMembers(
      "GET /ghost/api/admin/members/{{anyObjectId:members.created-comped}}/?",
    );
    expect(comped.status).toBe("comped");
    expect(comped.subscriptions).toEqual([
      expect.objectContaining({ id: "", current_period_end: null, default_payment_card_last4: "****" }),
    ]);
  });

  test("delete removes a member the walk created", async () => {
    expect(await check.api.members.delete(fixtureId("members.created-free"))).toEqual({ success: true });
  });
});

describe("client check: tiers", () => {
  const check = useClientCheck();

  test("browse returns the free tier, the seeded paid tier and an archived one", async () => {
    const result = await check.api.tiers.browse(BY_SLUG).fetch();

    assert(result.success);
    // Ghost's tiers.browse takes the order option but sends its own order.
    expect(result.data.map((tier) => [tier.slug, tier.type, tier.active])).toEqual(
      expect.arrayContaining([
        ["default-product", "paid", true],
        ["free", "free", true],
        ["gold", "paid", false],
      ]),
    );
    expect(result.data).toHaveLength(3);
  });

  test("read by id returns the seeded paid tier with its prices", async () => {
    const result = await check.api.tiers.read({ id: fixtureId("tiers.seeded") }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      slug: "default-product",
      currency: "USD",
      monthly_price: 500,
      yearly_price: 5000,
    });
  });

  test("a tier the walk created reads back with its prices and benefits", async () => {
    const result = await check.api.tiers.read({ id: fixtureId("tiers.created") }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      name: "ts-ghost recorder tier, edited",
      monthly_price: 700,
      yearly_price: 7000,
      benefits: ["ts-ghost recorder benefit"],
    });
  });

  test("a free tier has benefits but no prices, and a paid tier has both, without asking for them", async () => {
    const result = await check.api.tiers.browse(BY_SLUG).fetch();

    assert(result.success);
    expect(result.data.find((tier) => tier.slug === "free")).toMatchObject({
      benefits: [],
      monthly_price: null,
      yearly_price: null,
    });
    expect(result.data.find((tier) => tier.slug === "default-product")).toMatchObject({
      benefits: [],
      monthly_price: 500,
      yearly_price: 5000,
    });
  });

  // The client still accepts these deprecated includes (a legacy claim of the
  // route-spec cross-check); Ghost's tiers controller has no include option and
  // drops the parameter (fixtures/ghost-6.72/tiers/browse-include-*), so the
  // client no longer sends it.
  test("the deprecated price and benefit includes are accepted but not sent", async () => {
    const plain = await check.api.tiers.browse(BY_SLUG).fetch();
    const included = await check.api.tiers
      .browse(BY_SLUG)
      .include({ monthly_price: true, yearly_price: true, benefits: true })
      .fetch();
    const read = await check.api.tiers
      .read({ id: fixtureId("tiers.seeded") })
      .include({ monthly_price: true, yearly_price: true, benefits: true })
      .fetch();

    assert(plain.success && included.success && read.success);
    expect(included.data).toEqual(plain.data);
    const sentQueries = fetchMocker.mock.calls.map(([input]) => new URL(String(input)).searchParams);
    expect(sentQueries.map((query) => query.has("include"))).toEqual([false, false, false]);
  });
});

describe("client check: offers", () => {
  const check = useClientCheck();

  test("a retention offer reads back with no tier and its retention redemption type", async () => {
    const result = await check.api.offers.read({ id: fixtureId("offers.created-retention") }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      code: "ts-ghost-retention",
      type: "percent",
      redemption_type: "retention",
      tier: null,
    });
  });

  test("browse returns the retention and the trial offer", async () => {
    const result = await check.api.offers.browse().fetch();

    assert(result.success);
    expect(result.data.map((offer) => [offer.code, offer.redemption_type, offer.tier?.id ?? null])).toEqual([
      ["ts-ghost-retention", "retention", null],
      ["ts-ghost-trial", "signup", fixtureId("tiers.seeded")],
    ]);
  });

  test("add creates a trial offer of a number of trial days on a tier", async () => {
    const trial = {
      name: "ts-ghost trial offer",
      code: "ts-ghost-trial",
      type: "trial",
      cadence: "year",
      amount: 14,
      duration: "trial",
      currency: "USD",
      tier: { id: fixtureId("tiers.seeded") },
    } as const;

    const result = await check.api.offers.add(trial);

    expect(sentBody(0)).toEqual({ offers: [trial] });
    assert(result.success);
    expect(result.data).toMatchObject({
      id: fixtureId("offers.created-trial"),
      type: "trial",
      duration: "trial",
      amount: 14,
      redemption_type: "signup",
      tier: { id: fixtureId("tiers.seeded") },
    });
  });

  test("a trial offer must have a trial duration, and other offers cannot have one", async () => {
    const base = { name: "n", code: "c", cadence: "year", amount: 14, tier: { id: "t" } } as const;
    await expect(
      // @ts-expect-error a trial offer's duration is "trial"
      check.api.offers.add({ ...base, type: "trial", duration: "once" }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error only a trial offer has a trial duration
      check.api.offers.add({ ...base, type: "percent", duration: "trial" }),
    ).rejects.toThrow();
    expect(fetchMocker.mock.calls).toHaveLength(0);
  });

  test("a trial offer reads back with its tier, redemption type, creation time and last redemption", async () => {
    const result = await check.api.offers.read({ id: fixtureId("offers.created-trial") }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      type: "trial",
      duration: "trial",
      amount: 14,
      redemption_type: "signup",
      tier: { id: fixtureId("tiers.seeded"), name: "Default Product" },
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      last_redeemed: null,
    });
  });
});
