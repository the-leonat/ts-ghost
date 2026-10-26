import { z } from "zod";

import { ghostIdentitySchema, ghostMetadataSchema } from "./shared";

export const baseAuthorsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  name: z.string(),
  profile_image: z.string().nullable(),
  cover_image: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  bluesky: z.string().nullish(),
  instagram: z.string().nullish(),
  linkedin: z.string().nullish(),
  mastodon: z.string().nullish(),
  threads: z.string().nullish(),
  tiktok: z.string().nullish(),
  youtube: z.string().nullish(),
  count: z
    .object({
      posts: z.number(),
    })
    .optional(),
  url: z.string().nullish(),
});
