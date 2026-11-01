import { z } from "zod";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "@ts-ghost/core-api";

import { latestAuthorsSchema } from "./authors";
import { latestEmailSchema } from "./email";
import { latestNewsletterSchema } from "./newsletters";
import { DEFAULT_FORMATS, DEFAULT_INCLUDES } from "./reasons";
import { latestTagsSchema } from "./tags";
import { latestTiersSchema } from "./tiers";

/** A post as the Admin API sends it. */
export const latestPostsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
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
  tags: z.array(latestTagsSchema).optional(),
  primary_tag: latestTagsSchema
    .meta({ description: "(nullable) Sent with the tags: by default or with include: tags" })
    .nullish(),
  url: z.string(),
  excerpt: z.string().nullable(),
  reading_time: z.number().optional().default(0),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  published_at: z.string().nullable(),
  email_subject: z.string().nullable(),
  is_page: z.boolean().default(false),
  uuid: z.string(),
  mobiledoc: z
    .string()
    .meta({ description: `(nullable) Null for a lexical post; ${DEFAULT_FORMATS}` })
    .nullish(),
  email_only: z.boolean(),
  status: z
    .union([z.literal("draft"), z.literal("published"), z.literal("scheduled"), z.literal("sent")])
    .meta({ description: "sent: an email-only post Ghost has emailed" }),
  email_segment: z.string(),
  frontmatter: z.string().nullable(),
  tiers: z
    .array(latestTiersSchema)
    .meta({ description: `Sent by default or with include: tiers` })
    .optional(),
  email: latestEmailSchema.meta({ description: `(nullable) ${DEFAULT_INCLUDES}` }).nullish(),
  newsletter: latestNewsletterSchema.meta({ description: `(nullable) ${DEFAULT_INCLUDES}` }).nullish(),
  count: z
    .object({
      clicks: z.number(),
      positive_feedback: z.number(),
      negative_feedback: z.number(),
    })
    .meta({ description: DEFAULT_INCLUDES })
    .optional(),
  authors: z.array(latestAuthorsSchema),
  primary_author: latestAuthorsSchema,
  lexical: z
    .string()
    .catch(
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
    )
    .optional(),
  html: z.string().catch("").optional(),
  plaintext: z.string().catch("").optional(),
});

const basePostsCreateSchema = z.object({
  title: z.string().min(1).max(2000),
  slug: z.string().max(191).optional(),
  mobiledoc: z.string().max(1000000000).optional(),
  lexical: z.string().max(1000000000).optional(),
  html: z.string().max(1000000000).optional(),
  feature_image: z.string().max(2000).url().optional(),
  feature_image_alt: z.string().max(65535).optional(),
  feature_image_caption: z.string().max(65535).optional(),
  featured: z.boolean().optional(),
  status: z
    .union([z.literal("draft"), z.literal("published"), z.literal("scheduled"), z.literal("sent")])
    .optional(),
  locale: z.string().max(6).meta({ description: "Stored by Ghost but never sent back" }).optional(),
  visibility: z
    .union([
      z.literal("public"),
      z.literal("internal"),
      z.literal("members"),
      z.literal("paid"),
      z.literal("tiers"),
    ])
    .optional(),
  visibility_filter: z.string().optional(),
  meta_title: z.string().max(300).optional(),
  meta_description: z.string().max(500).optional(),
  updated_at: z
    .date()
    .transform((val) => val.toISOString())
    .optional(),
  published_at: z
    .date()
    .transform((val) => val.toISOString())
    .optional(),
  custom_excerpt: z.string().max(300).optional(),
  codeinjection_head: z.string().max(65535).optional(),
  codeinjection_foot: z.string().max(65535).optional(),
  og_image: z.string().max(2000).url().optional(),
  og_title: z.string().max(300).optional(),
  og_description: z.string().max(500).optional(),
  twitter_image: z.string().max(2000).url().optional(),
  twitter_title: z.string().max(300).optional(),
  twitter_description: z.string().max(500).optional(),
  email_subject: z.string().max(300).optional(),
  custom_template: z.string().max(100).optional(),
  canonical_url: z.string().max(2000).url().optional(),
  email_only: z.boolean().optional(),
  tags: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the tags" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the tags" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the tags" }),
        }),
      ]),
    )
    .meta({
      description: `The tags associated with the post array of either slug, id or name`,
    })
    .optional(),
  tiers: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the tiers" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the tiers" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the tiers" }),
        }),
      ]),
    )
    .meta({
      description: `The tiers associated with the post array of either slug, id or name`,
    })
    .optional(),
  authors: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the author" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the author" }),
        }),
        z.object({
          email: z.string().meta({ description: "The email of the author" }),
        }),
      ]),
    )
    .meta({
      description: `Specifying author via id, name or slug.`,
    })
    .optional(),
  /** @deprecated Ghost drops it from the body; pass `edit`'s `newsletter` option. Removed in a later major. */
  newsletter: z
    .union([
      z.object({
        id: z.string().meta({ description: "The ID of the newsletter" }),
      }),
      z.object({
        slug: z.string().meta({ description: "The slug of the newsletter" }),
      }),
    ])
    .meta({ deprecated: true })
    .optional(),
});

export const adminPostsCreateSchema = basePostsCreateSchema;

export type CreatePost = z.infer<typeof adminPostsCreateSchema>;

export const adminPostsUpdateSchema = basePostsCreateSchema.partial({ title: true }).merge(
  z.object({
    updated_at: z.date().transform((val) => val.toISOString()),
  }),
);

export type UpdatePost = z.infer<typeof adminPostsUpdateSchema>;
