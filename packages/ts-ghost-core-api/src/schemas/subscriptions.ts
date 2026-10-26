import { z } from "zod";

import { baseOffersSchema } from "./offers";
import { baseTiersSchema } from "./tiers";

/**
 * A member's subscription as Ghost's admin serializer sends it. Ghost owns the
 * keys, but many values are Stripe's, passed through unchecked: they are typed
 * as Ghost stores them (its columns), not as the fixtures happen to show them.
 * `cancellation_reason` is free text the member typed, kept an opaque string.
 */
export const baseSubscriptionsSchema = z.object({
  id: z.string().meta({ description: "Stripe subscription ID sub_XXXX, empty for a comped or gift member" }),
  customer: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      // Copied from the Stripe customer; Ghost's column is nullable.
      email: z.string().nullable(),
    })
    .meta({ description: "Stripe customer attached to the subscription" }),
  status: z.string().meta({ description: "Subscription status" }),
  start_date: z.string().meta({ description: "Subscription start date" }),
  default_payment_card_last4: z.string().meta({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: z.boolean().meta({
    description: "If the subscription should be canceled or renewed at period end",
  }),
  cancellation_reason: z.string().meta({ description: "Reason for subscription cancellation" }).nullable(),
  // Null on Ghost's stand-in subscription for a comped or gift member whose
  // tier has no expiry.
  current_period_end: z.string().meta({ description: "(nullable) Subscription end date" }).nullable(),
  price: z.object({
    id: z.string().meta({ description: "Stripe price ID" }),
    price_id: z.string().meta({ description: "Ghost price ID" }),
    // Stripe's: a price made in the Stripe dashboard or imported often has
    // none, and Ghost's `stripe_prices.nickname` is nullable.
    nickname: z.string().meta({ description: "(nullable) Price nickname" }).nullable(),
    amount: z.number().meta({ description: "Price amount" }),
    // Stripe's `recurring.interval` (day, week, month or year); Ghost stores
    // null when there is none.
    interval: z.string().meta({ description: "(nullable) Price interval" }).nullable(),
    type: z.string().meta({ description: "Price type" }),
    currency: z.string().meta({ description: "Price currency" }),
  }),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish(),
});
