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
  APIComposer: () => APIComposer,
  BasicFetcher: () => BasicFetcher,
  BrowseFetcher: () => BrowseFetcher,
  DeleteFetcher: () => DeleteFetcher,
  HTTPClient: () => HTTPClient,
  HTTPClientFactory: () => HTTPClientFactory,
  MutationFetcher: () => MutationFetcher,
  ReadFetcher: () => ReadFetcher,
  adminAPICredentialsSchema: () => adminAPICredentialsSchema,
  apiVersionsSchema: () => apiVersionsSchema,
  baseAuthorsSchema: () => baseAuthorsSchema,
  baseEmailSchema: () => baseEmailSchema,
  baseMembersSchema: () => baseMembersSchema,
  baseNewsletterSchema: () => baseNewsletterSchema,
  baseOffersSchema: () => baseOffersSchema,
  basePagesSchema: () => basePagesSchema,
  basePostsSchema: () => basePostsSchema,
  baseSettingsSchema: () => baseSettingsSchema,
  baseSiteSchema: () => baseSiteSchema,
  baseTagsSchema: () => baseTagsSchema,
  baseTiersSchema: () => baseTiersSchema,
  browseParamsSchema: () => browseParamsSchema,
  contentAPICredentialsSchema: () => contentAPICredentialsSchema,
  emailOrIdSchema: () => emailOrIdSchema,
  ghostCodeInjectionSchema: () => ghostCodeInjectionSchema,
  ghostExcerptSchema: () => ghostExcerptSchema,
  ghostFacebookSchema: () => ghostFacebookSchema,
  ghostIdentityInputSchema: () => ghostIdentityInputSchema,
  ghostIdentitySchema: () => ghostIdentitySchema,
  ghostMetaSchema: () => ghostMetaSchema,
  ghostMetadataSchema: () => ghostMetadataSchema,
  ghostSocialMediaSchema: () => ghostSocialMediaSchema,
  ghostTwitterSchema: () => ghostTwitterSchema,
  ghostVisibilitySchema: () => ghostVisibilitySchema,
  identitySchema: () => identitySchema,
  parseBrowseParams: () => parseBrowseParams,
  resolveDebugLogger: () => resolveDebugLogger,
  schemaWithPickedFields: () => schemaWithPickedFields,
  slugOrIdSchema: () => slugOrIdSchema
});
module.exports = __toCommonJS(index_exports);

// src/schemas/authors.ts
var import_zod2 = require("zod");

// src/schemas/shared.ts
var import_zod = require("zod");
var ghostIdentitySchema = import_zod.z.object({
  slug: import_zod.z.string(),
  id: import_zod.z.string()
});
var ghostIdentityInputSchema = import_zod.z.object({
  slug: import_zod.z.string().optional(),
  id: import_zod.z.string().optional(),
  email: import_zod.z.email().optional()
});
var ghostMetaSchema = import_zod.z.object({
  pagination: import_zod.z.object({
    pages: import_zod.z.number(),
    page: import_zod.z.number(),
    limit: import_zod.z.union([import_zod.z.number(), import_zod.z.literal("all")]),
    total: import_zod.z.number(),
    prev: import_zod.z.number().nullable(),
    next: import_zod.z.number().nullable()
  })
});
var ghostExcerptSchema = import_zod.z.object({
  excerpt: import_zod.z.string().optional(),
  custom_excerpt: import_zod.z.string().optional()
});
var ghostCodeInjectionSchema = import_zod.z.object({
  codeinjection_head: import_zod.z.string().nullable(),
  codeinjection_foot: import_zod.z.string().nullable()
});
var ghostFacebookSchema = import_zod.z.object({
  og_image: import_zod.z.string().nullable(),
  og_title: import_zod.z.string().nullable(),
  og_description: import_zod.z.string().nullable()
});
var ghostTwitterSchema = import_zod.z.object({
  twitter_image: import_zod.z.string().nullable(),
  twitter_title: import_zod.z.string().nullable(),
  twitter_description: import_zod.z.string().nullable()
});
var ghostSocialMediaSchema = import_zod.z.object({
  ...ghostFacebookSchema.shape,
  ...ghostTwitterSchema.shape
});
var ghostMetadataSchema = import_zod.z.object({
  meta_title: import_zod.z.string().nullable(),
  meta_description: import_zod.z.string().nullable()
});
var ghostVisibilitySchema = import_zod.z.union([
  import_zod.z.literal("public"),
  import_zod.z.literal("members"),
  import_zod.z.literal("none"),
  import_zod.z.literal("internal"),
  import_zod.z.literal("paid"),
  import_zod.z.literal("tiers")
]);
var apiVersionsSchema = import_zod.z.string().startsWith("v5.").or(import_zod.z.string().startsWith("v6.")).default("v6.0");
var contentAPICredentialsSchema = import_zod.z.object({
  key: import_zod.z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
  version: apiVersionsSchema,
  url: import_zod.z.string().url()
});
var adminAPICredentialsSchema = import_zod.z.object({
  key: import_zod.z.string().regex(/[0-9a-f]{24}:[0-9a-f]{64}/, {
    message: "'key' must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters"
  }),
  version: apiVersionsSchema,
  url: import_zod.z.string().url()
});
var slugOrIdSchema = import_zod.z.union([import_zod.z.object({ slug: import_zod.z.string() }), import_zod.z.object({ id: import_zod.z.string() })]);
var emailOrIdSchema = import_zod.z.union([
  import_zod.z.object({ email: import_zod.z.string().email() }),
  import_zod.z.object({ id: import_zod.z.string() })
]);
var identitySchema = import_zod.z.union([
  import_zod.z.object({ email: import_zod.z.string().email() }),
  import_zod.z.object({ id: import_zod.z.string() }),
  import_zod.z.object({ slug: import_zod.z.string() })
]);

