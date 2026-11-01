import { z } from "zod";

/** The site as /site/ sends it. */
export const latestSiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  version: z.string(),
  url: z.string(),
  icon: z.string().nullable(),
  cover_image: z.string().nullable(),
  accent_color: z.string().nullable(),
  locale: z.string(),
  timezone: z.string(),
  site_uuid: z.string(),
  allow_external_signup: z.boolean(),
});
