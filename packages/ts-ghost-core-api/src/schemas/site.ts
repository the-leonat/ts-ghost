import { z } from "zod";

export const baseSiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  version: z.string(),
  url: z.string(),
  icon: z.string().nullable(),
  cover_image: z.string().nullable(),
  accent_color: z.string().nullable(),
  locale: z.string(),
  timezone: z.string().meta({ description: "Sent by Ghost 6.x after 6.0" }).optional(),
  site_uuid: z.string(),
  allow_external_signup: z.boolean(),
});