// src/schemas/authors.ts
var baseAuthorsSchema = import_zod2.z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  name: import_zod2.z.string(),
  profile_image: import_zod2.z.string().nullable(),
  cover_image: import_zod2.z.string().nullable(),
  bio: import_zod2.z.string().nullable(),
  website: import_zod2.z.string().nullable(),
  location: import_zod2.z.string().nullable(),
  facebook: import_zod2.z.string().nullable(),
  twitter: import_zod2.z.string().nullable(),
  count: import_zod2.z.object({
    posts: import_zod2.z.number()
  }).optional(),
  url: import_zod2.z.string().nullish()
});

// src/schemas/pages.ts
var import_zod4 = require("zod");

// src/schemas/tags.ts
var import_zod3 = require("zod");
var baseTagsSchema = import_zod3.z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  name: import_zod3.z.string(),
  description: import_zod3.z.string().nullable(),
  feature_image: import_zod3.z.string().nullable(),
  visibility: ghostVisibilitySchema,
  canonical_url: import_zod3.z.string().nullable(),
  accent_color: import_zod3.z.string().nullable(),
  url: import_zod3.z.string(),
  created_at: import_zod3.z.string().nullish(),
  updated_at: import_zod3.z.string().nullish(),
  count: import_zod3.z.object({
    posts: import_zod3.z.number()
  }).optional()
});

// src/schemas/pages.ts
var postsAuthorSchema = baseAuthorsSchema.extend({
  url: import_zod4.z.string().nullish()
});
var basePagesSchema = import_zod4.z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: import_zod4.z.string(),
  html: import_zod4.z.string().nullish(),
  plaintext: import_zod4.z.string().nullish(),
  comment_id: import_zod4.z.string().nullable(),
  feature_image: import_zod4.z.string().nullable(),
  feature_image_alt: import_zod4.z.string().nullable(),
  feature_image_caption: import_zod4.z.string().nullable(),
  featured: import_zod4.z.boolean(),
  custom_excerpt: import_zod4.z.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: import_zod4.z.string().nullable(),
  canonical_url: import_zod4.z.string().nullable(),
  authors: import_zod4.z.array(postsAuthorSchema).optional(),
  tags: import_zod4.z.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: baseTagsSchema.nullish(),
  url: import_zod4.z.string(),
  excerpt: import_zod4.z.string().nullish(),
  reading_time: import_zod4.z.number().optional().default(0),
  created_at: import_zod4.z.string(),
  updated_at: import_zod4.z.string().nullish(),
  published_at: import_zod4.z.string().nullable(),
  email_subject: import_zod4.z.string().nullish(),
  is_page: import_zod4.z.boolean().default(true)
});

// src/schemas/posts.ts
var import_zod5 = require("zod");
var postsAuthorSchema2 = baseAuthorsSchema.extend({
  url: import_zod5.z.string().nullish()
});
var basePostsSchema = import_zod5.z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: import_zod5.z.string(),
  html: import_zod5.z.string().nullish(),
  plaintext: import_zod5.z.string().nullish(),
  comment_id: import_zod5.z.string().nullable(),
  feature_image: import_zod5.z.string().nullable(),
  feature_image_alt: import_zod5.z.string().nullable(),
  feature_image_caption: import_zod5.z.string().nullable(),
  featured: import_zod5.z.boolean(),
  custom_excerpt: import_zod5.z.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: import_zod5.z.string().nullable(),
  canonical_url: import_zod5.z.string().nullable(),
  authors: import_zod5.z.array(postsAuthorSchema2).optional(),
  tags: import_zod5.z.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema2.nullish(),
  primary_tag: baseTagsSchema.nullish(),
  url: import_zod5.z.string(),
  excerpt: import_zod5.z.string().nullable(),
  reading_time: import_zod5.z.number().optional().default(0),
  created_at: import_zod5.z.string(),
  updated_at: import_zod5.z.string().nullish(),
  published_at: import_zod5.z.string().nullable(),
  email_subject: import_zod5.z.string().nullish(),
  is_page: import_zod5.z.boolean().default(false)
});

// src/schemas/settings.ts
var import_zod6 = require("zod");
var baseSettingsSchema = import_zod6.z.object({
  title: import_zod6.z.string(),
  description: import_zod6.z.string(),
  logo: import_zod6.z.string().nullable(),
  icon: import_zod6.z.string().nullable(),
  accent_color: import_zod6.z.string().nullable(),
  cover_image: import_zod6.z.string().nullable(),
  facebook: import_zod6.z.string().nullable(),
  twitter: import_zod6.z.string().nullable(),
  lang: import_zod6.z.string(),
  timezone: import_zod6.z.string(),
  codeinjection_head: import_zod6.z.string().nullable(),
  codeinjection_foot: import_zod6.z.string().nullable(),
  navigation: import_zod6.z.array(
    import_zod6.z.object({
      label: import_zod6.z.string(),
      url: import_zod6.z.string()
    })
  ),
  secondary_navigation: import_zod6.z.array(
    import_zod6.z.object({
      label: import_zod6.z.string(),
      url: import_zod6.z.string()
    })
  ),
  meta_title: import_zod6.z.string().nullable(),
  meta_description: import_zod6.z.string().nullable(),
  og_image: import_zod6.z.string().nullable(),
  og_title: import_zod6.z.string().nullable(),
  og_description: import_zod6.z.string().nullable(),
  twitter_image: import_zod6.z.string().nullable(),
  twitter_title: import_zod6.z.string().nullable(),
  twitter_description: import_zod6.z.string().nullable(),
  members_support_address: import_zod6.z.string(),
  url: import_zod6.z.string()
});

