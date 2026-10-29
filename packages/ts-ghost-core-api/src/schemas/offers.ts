import { z } from "zod";

import { ghostObject } from "./targets";
import { perTarget, type SchemaTarget } from "./targets";

/** An offer as the Admin API sends it, for a schema target. */
export const baseOffersSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "offers", {
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
    last_redeemed: z
      .string()
      .meta({ description: "(nullable) When the offer was last redeemed" })
      .nullable(),
  }),
);

/** The v6-compat offer schema. */
export const baseOffersSchema = baseOffersSchemaFor("v6-compat");
