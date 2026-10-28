import { z } from "zod";

import { ghostIdentitySchema, ghostVisibilitySchema } from "./shared";

export const baseTiersSchema = z.object({
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
  currency: z.string().meta({ description: "(nullable) Absent on the free tier under /tiers/" }).nullish(),
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
