// src/content-api.ts
import {
  APIComposer,
  BasicFetcher,
  contentAPICredentialsSchema,
  HTTPClientFactory,
  slugOrIdSchema
} from "@ts-ghost/core-api";

// src/authors/schemas.ts
import { z } from "zod";
import { ghostIdentitySchema, ghostMetadataSchema, ghostMetaSchema } from "@ts-ghost/core-api";
var authorsSchema = z.object({
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
  count: z.object({
    posts: z.number()
  }).optional(),
  url: z.string().nullish()
});
var ghostFetchAuthorsSchema = z.object({
  meta: ghostMetaSchema,
  authors: z.array(authorsSchema)
});
var authorsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional()
});

// src/pages/schemas.ts
import { z as z3 } from "zod";
import {
  ghostCodeInjectionSchema as ghostCodeInjectionSchema2,
  ghostIdentitySchema as ghostIdentitySchema3,
  ghostMetadataSchema as ghostMetadataSchema3,
  ghostSocialMediaSchema as ghostSocialMediaSchema2,
  ghostVisibilitySchema as ghostVisibilitySchema2
} from "@ts-ghost/core-api";

// src/tags/schemas.ts
import { z as z2 } from "zod";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema as ghostIdentitySchema2,
  ghostMetadataSchema as ghostMetadataSchema2,
  ghostSocialMediaSchema,
  ghostVisibilitySchema
} from "@ts-ghost/core-api";
var tagsSchema = z2.object({
  ...ghostIdentitySchema2.shape,
  ...ghostMetadataSchema2.shape,
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  name: z2.string(),
  description: z2.string().nullable(),
  feature_image: z2.string().nullable(),
  visibility: ghostVisibilitySchema,
  canonical_url: z2.string().nullable(),
  accent_color: z2.string().nullable(),
  url: z2.string(),
  count: z2.object({
    posts: z2.number()
  }).optional()
});
var tagsIncludeSchema = z2.object({
  "count.posts": z2.literal(true).optional()
});

