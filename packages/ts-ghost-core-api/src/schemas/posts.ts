import { z } from "zod";

import { baseAuthorsSchema } from "./authors";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "./shared";
import { baseTagsSchema } from "./tags";

const postsAuthorSchema = baseAuthorsSchema;
export const basePostsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
  html: z.string().meta({ description: "(nullable) Sent with formats: html" }).nullish(),
  plaintext: z.string().meta({ description: "(nullable) Sent with formats: plaintext" }).nullish(),
  comment_id: z.string().nullable(),
  feature_image: z.string().nullable(),
  feature_image_alt: z.string().nullable(),
  feature_image_caption: z.string().nullable(),
  featured: z.boolean(),
  custom_excerpt: z.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: z.string().nullable(),
  canonical_url: z.string().nullable(),
  authors: z.array(postsAuthorSchema).optional(),
  tags: z.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema.nullable(),
  primary_tag: baseTagsSchema.nullable(),
  url: z.string(),
  excerpt: z.string().nullable(),
  reading_time: z.number().optional().default(0),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  published_at: z.string().nullable(),
  email_subject: z.string().nullable(),
  is_page: z.boolean().default(false),
});
