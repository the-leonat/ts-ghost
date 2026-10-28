"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BrowseEndpointType: () => BrowseEndpointType,
  TSGhostContentAPI: () => TSGhostContentAPI,
  authorsIncludeSchema: () => authorsIncludeSchema,
  authorsSchema: () => authorsSchema,
  facebook: () => facebook,
  ghostFetchAuthorsSchema: () => ghostFetchAuthorsSchema,
  pagesIncludeSchema: () => pagesIncludeSchema,
  pagesSchema: () => pagesSchema,
  postsIncludeSchema: () => postsIncludeSchema,
  postsSchema: () => postsSchema,
  settingsSchema: () => settingsSchema,
  tagsIncludeSchema: () => tagsIncludeSchema,
  tagsSchema: () => tagsSchema,
  tiersIncludeSchema: () => tiersIncludeSchema,
  tiersSchema: () => tiersSchema,
  twitter: () => twitter
});
module.exports = __toCommonJS(index_exports);

// src/content-api.ts
var import_core_api6 = require("@ts-ghost/core-api");

// src/authors/schemas.ts
var import_zod = require("zod");
var import_core_api = require("@ts-ghost/core-api");
var authorsSchema = import_zod.z.object({
  ...import_core_api.ghostIdentitySchema.shape,
  ...import_core_api.ghostMetadataSchema.shape,
  name: import_zod.z.string(),
  profile_image: import_zod.z.string().nullable(),
  cover_image: import_zod.z.string().nullable(),
  bio: import_zod.z.string().nullable(),
  website: import_zod.z.string().nullable(),
  location: import_zod.z.string().nullable(),
  facebook: import_zod.z.string().nullable(),
  twitter: import_zod.z.string().nullable(),
  count: import_zod.z.object({
    posts: import_zod.z.number()
  }).optional(),
  url: import_zod.z.string().nullish()
});
var ghostFetchAuthorsSchema = import_zod.z.object({
  meta: import_core_api.ghostMetaSchema,
  authors: import_zod.z.array(authorsSchema)
});
var authorsIncludeSchema = import_zod.z.object({
  "count.posts": import_zod.z.literal(true).optional()
});

// src/pages/schemas.ts
var import_zod3 = require("zod");
var import_core_api3 = require("@ts-ghost/core-api");

// src/tags/schemas.ts
var import_zod2 = require("zod");
var import_core_api2 = require("@ts-ghost/core-api");
var tagsSchema = import_zod2.z.object({
  ...import_core_api2.ghostIdentitySchema.shape,
  ...import_core_api2.ghostMetadataSchema.shape,
  ...import_core_api2.ghostCodeInjectionSchema.shape,
  ...import_core_api2.ghostSocialMediaSchema.shape,
  name: import_zod2.z.string(),
  description: import_zod2.z.string().nullable(),
  feature_image: import_zod2.z.string().nullable(),
  visibility: import_core_api2.ghostVisibilitySchema,
  canonical_url: import_zod2.z.string().nullable(),
  accent_color: import_zod2.z.string().nullable(),
  url: import_zod2.z.string(),
  count: import_zod2.z.object({
    posts: import_zod2.z.number()
  }).optional()
});
var tagsIncludeSchema = import_zod2.z.object({
  "count.posts": import_zod2.z.literal(true).optional()
});

