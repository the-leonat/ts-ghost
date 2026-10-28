import { z } from "zod";

export const baseSiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  version: z.string(),
  url: z.string(),
  icon: z.string().nullish(),
  cover_image: z.string().nullish(),
  accent_color: z.string().nullish(),
  locale: z.string().optional(),
  timezone: z.string().optional(),
  site_uuid: z.string().optional(),
  allow_external_signup: z.boolean().optional(),
});