// src/schemas/tiers.ts
var import_zod7 = require("zod");
var baseTiersSchema = import_zod7.z.object({
  ...ghostIdentitySchema.shape,
  name: import_zod7.z.string(),
  description: import_zod7.z.string().nullable(),
  active: import_zod7.z.boolean(),
  type: import_zod7.z.union([import_zod7.z.literal("free"), import_zod7.z.literal("paid")]),
  welcome_page_url: import_zod7.z.string().nullable(),
  created_at: import_zod7.z.string(),
  updated_at: import_zod7.z.string().nullable(),
  stripe_prices: import_zod7.z.array(import_zod7.z.number()).optional().transform((v) => v?.length ? v : []),
  monthly_price: import_zod7.z.number().nullable().optional().transform((v) => v ? v : null),
  yearly_price: import_zod7.z.number().nullable().optional().transform((v) => v ? v : null),
  benefits: import_zod7.z.array(import_zod7.z.string()).optional(),
  visibility: ghostVisibilitySchema,
  currency: import_zod7.z.string().nullish(),
  trial_days: import_zod7.z.number().default(0)
});

// src/schemas/email.ts
var import_zod8 = require("zod");
var baseEmailSchema = import_zod8.z.object({
  id: import_zod8.z.string(),
  uuid: import_zod8.z.string(),
  status: import_zod8.z.string(),
  recipient_filter: import_zod8.z.string(),
  error: import_zod8.z.string().nullish(),
  error_data: import_zod8.z.any().nullable(),
  email_count: import_zod8.z.number(),
  delivered_count: import_zod8.z.number(),
  opened_count: import_zod8.z.number(),
  failed_count: import_zod8.z.number(),
  subject: import_zod8.z.string(),
  from: import_zod8.z.string(),
  reply_to: import_zod8.z.string().nullable(),
  source: import_zod8.z.string(),
  // lexical format
  html: import_zod8.z.string().nullable(),
  plaintext: import_zod8.z.string().nullable(),
  track_opens: import_zod8.z.boolean(),
  submitted_at: import_zod8.z.string(),
  created_at: import_zod8.z.string(),
  updated_at: import_zod8.z.string()
});

// src/schemas/offers.ts
var import_zod9 = require("zod");
var baseOffersSchema = import_zod9.z.object({
  id: import_zod9.z.string(),
  name: import_zod9.z.string().meta({ description: "Internal name for an offer, must be unique" }).default(""),
  code: import_zod9.z.string().meta({ description: "Shortcode for the offer, for example: https://yoursite.com/black-friday" }),
  display_title: import_zod9.z.string().meta({ description: "Name displayed in the offer window" }).nullish(),
  display_description: import_zod9.z.string().meta({ description: "Text displayed in the offer window" }).nullish(),
  type: import_zod9.z.union([import_zod9.z.literal("percent"), import_zod9.z.literal("fixed"), import_zod9.z.literal("trial")]),
  cadence: import_zod9.z.union([import_zod9.z.literal("month"), import_zod9.z.literal("year")]),
  amount: import_zod9.z.number().meta({
    description: `Offer discount amount, as a percentage or fixed value as set in type. 
      Amount is always denoted by the smallest currency unit 
      (e.g., 100 cents instead of $1.00 in USD)`
  }),
  duration: import_zod9.z.union([import_zod9.z.literal("once"), import_zod9.z.literal("forever"), import_zod9.z.literal("repeating"), import_zod9.z.literal("trial")]).meta({
    description: "once/forever/repeating. repeating duration is only available when cadence is month"
  }),
  duration_in_months: import_zod9.z.number().meta({ description: "Number of months offer should be repeated when duration is repeating" }).nullish(),
  currency_restriction: import_zod9.z.boolean().meta({
    description: "Denotes whether the offer `currency` is restricted. If so, changing the currency invalidates the offer"
  }).nullish(),
  currency: import_zod9.z.string().meta({
    description: "fixed type offers only - specifies tier's currency as three letter ISO currency code"
  }).nullish(),
  status: import_zod9.z.union([import_zod9.z.literal("active"), import_zod9.z.literal("archived")]).meta({
    description: "active or archived - denotes if the offer is active or archived"
  }),
  redemption_count: import_zod9.z.number().meta({ description: "Number of times the offer has been redeemed" }).nullish(),
  tier: import_zod9.z.object({
    id: import_zod9.z.string(),
    name: import_zod9.z.string().nullish()
  }).meta({ description: "Tier on which offer is applied" })
});

// src/schemas/members.ts
var import_zod12 = require("zod");

// src/schemas/newsletter.ts
var import_zod10 = require("zod");
var baseNewsletterSchema = import_zod10.z.object({
  ...ghostIdentitySchema.shape,
  name: import_zod10.z.string().meta({ description: "Public name for the newsletter" }),
  description: import_zod10.z.string().meta({ description: "(nullable) Public description of the newsletter" }).nullish(),
  sender_name: import_zod10.z.string().meta({ description: "(nullable) The sender name of the emails" }).nullish(),
  sender_email: import_zod10.z.string().meta({ description: "(nullable) The email from which to send emails. Requires validation." }).nullish(),
  sender_reply_to: import_zod10.z.string().meta({
    description: "The reply-to email address for sent emails. Can be either newsletter (= use sender_email) or support (use support email from Portal settings)."
  }),
  status: import_zod10.z.union([import_zod10.z.literal("active"), import_zod10.z.literal("archived")]).meta({
    description: "active or archived - denotes if the newsletter is active or archived"
  }),
  visibility: import_zod10.z.union([import_zod10.z.literal("public"), import_zod10.z.literal("members")]),
  subscribe_on_signup: import_zod10.z.boolean().meta({
    description: "true/false. Whether members should automatically subscribe to this newsletter on signup"
  }),
  sort_order: import_zod10.z.number().meta({ description: "The order in which newsletters are displayed in the Portal" }),
  header_image: import_zod10.z.string().meta({
    description: "(nullable) Path to an image to show at the top of emails. Recommended size 1200x600"
  }).nullish(),
  show_header_icon: import_zod10.z.boolean().meta({ description: "true/false. Show the site icon in emails" }),
  show_header_title: import_zod10.z.boolean().meta({ description: "true/false. Show the site name in emails" }),
  title_font_category: import_zod10.z.union([import_zod10.z.literal("serif"), import_zod10.z.literal("sans_serif")]).meta({
    description: "Title font style. Either serif or sans_serif"
  }),
  title_alignment: import_zod10.z.string().nullish(),
  show_feature_image: import_zod10.z.boolean().meta({ description: "true/false. Show the post's feature image in emails" }),
  body_font_category: import_zod10.z.union([import_zod10.z.literal("serif"), import_zod10.z.literal("sans_serif")]).meta({
    description: "Body font style. Either serif or sans_serif"
  }),
  footer_content: import_zod10.z.string().meta({
    description: "(nullable) Extra information or legal text to show in the footer of emails. Should contain valid HTML."
  }).nullish(),
  show_badge: import_zod10.z.boolean().meta({
    description: "true/false. Show you\u2019re a part of the indie publishing movement by adding a small Ghost badge in the footer"
  }),
  created_at: import_zod10.z.string(),
  updated_at: import_zod10.z.string().nullish(),
  show_header_name: import_zod10.z.boolean().meta({ description: "true/false. Show the newsletter name in emails" }),
  uuid: import_zod10.z.string()
});

