/**
 * Client checks over the paid side of the recorded state: members (free, paid
 * on a Stripe subscription, comped), tiers and offers. Several of these shapes
 * fail the current schemas; each such failure is kept as a "known defect"
 * assertion that it currently fails, titled with the defect. Fixing one
 * (#7 offers, #8 members) deletes its assertion and turns it into a passing check.
 */
import { assert, describe, expect, test } from "vitest";

import { adminMembersSchema } from "../schemas/members";
import { fixtureId, loadFixtures, PINNED_GHOST, type Fixture } from "./fixture-server";
import { useClientCheck } from "./harness";

const BY_SLUG = { order: "slug asc" } as const;
const BY_EMAIL = { order: "email asc" } as const;

/** The issue paths of the validation error a call rejected with, as `a.0.b`. */
async function rejectedPaths(call: Promise<unknown>): Promise<string[]> {
  const error: unknown = await call.then(
    () => undefined,
    (reason: unknown) => reason,
  );
  assert(error !== undefined, "expected the call to reject");
  const issues = (error as { issues?: { path: PropertyKey[] }[] }).issues;
  assert(issues !== undefined, `expected a validation error, got: ${String(error)}`);
  return issues.map((issue) => issue.path.map(String).join("."));
}

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

  test("known defect: a member without an avatar fails to parse, avatar_image is typed as a string but Ghost sends null", async () => {
    expect(await rejectedPaths(check.api.members.browse(BY_EMAIL).fetch())).toContain("data.0.avatar_image");
    expect(
      await rejectedPaths(check.api.members.read({ id: fixtureId("members.seeded") }).fetch()),
    ).toContain("data.avatar_image");
    expect(
      await rejectedPaths(
        check.api.members.add({ email: "ts-ghost-recorder@example.com", name: "ts-ghost recorder member" }),
      ),
    ).toContain("data.avatar_image");
  });

  test("known defect: a subscription on a Stripe price without a nickname fails to parse, price.nickname is typed as a string", () => {
    const members = recordedMembers("GET /ghost/api/admin/members/?order=email+asc");
    const member = members.find((candidate) => candidate.email === "ts-ghost-stripe@example.com");
    assert(member !== undefined);
    expect(member.subscriptions[0].price.nickname).toBeNull();

    const result = adminMembersSchema.safeParse(member);
    assert(!result.success);
    expect(result.error.issues.map((issue) => issue.path.join("."))).toContain(
      "subscriptions.0.price.nickname",
    );
  });

  test("known defect: a comped member's stand-in subscription fails to parse, current_period_end is typed as a string but Ghost sends null", async () => {
    const paths = await rejectedPaths(
      check.api.members.read({ id: fixtureId("members.created-comped") }).fetch(),
    );
    expect(paths).toContain("data.subscriptions.0.current_period_end");
  });

  test("known defect: a member's tiers cannot be requested or typed, the members include schema is empty and the schema has no tiers", () => {
    const included = recordedMembers("GET /ghost/api/admin/members/?include=tiers&order=email+asc");
    const plain = recordedMembers("GET /ghost/api/admin/members/?order=email+asc");
    // A browse sends tiers only when asked for them (a read by id sends them either way).
    expect(included.find((member) => member.id === "{{anyObjectId:members.seeded}}")?.tiers).toEqual([
      expect.objectContaining({ slug: "default-product", type: "paid" }),
    ]);
    expect(plain.some((member) => "tiers" in member)).toBe(false);

    expect(Object.keys(adminMembersSchema.shape)).not.toContain("tiers");
  });

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

  // The client offers these includes (a known defect of the route-spec
  // cross-check); Ghost's tiers.browse has no include option and ignores them.
  test("the price and benefit includes change nothing in what Ghost sends", async () => {
    const plain = await check.api.tiers.browse(BY_SLUG).fetch();
    const included = await check.api.tiers
      .browse(BY_SLUG)
      .include({ monthly_price: true, yearly_price: true, benefits: true })
      .fetch();

    assert(plain.success && included.success);
    expect(included.data).toEqual(plain.data);
  });
});

describe("client check: offers", () => {
  const check = useClientCheck();

  test("known defect: a retention offer fails to parse, tier is typed as required but Ghost sends null", async () => {
    expect(
      await rejectedPaths(check.api.offers.read({ id: fixtureId("offers.created-retention") }).fetch()),
    ).toContain("data.tier");
    expect(await rejectedPaths(check.api.offers.browse().fetch())).toEqual(
      expect.arrayContaining([expect.stringMatching(/^data\.\d+\.tier$/)]),
    );
  });

  test("known defect: a trial offer cannot be created, the create schema has no trial variant", async () => {
    const paths = await rejectedPaths(
      check.api.offers.add({
        name: "ts-ghost trial offer",
        code: "ts-ghost-trial",
        // @ts-expect-error the create schema has no trial type
        type: "trial",
        cadence: "year",
        amount: 14,
        // @ts-expect-error nor a trial duration
        duration: "trial",
        currency: "USD",
        tier: { id: fixtureId("tiers.seeded") },
      }),
    );
    expect(paths).toContain("type");
  });

  test("known defect: an offer's redemption_type, created_at and last_redeemed are dropped", async () => {
    const result = await check.api.offers.read({ id: fixtureId("offers.created-trial") }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      type: "trial",
      duration: "trial",
      tier: { id: fixtureId("tiers.seeded"), name: "Default Product" },
    });
    const [sent] = (
      recorded("GET /ghost/api/admin/offers/{{anyObjectId:offers.created-trial}}/?").response.body as {
        offers: Record<string, unknown>[];
      }
    ).offers;
    expect(sent).toMatchObject({ redemption_type: "signup", last_redeemed: null });
    expect(result.data).not.toHaveProperty("redemption_type");
    expect(result.data).not.toHaveProperty("created_at");
    expect(result.data).not.toHaveProperty("last_redeemed");
  });

  test("Ghost sends a retention offer with no tier and a retention redemption type", () => {
    const [retention] = (
      recorded("GET /ghost/api/admin/offers/{{anyObjectId:offers.created-retention}}/?").response.body as {
        offers: Record<string, unknown>[];
      }
    ).offers;
    expect(retention).toMatchObject({ redemption_type: "retention", tier: null, type: "percent" });
  });
});