// src/pages/schemas.ts
var postsAuthorSchema = authorsSchema.extend({
  url: z3.string().nullish()
});
var pagesSchema = z3.object({
  ...ghostIdentitySchema3.shape,
  ...ghostMetadataSchema3.shape,
  title: z3.string(),
  html: z3.string().catch(""),
  plaintext: z3.string().nullish(),
  comment_id: z3.string().nullable(),
  feature_image: z3.string().nullable(),
  feature_image_alt: z3.string().nullable(),
  feature_image_caption: z3.string().nullable(),
  featured: z3.boolean(),
  custom_excerpt: z3.string().nullable(),
  ...ghostCodeInjectionSchema2.shape,
  ...ghostSocialMediaSchema2.shape,
  visibility: ghostVisibilitySchema2,
  custom_template: z3.string().nullable(),
  canonical_url: z3.string().nullable(),
  authors: z3.array(postsAuthorSchema).optional(),
  tags: z3.array(tagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: tagsSchema.nullish(),
  url: z3.string(),
  excerpt: z3.string().catch(""),
  reading_time: z3.number().optional().default(0),
  created_at: z3.string(),
  updated_at: z3.string(),
  published_at: z3.string(),
  access: z3.boolean(),
  comments: z3.boolean(),
  email_subject: z3.string().nullish()
});
var pagesIncludeSchema = z3.object({
  authors: z3.literal(true).optional(),
  tags: z3.literal(true).optional()
});

// src/posts/schemas.ts
import { z as z4 } from "zod";
import {
  ghostCodeInjectionSchema as ghostCodeInjectionSchema3,
  ghostIdentitySchema as ghostIdentitySchema4,
  ghostMetadataSchema as ghostMetadataSchema4,
  ghostSocialMediaSchema as ghostSocialMediaSchema3,
  ghostVisibilitySchema as ghostVisibilitySchema3
} from "@ts-ghost/core-api";
var postsAuthorSchema2 = authorsSchema.extend({
  url: z4.string().nullish()
});
var postsSchema = z4.object({
  ...ghostIdentitySchema4.shape,
  ...ghostMetadataSchema4.shape,
  title: z4.string(),
  html: z4.string().catch(""),
  plaintext: z4.string().nullish(),
  comment_id: z4.string().nullable(),
  feature_image: z4.string().nullable(),
  feature_image_alt: z4.string().nullable(),
  feature_image_caption: z4.string().nullable(),
  featured: z4.boolean(),
  custom_excerpt: z4.string().nullable(),
  ...ghostCodeInjectionSchema3.shape,
  ...ghostSocialMediaSchema3.shape,
  visibility: ghostVisibilitySchema3,
  custom_template: z4.string().nullable(),
  canonical_url: z4.string().nullable(),
  authors: z4.array(postsAuthorSchema2).optional(),
  tags: z4.array(tagsSchema).optional(),
  primary_author: postsAuthorSchema2.nullish(),
  primary_tag: tagsSchema.nullish(),
  url: z4.string(),
  excerpt: z4.string().catch(""),
  reading_time: z4.number().optional().default(0),
  created_at: z4.string(),
  updated_at: z4.string().nullish(),
  published_at: z4.string().nullish(),
  access: z4.boolean(),
  comments: z4.boolean(),
  email_subject: z4.string().nullish()
});
var postsIncludeSchema = z4.object({
  authors: z4.literal(true).optional(),
  tags: z4.literal(true).optional()
});

// src/settings/schemas.ts
import { z as z5 } from "zod";
var settingsSchema = z5.object({
  title: z5.string(),
  description: z5.string(),
  logo: z5.string().nullable(),
  icon: z5.string().nullable(),
  accent_color: z5.string().nullable(),
  cover_image: z5.string().nullable(),
  facebook: z5.string().nullable(),
  twitter: z5.string().nullable(),
  lang: z5.string(),
  timezone: z5.string(),
  codeinjection_head: z5.string().nullable(),
  codeinjection_foot: z5.string().nullable(),
  navigation: z5.array(
    z5.object({
      label: z5.string(),
      url: z5.string()
    })
  ),
  secondary_navigation: z5.array(
    z5.object({
      label: z5.string(),
      url: z5.string()
    })
  ),
  meta_title: z5.string().nullable(),
  meta_description: z5.string().nullable(),
  og_image: z5.string().nullable(),
  og_title: z5.string().nullable(),
  og_description: z5.string().nullable(),
  twitter_image: z5.string().nullable(),
  twitter_title: z5.string().nullable(),
  twitter_description: z5.string().nullable(),
  members_support_address: z5.string(),
  url: z5.string()
});

// src/tiers/schemas.ts
import { z as z6 } from "zod";
import { ghostIdentitySchema as ghostIdentitySchema5, ghostVisibilitySchema as ghostVisibilitySchema4 } from "@ts-ghost/core-api";
var tiersSchema = z6.object({
  ...ghostIdentitySchema5.shape,
  name: z6.string(),
  description: z6.string().nullable(),
  active: z6.boolean(),
  type: z6.union([z6.literal("free"), z6.literal("paid")]),
  welcome_page_url: z6.string().nullable(),
  created_at: z6.string(),
  updated_at: z6.string().nullable(),
  stripe_prices: z6.array(z6.number()).optional().transform((v) => v?.length ? v : []),
  monthly_price: z6.number().nullable().optional().transform((v) => v ? v : null),
  yearly_price: z6.number().nullable().optional().transform((v) => v ? v : null),
  benefits: z6.array(z6.string()),
  visibility: ghostVisibilitySchema4,
  currency: z6.string().nullish(),
  trial_days: z6.number().default(0)
});
var tiersIncludeSchema = z6.object({
  monthly_price: z6.literal(true).optional(),
  yearly_price: z6.literal(true).optional(),
  benefits: z6.literal(true).optional()
});

// src/content-api.ts
var BrowseEndpointType = /* @__PURE__ */ ((BrowseEndpointType2) => {
  BrowseEndpointType2["authors"] = "authors";
  BrowseEndpointType2["tiers"] = "tiers";
  BrowseEndpointType2["posts"] = "posts";
  BrowseEndpointType2["pages"] = "pages";
  BrowseEndpointType2["tags"] = "tags";
  BrowseEndpointType2["settings"] = "settings";
  return BrowseEndpointType2;
})(BrowseEndpointType || {});
var TSGhostContentAPI = class {
  constructor(url, key, version, options) {
    this.url = url;
    this.key = key;
    this.version = version;
    this.options = options;
    const apiCredentials = contentAPICredentialsSchema.parse({
      key,
      version,
      url
    });
    this.HTTPClientFactoryFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "content"
    });
  }
  HTTPClientFactoryFactory;
  get authors() {
    return new APIComposer(
      "authors",
      {
        schema: authorsSchema,
        identitySchema: slugOrIdSchema,
        include: authorsIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new APIComposer(
      "tiers",
      { schema: tiersSchema, identitySchema: slugOrIdSchema, include: tiersIncludeSchema },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get posts() {
    return new APIComposer(
      "posts",
      {
        schema: postsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get pages() {
    return new APIComposer(
      "pages",
      {
        schema: pagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get tags() {
    return new APIComposer(
      "tags",
      { schema: tagsSchema, identitySchema: slugOrIdSchema, include: tagsIncludeSchema },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get settings() {
    return new BasicFetcher("settings", { output: settingsSchema }, this.HTTPClientFactoryFactory.create());
  }
};

// src/helpers/socials.ts
var twitter = (username) => {
  return "https://twitter.com/" + username.replace(/^@/, "");
};
var facebook = (username) => {
  return "https://www.facebook.com/" + username.replace(/^\//, "");
};
export {
  BrowseEndpointType,
  TSGhostContentAPI,
  authorsIncludeSchema,
  authorsSchema,
  facebook,
  ghostFetchAuthorsSchema,
  pagesIncludeSchema,
  pagesSchema,
  postsIncludeSchema,
  postsSchema,
  settingsSchema,
  tagsIncludeSchema,
  tagsSchema,
  tiersIncludeSchema,
  tiersSchema,
  twitter
};
//# sourceMappingURL=index.mjs.map