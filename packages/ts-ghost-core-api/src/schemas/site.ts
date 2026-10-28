import { z } from "zod";

import { ghostObject } from "./targets";
import { perTarget, type SchemaTarget } from "./targets";

/** The site as /site/ sends it, for a schema target. */
export const baseSiteSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "site", {
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
  }),
);

/** The v6-compat site schema. */
export const baseSiteSchema = baseSiteSchemaFor("v6-compat");
