import isSlug from "validator/lib/isSlug";
import { z } from "zod";

/** An offer as the Admin API sends it. */
export const latestOffersSchema = z.object({
  id: z.string(),
  name: z.string().meta({ description: "Internal name for an offer, must be unique" }).default(""),
  code: z
    .string()
    .meta({ description: "Shortcode for the offer, for example: https://yoursite.com/black-friday" }),
  display_title: z.string().meta({ description: "Name displayed in the offer window" }),
  display_description: z.string().meta({ description: "Text displayed in the offer window" }),
  type: z.union([z.literal("percent"), z.literal("fixed"), z.literal("trial")]),
  cadence: z.union([z.literal("month"), z.literal("year")]),
  amount: z.number().meta({
    description: `Offer discount amount, as a percentage or fixed value as set in type.
      Amount is always denoted by the smallest currency unit
      (e.g., 100 cents instead of $1.00 in USD)`,
  }),
  duration: z
    .union([z.literal("once"), z.literal("forever"), z.literal("repeating"), z.literal("trial")])
    .meta({
      description: "once/forever/repeating. repeating duration is only available when cadence is month",
    }),
  duration_in_months: z
    .number()
    .meta({ description: "Number of months offer should be repeated when duration is repeating" })
    .nullable(),
  currency_restriction: z.boolean().meta({
    description:
      "Denotes whether the offer `currency` is restricted. If so, changing the currency invalidates the offer",
  }),
  currency: z
    .string()
    .meta({
      description: "fixed type offers only - specifies tier's currency as three letter ISO currency code",
    })
    .nullable(),
  status: z.union([z.literal("active"), z.literal("archived")]).meta({
    description: "active or archived - denotes if the offer is active or archived",
  }),
  redemption_count: z.number().meta({ description: "Number of times the offer has been redeemed" }),
  redemption_type: z
    .union([z.literal("signup"), z.literal("retention")])
    .meta({ description: "signup offers apply on sign-up, retention offers to a member who cancels" }),
  tier: z
    .object({
      id: z.string(),
      name: z.string().meta({ description: "Absent from the response to an add" }).optional(),
    })
    .nullable()
    .meta({ description: "(nullable) Tier on which offer is applied, null on a retention offer" }),
  created_at: z.string().meta({ description: "When the offer was created" }),
  last_redeemed: z.string().meta({ description: "(nullable) When the offer was last redeemed" }).nullable(),
});

const baseOffersCreateSchema = z.object({
  name: z.string(),
  code: z.string().refine((value) => isSlug(value), {
    message: "Code must be a valid slug",
  }),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  cadence: z.union([z.literal("year"), z.literal("month")]),
  duration_in_months: z
    .number()
    .meta({
      description: "Number of months offer should be repeated when duration is repeating",
    })
    .nullish(),
  currency_restriction: z.boolean().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
  redemption_count: z.number().optional(),
  tier: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
  }),
});

const discountAmount = z.number().meta({
  description: "Amount of the percent or fixed amount in the smallest unit of the currency",
});
const discountDuration = z.union([z.literal("once"), z.literal("forever"), z.literal("repeating")]);

/** A fixed, percent or trial offer (a trial's `amount` is in days). Not enforced here: "repeating" needs
 * cadence "month", and `duration_in_months` only applies to it. */
export const adminOffersCreateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fixed"),
    currency: z.string(),
    amount: discountAmount,
    duration: discountDuration,
    ...baseOffersCreateSchema.shape,
  }),
  z.object({
    type: z.literal("percent"),
    currency: z.string().nullish(),
    amount: discountAmount,
    duration: discountDuration,
    ...baseOffersCreateSchema.shape,
  }),
  z.object({
    type: z.literal("trial"),
    currency: z.string().nullish(),
    amount: z.number().meta({ description: "Length of the free trial, in days" }),
    duration: z.literal("trial"),
    ...baseOffersCreateSchema.shape,
  }),
]);

export type OffersCreate = z.infer<typeof adminOffersCreateSchema>;

export const adminOffersUpdateSchema = z.object({
  name: z.string().optional(),
  code: z
    .string()
    .refine((value) => isSlug(value), {
      message: "Code must be a valid slug",
    })
    .optional(),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
});
