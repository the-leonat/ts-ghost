import { z } from "zod";
import { ghostIdentitySchema, ghostVisibilitySchema } from "@ts-ghost/core-api";

/** A tier as the Admin API sends it. */
export const latestTiersSchema = z.object({
  ...ghostIdentitySchema.shape,
  name: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
  type: z.union([z.literal("free"), z.literal("paid")]),
  welcome_page_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  stripe_prices: z
    .array(z.number())
    .optional()
    .transform((v) => (v?.length ? v : [])),
  monthly_price: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  yearly_price: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  benefits: z.array(z.string()).optional(),
  visibility: ghostVisibilitySchema,
  currency: z
    .string()
    .meta({ description: "(nullable) The free tier's is absent under /tiers/ and null in a post or page" })
    .nullish(),
  trial_days: z.number().default(0),
  monthly_price_id: z
    .string()
    .meta({ description: "(nullable) Monthly Stripe price id; absent under /tiers/" })
    .nullish(),
  yearly_price_id: z
    .string()
    .meta({ description: "(nullable) Yearly Stripe price id; absent under /tiers/" })
    .nullish(),
  expiry_at: z
    .string()
    .meta({ description: "(nullable) When a member's comped access ends; only on a member's tiers" })
    .nullish(),
});

export const adminTiersCreateSchema = z.object({
  name: z.string().meta({ description: "Name of the tier" }).min(1).max(2000),
  description: z.string().meta({ description: "Description of the tier" }).optional(),
  welcome_page_url: z.string().meta({ description: "Welcome page URL of the tier" }).optional(),
  visibility: z.union([z.literal("public"), z.literal("none")]).optional(),
  monthly_price: z.number().meta({ description: "Monthly price of the tier" }).optional(),
  yearly_price: z.number().meta({ description: "Yearly price of the tier" }).optional(),
  trial_days: z.number().meta({ description: "Trial days of the tier" }).optional(),
  benefits: z.array(z.string().meta({ description: "Benefits of the tier" })).optional(),
  currency: z.string().meta({ description: "Currency of the tier" }).optional(),
  active: z.boolean().meta({ description: "Active of the tier" }).optional(),
});