// src/schemas/subscriptions.ts
var import_zod11 = require("zod");
var baseSubscriptionsSchema = import_zod11.z.object({
  id: import_zod11.z.string().meta({ description: "Stripe subscription ID sub_XXXX" }),
  customer: import_zod11.z.object({
    id: import_zod11.z.string(),
    name: import_zod11.z.string().nullable(),
    email: import_zod11.z.string()
  }).meta({ description: "Stripe customer attached to the subscription" }),
  status: import_zod11.z.string().meta({ description: "Subscription status" }),
  start_date: import_zod11.z.string().meta({ description: "Subscription start date" }),
  default_payment_card_last4: import_zod11.z.string().meta({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: import_zod11.z.boolean().meta({
    description: "If the subscription should be canceled or renewed at period end"
  }),
  cancellation_reason: import_zod11.z.string().meta({ description: "Reason for subscription cancellation" }).nullable(),
  current_period_end: import_zod11.z.string().meta({ description: "Subscription end date" }),
  price: import_zod11.z.object({
    id: import_zod11.z.string().meta({ description: "Stripe price ID" }),
    price_id: import_zod11.z.string().meta({ description: "Ghost price ID" }),
    nickname: import_zod11.z.string().meta({ description: "Price nickname" }),
    amount: import_zod11.z.number().meta({ description: "Price amount" }),
    interval: import_zod11.z.string().meta({ description: "Price interval" }),
    type: import_zod11.z.string().meta({ description: "Price type" }),
    currency: import_zod11.z.string().meta({ description: "Price currency" })
  }),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish()
});

// src/schemas/members.ts
var baseMembersSchema = import_zod12.z.object({
  id: import_zod12.z.string(),
  email: import_zod12.z.string().meta({ description: "The email address of the member" }),
  name: import_zod12.z.string().meta({ description: "The name of the member" }).nullable(),
  note: import_zod12.z.string().meta({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: import_zod12.z.string().meta({ description: "(nullable) The geolocation of the member" }).nullish(),
  created_at: import_zod12.z.string().meta({ description: "The date and time the member was created" }),
  updated_at: import_zod12.z.string().meta({ description: "(nullable) The date and time the member was last updated" }).nullish(),
  labels: import_zod12.z.array(
    import_zod12.z.object({
      id: import_zod12.z.string().meta({ description: "The ID of the label" }),
      name: import_zod12.z.string().meta({ description: "The name of the label" }),
      slug: import_zod12.z.string().meta({ description: "The slug of the label" }),
      created_at: import_zod12.z.string().meta({ description: "The date and time the label was created" }),
      updated_at: import_zod12.z.string().meta({ description: "(nullable) The date and time the label was last updated" }).nullish()
    }).meta({ description: "The labels associated with the member" })
  ),
  subscriptions: import_zod12.z.array(baseSubscriptionsSchema).meta({ description: "The subscriptions associated with the member" }),
  avatar_image: import_zod12.z.string().meta({ description: "The URL of the member's avatar image" }),
  email_count: import_zod12.z.number().meta({ description: "The number of emails sent to the member" }),
  email_opened_count: import_zod12.z.number().meta({ description: "The number of emails opened by the member" }),
  email_open_rate: import_zod12.z.number().meta({ description: "(nullable) The open rate of the member" }).nullish(),
  status: import_zod12.z.string().meta({ description: "The status of the member" }),
  last_seen_at: import_zod12.z.string().meta({ description: "(nullable) The date and time the member was last seen" }).nullish(),
  newsletters: import_zod12.z.array(baseNewsletterSchema)
});

// src/schemas/site.ts
var import_zod13 = require("zod");
var baseSiteSchema = import_zod13.z.object({
  title: import_zod13.z.string(),
  description: import_zod13.z.string(),
  logo: import_zod13.z.string().nullable(),
  version: import_zod13.z.string(),
  url: import_zod13.z.string()
});

// src/fetchers/browse-fetcher.ts
var import_zod14 = require("zod");

// src/fetchers/formats.ts
var contentFormats = ["html", "mobiledoc", "plaintext", "lexical"];

// src/helpers/masks.ts
var getKnownSchemaKeys = (schema) => {
  return new Set(schema.keyof().options);
};
var sanitizeMask = (schema, mask, options = {}) => {
  const knownKeys = getKnownSchemaKeys(schema);
  return Object.fromEntries(
    Object.entries(mask).filter(
      ([key]) => knownKeys.has(key) && (!options.excludeDotNotation || !key.includes("."))
    )
  );
};
var sanitizeFormatMask = (schema, mask) => {
  const knownKeys = getKnownSchemaKeys(schema);
  return Object.fromEntries(Object.entries(mask).filter(([key]) => knownKeys.has(key) && contentFormats.includes(key)));
};

// src/fetchers/browse-fetcher.ts
var BrowseFetcher = class _BrowseFetcher {
  constructor(resource, config, _params = { browseParams: {}, include: [], fields: {} }, httpClient) {
    this.resource = resource;
    this.config = config;
    this._params = _params;
    this.httpClient = httpClient;
    this._buildUrlParams();
  }
  _urlParams = {};
  _urlSearchParams = void 0;
  _includeFields = [];
  /**
   * Lets you choose output format for the content of Post and Pages resources
   * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
   * with the selected formats required.
   *
   * @param formats html, mobiledoc or plaintext
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  formats(formats) {
    const requiredFormats = sanitizeFormatMask(this.config.output, formats);
    const params = {
      ...this._params,
      formats: Object.keys(requiredFormats).filter((key) => contentFormats.includes(key))
    };
    return new _BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(requiredFormats),
        include: this.config.include
      },
      params,
      this.httpClient
    );
  }
  /**
   * Let's you include special keys into the Ghost API Query to retrieve complimentary info
   * The available keys are defined by the Resource include schema, will not care about unknown keys.
   * Returns a new Fetcher with an Output shape modified with the include keys required.
   *
   * @param include Include specific keys from the include shape
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  include(include) {
    const parsedInclude = this.config.include.parse(include);
    const params = {
      ...this._params,
      include: Object.keys(parsedInclude)
    };
    const requiredIncludeKeys = sanitizeMask(this.config.output, parsedInclude, { excludeDotNotation: true });
    return new _BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(requiredIncludeKeys),
        include: this.config.include
      },
      params,
      this.httpClient
    );
  }
  /**
   * Let's you strip the output to only the specified keys of your choice that are in the config Schema
   * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
   *
   * @param fields Any keys from the resource Schema
   * @returns A new Fetcher with the fixed output shape having only the selected Fields
   */
  fields(fields) {
    const pickedFields = sanitizeMask(this.config.output, fields);
    const newOutput = this.config.output.pick(pickedFields);
    return new _BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include
      },
      this._params,
      this.httpClient
    );
  }
  getResource() {
    return this.resource;
  }
  getParams() {
    return this._params;
  }
  getOutputFields() {
    return this.config.output.keyof().options;
  }
  getURLSearchParams() {
    return this._urlSearchParams;
  }
  getIncludes() {
    return this._params?.include || [];
  }
  getFormats() {
    return this._params?.formats || [];
  }
  _buildUrlParams() {
    const inputKeys = this.config.schema.keyof().options;
    const outputKeys = this.config.output.keyof().options;
    this._urlParams = {
      ...this._urlBrowseParams()
    };
    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.filter((key) => key !== "count").join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }
  _urlBrowseParams() {
    let urlBrowseParams = {};
    if (this._params.browseParams === void 0) return {};
    const { limit, page, ...params } = this._params.browseParams;
    urlBrowseParams = {
      ...params
    };
    if (limit) {
      urlBrowseParams.limit = limit.toString();
    }
    if (page) {
      urlBrowseParams.page = page.toString();
    }
    return urlBrowseParams;
  }
  _getResultSchema() {
    return import_zod14.z.discriminatedUnion("success", [
      import_zod14.z.object({
        success: import_zod14.z.literal(true),
        meta: ghostMetaSchema,
        data: import_zod14.z.array(this.config.output)
      }),
      import_zod14.z.object({
        success: import_zod14.z.literal(false),
        errors: import_zod14.z.array(
          import_zod14.z.object({
            type: import_zod14.z.string(),
            message: import_zod14.z.string()
          })
        ),
        status: import_zod14.z.number()
      })
    ]);
  }
  async fetch(options) {
    const resultSchema = this._getResultSchema();
    const { data: result, status } = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      options
    });
    let data = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
      data.status = status;
    } else {
      data = {
        success: true,
        meta: result.meta || {
          pagination: {
            pages: 0,
            page: 0,
            limit: 15,
            total: 0,
            prev: null,
            next: null
          }
        },
        data: result[this.resource]
      };
    }
    return resultSchema.parse(data);
  }
  async paginate(options) {
    if (!this._params.browseParams?.page) {
      this._params.browseParams = {
        ...this._params.browseParams,
        page: 1
      };
      this._buildUrlParams();
    }
    const resultSchema = this._getResultSchema();
    const { data: result, status } = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      options
    });
    let data = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
      data.status = status;
    } else {
      data = {
        success: true,
        meta: result.meta || {
          pagination: {
            pages: 0,
            page: 0,
            limit: 15,
            total: 0,
            prev: null,
            next: null
          }
        },
        data: result[this.resource]
      };
    }
    const response = {
      current: resultSchema.parse(data),
      next: void 0
    };
    if (response.current.success === false) return response;
    const { meta } = response.current;
    if (meta.pagination.pages <= 1 || meta.pagination.page === meta.pagination.pages) return response;
    const params = {
      ...this._params,
      browseParams: {
        ...this._params.browseParams,
        page: meta.pagination.page + 1
      }
    };
    const next = new _BrowseFetcher(this.resource, this.config, params, this.httpClient);
    response.next = next;
    return response;
  }
};

