import { describe, expect } from "vitest";

import { STRIPE_SEED } from "../seeds/stripe.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi } from "./ghost.ts";
import { assertOk, liveTest } from "./live-test.ts";

/** Id of a member by email; selects only `id` so members the client can't parse still resolve. */
async function memberId(email: string): Promise<string> {
  const result = await adminApi()
    .members.browse({ filter: `email:'${email}'` })
    .fields({ id: true })
    .fetch();
  if (!result.success || !result.data[0]) throw new Error(`No member ${email}`);
  return result.data[0].id;
}

describe("paid members", () => {
  liveTest("a paid member reads with an active Stripe subscription on the paid tier", async ({ api }) => {
    const result = await api.members.read({ id: await memberId(STRIPE_SEED.members.paid) }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({ status: "paid", comped: false });
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({
        id: STRIPE_SEED.subscriptions.paid,
        status: "active",
        customer: { id: STRIPE_SEED.customers.paid, name: "Paid Member", email: STRIPE_SEED.members.paid },
        default_payment_card_last4: "4242",
        cancel_at_period_end: false,
        cancellation_reason: null,
        current_period_end: "2027-01-01T00:00:00.000Z",
        price: expect.objectContaining({
          id: STRIPE_SEED.prices.monthly,
          nickname: "Monthly",
          interval: "month",
        }),
        tier: expect.objectContaining({ slug: "default-product", type: "paid" }),
        offer: expect.objectContaining({ code: STRIPE_SEED.offer }),
      }),
    ]);
  });

  liveTest("a subscription with a null customer email and price nickname parses", async ({ api }) => {
    const result = await api.members.read({ id: await memberId(STRIPE_SEED.members.nulls) }).fetch();

    assertOk(result);
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({
        id: STRIPE_SEED.subscriptions.nulls,
        customer: { id: STRIPE_SEED.customers.nulls, name: null, email: null },
        default_payment_card_last4: null,
        cancel_at_period_end: true,
        cancellation_reason: "Too expensive",
        price: expect.objectContaining({ id: STRIPE_SEED.prices.yearly, nickname: null, interval: "year" }),
        offer: null,
      }),
    ]);
  });

  liveTest("browsing paid members parses", async ({ api }) => {
    const result = await api.members.browse({ filter: "status:paid" }).fetch();

    assertOk(result);
    expect(result.data.map((member) => member.email).sort()).toEqual(
      [STRIPE_SEED.members.nulls, STRIPE_SEED.members.paid].sort(),
    );
  });

  liveTest("a paid member's tiers come with the include", async ({ api }) => {
    const result = await api.members
      .read({ id: await memberId(STRIPE_SEED.members.paid) })
      .include({ tiers: true })
      .fetch();

    assertOk(result);
    expect(result.data.tiers).toEqual([expect.objectContaining({ slug: "default-product", type: "paid" })]);
  });

  liveTest("a subscription carries no key the client's schema lacks", async ({ api }) => {
    const result = await api.members.read({ id: await memberId(STRIPE_SEED.members.paid) }).fetch();

    expect(undeclaredKeys(result).filter((k) => k.startsWith("members[].subscriptions["))).toEqual([]);
    assertOk(result);
  });
});
