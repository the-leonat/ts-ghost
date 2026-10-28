import { describe, expect, test } from "vitest";

import { baseSubscriptionsSchema } from "./subscriptions";

// As Ghost 6.72 sends them for a subscription with an active repeating offer.
const offer = {
  id: "6ae1fb2004a5250001f195f2",
  name: "Stripe seed offer",
  code: "stripe-seed-offer",
  display_title: "Three months off",
  display_description: "20% off for three months",
  type: "percent",
  cadence: "month",
  amount: 20,
  duration: "repeating",
  duration_in_months: 3,
  currency_restriction: false,
  currency: null,
  status: "active",
  redemption_count: 1,
  redemption_type: "signup",
  tier: { id: "6ae1fb1c04a5250001f1952a", name: "ts-ghost conformance" },
  created_at: "2026-10-28T13:39:44.000Z",
  last_redeemed: "2026-10-28T13:40:37.000Z",
};
const discount = {
  offer_id: offer.id,
  start: "2026-10-01T00:00:00.000Z",
  end: "2027-06-01T00:00:00.000Z",
  duration: "repeating",
  duration_in_months: 3,
  type: "percent",
  amount: 20,
};
const subscription = {
  id: "sub_1",
  customer: { id: "cus_1", name: null, email: null },
  status: "active",
  start_date: "2026-01-01T00:00:00.000Z",
  default_payment_card_last4: null,
  cancel_at_period_end: false,
  cancellation_reason: null,
  current_period_end: "2027-01-01T00:00:00.000Z",
  price: {
    id: "price_1",
    price_id: "1",
    nickname: null,
    amount: 500,
    interval: "month",
    type: "recurring",
    currency: "USD",
  },
  next_payment: { original_amount: 500, amount: 400, interval: "month", currency: "USD", discount },
  offer,
  offer_redemptions: [offer],
};

describe("subscriptions", () => {
  test("a next payment's discount and the redeemed offers are typed as Ghost sends them", () => {
    const parsed = baseSubscriptionsSchema.parse(subscription);
    expect(parsed.next_payment?.discount).toEqual(discount);
    expect(parsed.offer_redemptions?.[0]).toMatchObject({ code: "stripe-seed-offer", redemption_type: "signup" });
  });

  test("a discount with an unknown type fails, where it used to pass as unknown", () => {
    const next_payment = { ...subscription.next_payment, discount: { ...discount, type: "trial" } };
    expect(baseSubscriptionsSchema.safeParse({ ...subscription, next_payment }).success).toBe(false);
  });
});