// src/fetchers/read-fetcher.ts
var import_zod15 = require("zod");
var ReadFetcher = class _ReadFetcher {
  constructor(resource, config, _params, httpClient) {
    this.resource = resource;
    this.config = config;
    this._params = _params;
    this.httpClient = httpClient;
    this._buildUrlParams();
  }
  _urlParams = {};
  _urlSearchParams = void 0;
  _pathnameIdentity = void 0;
  _includeFields = [];
  /**
   * Lets you choose output format for the content of Post and Pages resources
   * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
   * with the selected formats required.
   *
   * @param formats html, mobiledoc or plaintext
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  formats(formats) {
    const requiredFormats = sanitizeFormatMask(this.config.output, formats);
    const newOutput = this.config.output.required(requiredFormats);
    const params = {
      ...this._params,
      formats: Object.keys(requiredFormats).filter((key) => contentFormats.includes(key))
    };
    return new _ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include
      },
      params,
      this.httpClient
    );
  }
  /**
   * Let's you include special keys into the Ghost API Query to retrieve complimentary info
   * The available keys are defined by the Resource include schema, will not care about unknown keys.
   * Returns a new Fetcher with an Output shape modified with the include keys required.
   *
   * @param include Include specific keys from the include shape
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  include(include) {
    const parsedInclude = this.config.include.parse(include);
    const params = {
      ...this._params,
      include: Object.keys(parsedInclude)
    };
    const requiredIncludeKeys = sanitizeMask(this.config.output, parsedInclude, { excludeDotNotation: true });
    return new _ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(requiredIncludeKeys),
        include: this.config.include
      },
      params,
      this.httpClient
    );
  }
  /**
   * Let's you strip the output to only the specified keys of your choice that are in the config Schema
   * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
   *
   * @param fields Any keys from the resource Schema
   * @returns A new Fetcher with the fixed output shape having only the selected Fields
   */
  fields(fields) {
    const pickedFields = sanitizeMask(this.config.output, fields);
    const newOutput = this.config.output.pick(pickedFields);
    return new _ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include
      },
      this._params,
      this.httpClient
    );
  }
  getResource() {
    return this.resource;
  }
  getParams() {
    return this._params;
  }
  getOutputFields() {
    return this.config.output.keyof().options;
  }
  getIncludes() {
    return this._params?.include || [];
  }
  getFormats() {
    return this._params?.formats || [];
  }
  _buildUrlParams() {
    const inputKeys = this.config.schema.keyof().options;
    const outputKeys = this.config.output.keyof().options;
    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }
    if (this._params.identity.id) {
      this._pathnameIdentity = `${this._params.identity.id}`;
    } else if (this._params.identity.slug) {
      this._pathnameIdentity = `slug/${this._params.identity.slug}`;
    } else if (this._params.identity.email) {
      this._pathnameIdentity = `email/${this._params.identity.email}`;
    } else {
      throw new Error("Identity is not defined");
    }
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }
  async fetch(options) {
    const res = import_zod15.z.discriminatedUnion("success", [
      import_zod15.z.object({
        success: import_zod15.z.literal(true),
        data: this.config.output
      }),
      import_zod15.z.object({
        success: import_zod15.z.literal(false),
        errors: import_zod15.z.array(
          import_zod15.z.object({
            type: import_zod15.z.string(),
            message: import_zod15.z.string()
          })
        ),
        status: import_zod15.z.number()
      })
    ]);
    const { data: result, status } = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      pathnameIdentity: this._pathnameIdentity,
      searchParams: this._urlSearchParams,
      options
    });
    let data = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
      data.status = status;
    } else {
      data = {
        success: true,
        data: result[this.resource][0]
      };
    }
    return res.parse(data);
  }
};

