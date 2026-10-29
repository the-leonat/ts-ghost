import { z } from "zod";

import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "./shared";

export const baseTagsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  name: z.string(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  visibility: ghostVisibilitySchema,
  canonical_url: z.string().nullable(),
  accent_color: z.string().nullable(),
  url: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  count: z
    .object({
      posts: z.number(),
    })
    .optional(),
});
