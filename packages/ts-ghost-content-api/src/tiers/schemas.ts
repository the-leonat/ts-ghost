import { z } from "zod";
import { ghostIdentitySchema, ghostVisibilitySchema } from "@ts-ghost/core-api";

export const tiersSchema = z.object({
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
  benefits: z.array(z.string()),
  visibility: ghostVisibilitySchema,
  currency: z.string().nullish(),
  trial_days: z.number().default(0),
});

export type Tier = z.infer<typeof tiersSchema>;

export const tiersIncludeSchema = z.object({
  /** @deprecated Ghost always sends a paid tier's monthly price; the include is a no-op. */
  monthly_price: z.literal(true).optional(),
  /** @deprecated Ghost always sends a paid tier's yearly price; the include is a no-op. */
  yearly_price: z.literal(true).optional(),
  /** @deprecated Ghost always sends a tier's benefits; the include is a no-op. */
  benefits: z.literal(true).optional(),
});
export type TiersIncludeSchema = z.infer<typeof tiersIncludeSchema>;