// src/fetchers/basic-fetcher.ts
var import_zod16 = require("zod");
var BasicFetcher = class {
  constructor(resource, config, httpClient) {
    this.resource = resource;
    this.config = config;
    this.httpClient = httpClient;
  }
  getResource() {
    return this.resource;
  }
  async fetch(options) {
    const res = import_zod16.z.discriminatedUnion("success", [
      import_zod16.z.object({
        success: import_zod16.z.literal(true),
        data: this.config.output
      }),
      import_zod16.z.object({
        success: import_zod16.z.literal(false),
        errors: import_zod16.z.array(
          import_zod16.z.object({
            type: import_zod16.z.string(),
            message: import_zod16.z.string()
          })
        ),
        status: import_zod16.z.number()
      })
    ]);
    const { data: result, status } = await this.httpClient.fetchWithStatus({
      options,
      resource: this.resource
    });
    let data = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
      data.status = status;
    } else {
      data = {
        success: true,
        data: result[this.resource]
      };
    }
    return res.parse(data);
  }
};

// src/fetchers/mutation-fetcher.ts
var import_zod17 = require("zod");
var MutationFetcher = class {
  constructor(resource, config, _params, _options, httpClient) {
    this.resource = resource;
    this.config = config;
    this._params = _params;
    this._options = _options;
    this.httpClient = httpClient;
    this._buildUrlParams();
  }
  _urlParams = {};
  _urlSearchParams = void 0;
  _pathnameIdentity = void 0;
  getResource() {
    return this.resource;
  }
  getParams() {
    return this._params;
  }
  _buildUrlParams() {
    if (this._params) {
      for (const [key, value] of Object.entries(this._params)) {
        if (key !== "id") {
          this._urlParams[key] = value;
        }
      }
    }
    this._urlSearchParams = new URLSearchParams();
    if (this._params?.id) {
      this._pathnameIdentity = `${this._params.id}`;
    }
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }
  async submit(options) {
    const schema = import_zod17.z.discriminatedUnion("success", [
      import_zod17.z.object({
        success: import_zod17.z.literal(true),
        data: this.config.output
      }),
      import_zod17.z.object({
        success: import_zod17.z.literal(false),
        errors: import_zod17.z.array(
          import_zod17.z.object({
            type: import_zod17.z.string(),
            message: import_zod17.z.string(),
            context: import_zod17.z.string().nullish()
          })
        ),
        status: import_zod17.z.number()
      })
    ]);
    const createData = {
      [this.resource]: [this._options.body]
    };
    const { data: response, status } = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      pathnameIdentity: this._pathnameIdentity,
      options: { ...options, method: this._options.method, body: JSON.stringify(createData) }
    });
    let result = {};
    if (response.errors) {
      result.success = false;
      result.errors = response.errors;
      result.status = status;
    } else {
      result = {
        success: true,
        data: response[this.resource][0]
      };
    }
    return schema.parse(result);
  }
};

