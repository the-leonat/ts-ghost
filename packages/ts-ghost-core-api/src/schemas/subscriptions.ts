import { z } from "zod";

import { baseOffersSchema } from "./offers";
import { baseTiersSchema } from "./tiers";

/** Where a member or subscription came from: the page and referrer Ghost recorded. */
export const baseAttributionSchema = z.object({
  id: z.string().nullable(),
  type: z.string().nullable(),
  url: z.string().nullable(),
  title: z.string().nullable(),
  referrer_source: z.string().nullable(),
  referrer_medium: z.string().nullable(),
  referrer_url: z.string().nullable(),
});

const basePlanSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable(),
  amount: z.number(),
  interval: z.string().nullable(),
  currency: z.string(),
});

const baseDiscountSchema = z.object({
  offer_id: z.string(),
  start: z.string().nullable(),
  end: z.string().meta({ description: "(nullable) Null for a forever discount" }).nullable(),
  duration: z.union([z.literal("once"), z.literal("repeating"), z.literal("forever")]),
  duration_in_months: z.number().nullable(),
  type: z.union([z.literal("percent"), z.literal("fixed")]),
  amount: z.number(),
});

// Many values are Stripe's, typed as Ghost stores them (its columns).
export const baseSubscriptionsSchema = z.object({
  id: z.string().meta({ description: "Stripe subscription ID sub_XXXX, empty for a comped member" }),
  customer: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
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
  current_period_end: z
    .string()
    .meta({ description: "(nullable) Subscription end date, null when comped" })
    .nullable(),
  price: z.object({
    id: z.string().meta({ description: "Stripe price ID" }),
    price_id: z.string().meta({ description: "Ghost price ID" }),
    nickname: z.string().meta({ description: "(nullable) Price nickname" }).nullable(),
    amount: z.number().meta({ description: "Price amount" }),
    interval: z.string().meta({ description: "(nullable) Price interval" }).nullable(),
    type: z.string().meta({ description: "Price type" }),
    currency: z.string().meta({ description: "Price currency" }),
    tier: z
      .object({ id: z.string(), tier_id: z.string().nullish(), name: z.string().nullish() })
      .meta({ description: "The Stripe product and Ghost tier of the price" })
      .optional(),
  }),
  plan: basePlanSchema.meta({ description: "The Stripe price, under Stripe's legacy name" }).optional(),
  next_payment: basePlanSchema
    .omit({ id: true, nickname: true })
    .extend({
      original_amount: z.number().meta({ description: "The amount before any discount" }),
      discount: baseDiscountSchema
        .meta({ description: "(nullable) The offer's active discount" })
        .nullable(),
    })
    .meta({ description: "(nullable) The next payment, after any discount" })
    .nullish(),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish(),
  offer_redemptions: z
    .array(baseOffersSchema)
    .meta({ description: "The offers redeemed on the subscription" })
    .optional(),
  attribution: baseAttributionSchema.nullish(),
  trial_start_at: z.string().nullish(),
  trial_end_at: z.string().nullish(),
  discount_start: z.string().nullish(),
  discount_end: z.string().nullish(),
});