// src/pages/schemas.ts
var postsAuthorSchema = authorsSchema.extend({
  url: import_zod3.z.string().nullish()
});
var pagesSchema = import_zod3.z.object({
  ...import_core_api3.ghostIdentitySchema.shape,
  ...import_core_api3.ghostMetadataSchema.shape,
  title: import_zod3.z.string(),
  html: import_zod3.z.string().catch(""),
  plaintext: import_zod3.z.string().nullish(),
  comment_id: import_zod3.z.string().nullable(),
  feature_image: import_zod3.z.string().nullable(),
  feature_image_alt: import_zod3.z.string().nullable(),
  feature_image_caption: import_zod3.z.string().nullable(),
  featured: import_zod3.z.boolean(),
  custom_excerpt: import_zod3.z.string().nullable(),
  ...import_core_api3.ghostCodeInjectionSchema.shape,
  ...import_core_api3.ghostSocialMediaSchema.shape,
  visibility: import_core_api3.ghostVisibilitySchema,
  custom_template: import_zod3.z.string().nullable(),
  canonical_url: import_zod3.z.string().nullable(),
  authors: import_zod3.z.array(postsAuthorSchema).optional(),
  tags: import_zod3.z.array(tagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: tagsSchema.nullish(),
  url: import_zod3.z.string(),
  excerpt: import_zod3.z.string().catch(""),
  reading_time: import_zod3.z.number().optional().default(0),
  created_at: import_zod3.z.string(),
  updated_at: import_zod3.z.string(),
  published_at: import_zod3.z.string(),
  access: import_zod3.z.boolean(),
  comments: import_zod3.z.boolean(),
  email_subject: import_zod3.z.string().nullish()
});
var pagesIncludeSchema = import_zod3.z.object({
  authors: import_zod3.z.literal(true).optional(),
  tags: import_zod3.z.literal(true).optional()
});

// src/posts/schemas.ts
var import_zod4 = require("zod");
var import_core_api4 = require("@ts-ghost/core-api");
var postsAuthorSchema2 = authorsSchema.extend({
  url: import_zod4.z.string().nullish()
});
var postsSchema = import_zod4.z.object({
  ...import_core_api4.ghostIdentitySchema.shape,
  ...import_core_api4.ghostMetadataSchema.shape,
  title: import_zod4.z.string(),
  html: import_zod4.z.string().catch(""),
  plaintext: import_zod4.z.string().nullish(),
  comment_id: import_zod4.z.string().nullable(),
  feature_image: import_zod4.z.string().nullable(),
  feature_image_alt: import_zod4.z.string().nullable(),
  feature_image_caption: import_zod4.z.string().nullable(),
  featured: import_zod4.z.boolean(),
  custom_excerpt: import_zod4.z.string().nullable(),
  ...import_core_api4.ghostCodeInjectionSchema.shape,
  ...import_core_api4.ghostSocialMediaSchema.shape,
  visibility: import_core_api4.ghostVisibilitySchema,
  custom_template: import_zod4.z.string().nullable(),
  canonical_url: import_zod4.z.string().nullable(),
  authors: import_zod4.z.array(postsAuthorSchema2).optional(),
  tags: import_zod4.z.array(tagsSchema).optional(),
  primary_author: postsAuthorSchema2.nullish(),
  primary_tag: tagsSchema.nullish(),
  url: import_zod4.z.string(),
  excerpt: import_zod4.z.string().catch(""),
  reading_time: import_zod4.z.number().optional().default(0),
  created_at: import_zod4.z.string(),
  updated_at: import_zod4.z.string().nullish(),
  published_at: import_zod4.z.string().nullish(),
  access: import_zod4.z.boolean(),
  comments: import_zod4.z.boolean(),
  email_subject: import_zod4.z.string().nullish()
});
var postsIncludeSchema = import_zod4.z.object({
  authors: import_zod4.z.literal(true).optional(),
  tags: import_zod4.z.literal(true).optional()
});

// src/settings/schemas.ts
var import_zod5 = require("zod");
var settingsSchema = import_zod5.z.object({
  title: import_zod5.z.string(),
  description: import_zod5.z.string(),
  logo: import_zod5.z.string().nullable(),
  icon: import_zod5.z.string().nullable(),
  accent_color: import_zod5.z.string().nullable(),
  cover_image: import_zod5.z.string().nullable(),
  facebook: import_zod5.z.string().nullable(),
  twitter: import_zod5.z.string().nullable(),
  lang: import_zod5.z.string(),
  timezone: import_zod5.z.string(),
  codeinjection_head: import_zod5.z.string().nullable(),
  codeinjection_foot: import_zod5.z.string().nullable(),
  navigation: import_zod5.z.array(
    import_zod5.z.object({
      label: import_zod5.z.string(),
      url: import_zod5.z.string()
    })
  ),
  secondary_navigation: import_zod5.z.array(
    import_zod5.z.object({
      label: import_zod5.z.string(),
      url: import_zod5.z.string()
    })
  ),
  meta_title: import_zod5.z.string().nullable(),
  meta_description: import_zod5.z.string().nullable(),
  og_image: import_zod5.z.string().nullable(),
  og_title: import_zod5.z.string().nullable(),
  og_description: import_zod5.z.string().nullable(),
  twitter_image: import_zod5.z.string().nullable(),
  twitter_title: import_zod5.z.string().nullable(),
  twitter_description: import_zod5.z.string().nullable(),
  members_support_address: import_zod5.z.string(),
  url: import_zod5.z.string()
});

// src/tiers/schemas.ts
var import_zod6 = require("zod");
var import_core_api5 = require("@ts-ghost/core-api");
var tiersSchema = import_zod6.z.object({
  ...import_core_api5.ghostIdentitySchema.shape,
  name: import_zod6.z.string(),
  description: import_zod6.z.string().nullable(),
  active: import_zod6.z.boolean(),
  type: import_zod6.z.union([import_zod6.z.literal("free"), import_zod6.z.literal("paid")]),
  welcome_page_url: import_zod6.z.string().nullable(),
  created_at: import_zod6.z.string(),
  updated_at: import_zod6.z.string().nullable(),
  stripe_prices: import_zod6.z.array(import_zod6.z.number()).optional().transform((v) => v?.length ? v : []),
  monthly_price: import_zod6.z.number().nullable().optional().transform((v) => v ? v : null),
  yearly_price: import_zod6.z.number().nullable().optional().transform((v) => v ? v : null),
  benefits: import_zod6.z.array(import_zod6.z.string()),
  visibility: import_core_api5.ghostVisibilitySchema,
  currency: import_zod6.z.string().nullish(),
  trial_days: import_zod6.z.number().default(0)
});
var tiersIncludeSchema = import_zod6.z.object({
  monthly_price: import_zod6.z.literal(true).optional(),
  yearly_price: import_zod6.z.literal(true).optional(),
  benefits: import_zod6.z.literal(true).optional()
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
    const apiCredentials = import_core_api6.contentAPICredentialsSchema.parse({
      key,
      version,
      url
    });
    this.HTTPClientFactoryFactory = new import_core_api6.HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "content"
    });
  }
  HTTPClientFactoryFactory;
  get authors() {
    return new import_core_api6.APIComposer(
      "authors",
      {
        schema: authorsSchema,
        identitySchema: import_core_api6.slugOrIdSchema,
        include: authorsIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new import_core_api6.APIComposer(
      "tiers",
      { schema: tiersSchema, identitySchema: import_core_api6.slugOrIdSchema, include: tiersIncludeSchema },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get posts() {
    return new import_core_api6.APIComposer(
      "posts",
      {
        schema: postsSchema,
        identitySchema: import_core_api6.slugOrIdSchema,
        include: postsIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get pages() {
    return new import_core_api6.APIComposer(
      "pages",
      {
        schema: pagesSchema,
        identitySchema: import_core_api6.slugOrIdSchema,
        include: pagesIncludeSchema
      },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get tags() {
    return new import_core_api6.APIComposer(
      "tags",
      { schema: tagsSchema, identitySchema: import_core_api6.slugOrIdSchema, include: tagsIncludeSchema },
      this.HTTPClientFactoryFactory
    ).access(["browse", "read"]);
  }
  get settings() {
    return new import_core_api6.BasicFetcher("settings", { output: settingsSchema }, this.HTTPClientFactoryFactory.create());
  }
};

// src/helpers/socials.ts
var twitter = (username) => {
  return "https://twitter.com/" + username.replace(/^@/, "");
};
var facebook = (username) => {
  return "https://www.facebook.com/" + username.replace(/^\//, "");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
//# sourceMappingURL=index.js.map