// src/fetchers/delete-fetcher.ts
var import_zod18 = require("zod");
var DeleteFetcher = class {
  constructor(resource, _params, httpClient) {
    this.resource = resource;
    this._params = _params;
    this.httpClient = httpClient;
    this._buildPathnameIdentity();
  }
  _pathnameIdentity = void 0;
  getResource() {
    return this.resource;
  }
  getParams() {
    return this._params;
  }
  _buildPathnameIdentity() {
    if (!this._params.id) {
      throw new Error("Missing id in params");
    }
    this._pathnameIdentity = this._params.id;
  }
  async submit(options) {
    const schema = import_zod18.z.discriminatedUnion("success", [
      import_zod18.z.object({
        success: import_zod18.z.literal(true)
      }),
      import_zod18.z.object({
        success: import_zod18.z.literal(false),
        errors: import_zod18.z.array(
          import_zod18.z.object({
            type: import_zod18.z.string(),
            message: import_zod18.z.string(),
            context: import_zod18.z.string().nullish()
          })
        ),
        status: import_zod18.z.number()
      })
    ]);
    let result = {};
    try {
      const response = await this.httpClient.fetchRawResponse({
        resource: this.resource,
        pathnameIdentity: this._pathnameIdentity,
        options: {
          ...options,
          method: "DELETE"
        }
      });
      if (response.status === 204) {
        result = {
          success: true
        };
      } else {
        const res = await response.json();
        if (res.errors) {
          result.success = false;
          result.errors = res.errors;
          result.status = response.status;
        }
      }
    } catch (e) {
      result = {
        success: false,
        errors: [
          {
            type: "FetchError",
            message: e.toString()
          }
        ],
        status: 0
      };
    }
    return schema.parse(result);
  }
};

// src/api-composer.ts
var import_zod20 = require("zod");

// src/helpers/browse-params.ts
var import_zod19 = require("zod");
var browseParamsSchema = import_zod19.z.object({
  order: import_zod19.z.string().optional(),
  limit: import_zod19.z.union([
    import_zod19.z.literal("all"),
    import_zod19.z.number().refine((n) => n && n > 0 && n <= 15, {
      message: "Limit must be between 1 and 15"
    })
  ]).optional(),
  page: import_zod19.z.number().refine((n) => n && n >= 1, {
    message: "Page must be greater than 1"
  }).optional(),
  filter: import_zod19.z.string().optional()
});
var parseBrowseParams = (args, schema, includeSchema) => {
  const keys = [
    ...schema.keyof().options,
    ...includeSchema && includeSchema.keyof().options || []
  ];
  const augmentedSchema = browseParamsSchema.merge(
    import_zod19.z.object({
      order: import_zod19.z.string().superRefine((val, ctx) => {
        const orderPredicates = val.split(",");
        for (const orderPredicate of orderPredicates) {
          const [field, direction] = orderPredicate.split(" ");
          if (!keys.includes(field)) {
            ctx.addIssue({
              code: import_zod19.z.ZodIssueCode.custom,
              message: `Field "${field}" is not a valid field`,
              fatal: true
            });
          }
          if (direction && !(direction.toUpperCase() === "ASC" || direction.toUpperCase() === "DESC")) {
            ctx.addIssue({
              code: import_zod19.z.ZodIssueCode.custom,
              message: "Order direction must be ASC or DESC",
              fatal: true
            });
          }
        }
      }).optional(),
      filter: import_zod19.z.string().superRefine((val, ctx) => {
        const filterPredicates = val.replace(/ *\[[^)]*\] */g, "").split(/[+(,]+(?=(?:[^']*'[^']*')*[^']*$)/);
        for (const filterPredicate of filterPredicates) {
          const field = filterPredicate.split(":")[0].split(".")[0];
          if (!keys.includes(field)) {
            ctx.addIssue({
              code: import_zod19.z.ZodIssueCode.custom,
              message: `Field "${field}" is not a valid field`,
              fatal: true
            });
          }
        }
      }).optional()
    })
  );
  return augmentedSchema.parse(args);
};

// src/api-composer.ts
function isZodObject(schema) {
  return schema.partial !== void 0;
}
var APIComposer = class {
  constructor(resource, config, httpClientFactory) {
    this.resource = resource;
    this.config = config;
    this.httpClientFactory = httpClientFactory;
  }
  /**
   * Browse function that accepts browse params order, filter, page and limit. Will return an instance
   * of BrowseFetcher class.
   */
  browse(options) {
    return new BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include
      },
      {
        browseParams: options && parseBrowseParams(options, this.config.schema, this.config.include) || void 0
      },
      this.httpClientFactory.create()
    );
  }
  /**
   * Read function that accepts Identify fields like id, slug or email. Will return an instance
   * of ReadFetcher class.
   */
  read(options) {
    return new ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include
      },
      {
        identity: import_zod20.z.parse(this.config.identitySchema, options)
      },
      this.httpClientFactory.create()
    );
  }
  async add(data, options) {
    if (!this.config.createSchema) {
      throw new Error("No createSchema defined");
    }
    const parsedData = import_zod20.z.parse(this.config.createSchema, data);
    const parsedOptions = this.config.createOptionsSchema && options ? import_zod20.z.parse(this.config.createOptionsSchema, options) : void 0;
    const fetcher = new MutationFetcher(
      this.resource,
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema
      },
      parsedOptions,
      { method: "POST", body: parsedData },
      this.httpClientFactory.create()
    );
    return fetcher.submit();
  }
  async edit(id, data, options) {
    let updateSchema = this.config.updateSchema;
    if (!this.config.updateSchema && this.config.createSchema && isZodObject(this.config.createSchema)) {
      updateSchema = this.config.createSchema.partial();
    }
    if (!updateSchema) {
      throw new Error("No updateSchema defined");
    }
    const cleanId = import_zod20.z.string().min(1).parse(id);
    const parsedData = import_zod20.z.parse(updateSchema, data);
    const parsedOptions = this.config.updateOptionsSchema && options ? import_zod20.z.parse(this.config.updateOptionsSchema, options) : {};
    if (Object.keys(parsedData).length === 0) {
      throw new Error("No data to edit");
    }
    const fetcher = new MutationFetcher(
      this.resource,
      {
        output: this.config.schema,
        paramsShape: this.config.updateOptionsSchema
      },
      { id: cleanId, ...parsedOptions },
      { method: "PUT", body: parsedData },
      this.httpClientFactory.create()
    );
    return fetcher.submit();
  }
  async delete(id) {
    const cleanId = import_zod20.z.string().min(1).parse(id);
    const fetcher = new DeleteFetcher(this.resource, { id: cleanId }, this.httpClientFactory.create());
    return fetcher.submit();
  }
  access(keys) {
    const d = {};
    keys.forEach((key) => {
      d[key] = this[key].bind(this);
    });
    return d;
  }
};

// src/helpers/fields.ts
var schemaWithPickedFields = (schema, fields) => {
  return schema.pick(fields || {});
};

// src/helpers/http-client.ts
var import_jose = require("jose");

// src/helpers/debug.ts
var resolveDebugLogger = (options) => {
  if (options?.debug) {
    return options.logger ? options.logger : console.log;
  }
  return () => {
  };
};

// src/helpers/http-client.ts
var HTTPClientFactory = class {
  constructor(config) {
    this.config = config;
  }
  create() {
    return new HTTPClient(this.config);
  }
};
var HTTPClient = class {
  constructor(config) {
    this.config = config;
    let prefixPath = new URL(config.url).pathname;
    if (prefixPath.slice(-1) === "/") {
      prefixPath = prefixPath.slice(0, -1);
    }
    this._baseURL = new URL(`${prefixPath}/ghost/api/${config.endpoint}/`, config.url);
  }
  _jwt;
  _jwtExpiresAt;
  _baseURL = void 0;
  get baseURL() {
    return this._baseURL;
  }
  get jwt() {
    return this._jwt;
  }
  async generateJWT(key) {
    const [id, _secret] = key.split(":");
    this._jwtExpiresAt = Date.now() + 5 * 60 * 1e3;
    return new import_jose.SignJWT({}).setProtectedHeader({ kid: id, alg: "HS256" }).setExpirationTime("5m").setIssuedAt().setAudience("/admin/").sign(
      Uint8Array.from(_secret.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    );
  }
  async genHeaders() {
    const headers = {
      "Content-Type": "application/json",
      "Accept-Version": this.config.version
    };
    if (this.config.endpoint === "admin") {
      if (this._jwt === void 0 || this._jwtExpiresAt === void 0 || this._jwtExpiresAt < Date.now()) {
        this._jwt = await this.generateJWT(this.config.key);
      }
      headers["Authorization"] = `Ghost ${this.jwt}`;
    }
    return headers;
  }
  async fetch({
    resource,
    searchParams,
    options,
    pathnameIdentity
  }) {
    const debug = resolveDebugLogger({ ...this.config, ...options });
    if (this._baseURL === void 0) throw new Error("URL is undefined");
    let path = `${resource}/`;
    if (pathnameIdentity !== void 0) {
      path += `${pathnameIdentity}/`;
    }
    const url = new URL(path, this._baseURL);
    if (searchParams !== void 0) {
      for (const [key, value] of searchParams.entries()) {
        url.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      url.searchParams.append("key", this.config.key);
    }
    let result = void 0;
    const headers = await this.genHeaders();
    debug("url", url.toString(), "headers", headers, "options", options);
    try {
      result = await (await fetch(url.toString(), {
        ...options,
        headers
      })).json();
      debug("result", result, "status", result.status);
    } catch (e) {
      debug("error", e);
      return {
        status: "error",
        errors: [
          {
            type: "FetchError",
            message: e.toString()
          }
        ]
      };
    }
    return result;
  }
  async fetchWithStatus({
    resource,
    searchParams,
    options,
    pathnameIdentity
  }) {
    if (this._baseURL === void 0) throw new Error("URL is undefined");
    let path = `${resource}/`;
    if (pathnameIdentity !== void 0) {
      path += `${pathnameIdentity}/`;
    }
    const url = new URL(path, this._baseURL);
    if (searchParams !== void 0) {
      for (const [key, value] of searchParams.entries()) {
        url.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      url.searchParams.append("key", this.config.key);
    }
    const headers = await this.genHeaders();
    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers
      });
      const status = response.status;
      try {
        const data = await response.json();
        return { data, status };
      } catch (e) {
        return {
          data: {
            errors: [
              {
                type: "FetchError",
                message: e.toString()
              }
            ]
          },
          status
        };
      }
    } catch (e) {
      return {
        data: {
          errors: [
            {
              type: "FetchError",
              message: e.toString()
            }
          ]
        },
        status: 0
      };
    }
  }
  async fetchRawResponse({
    resource,
    searchParams,
    options,
    pathnameIdentity
  }) {
    if (this._baseURL === void 0) throw new Error("URL is undefined");
    this._baseURL.pathname += `${resource}/`;
    if (pathnameIdentity !== void 0) {
      this._baseURL.pathname += `${pathnameIdentity}/`;
    }
    if (searchParams !== void 0) {
      for (const [key, value] of searchParams.entries()) {
        this._baseURL.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      this._baseURL.searchParams.append("key", this.config.key);
    }
    const headers = await this.genHeaders();
    return await fetch(this._baseURL.toString(), {
      ...options,
      headers
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  APIComposer,
  BasicFetcher,
  BrowseFetcher,
  DeleteFetcher,
  HTTPClient,
  HTTPClientFactory,
  MutationFetcher,
  ReadFetcher,
  adminAPICredentialsSchema,
  apiVersionsSchema,
  baseAuthorsSchema,
  baseEmailSchema,
  baseMembersSchema,
  baseNewsletterSchema,
  baseOffersSchema,
  basePagesSchema,
  basePostsSchema,
  baseSettingsSchema,
  baseSiteSchema,
  baseTagsSchema,
  baseTiersSchema,
  browseParamsSchema,
  contentAPICredentialsSchema,
  emailOrIdSchema,
  ghostCodeInjectionSchema,
  ghostExcerptSchema,
  ghostFacebookSchema,
  ghostIdentityInputSchema,
  ghostIdentitySchema,
  ghostMetaSchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostTwitterSchema,
  ghostVisibilitySchema,
  identitySchema,
  parseBrowseParams,
  resolveDebugLogger,
  schemaWithPickedFields,
  slugOrIdSchema
});
//# sourceMappingURL=index.js.map