// src/schemas/authors.ts
import { z as z2 } from "zod";

// src/schemas/shared.ts
import { z } from "zod";
var ghostIdentitySchema = z.object({
  slug: z.string(),
  id: z.string()
});
var ghostIdentityInputSchema = z.object({
  slug: z.string().optional(),
  id: z.string().optional(),
  email: z.email().optional()
});
var ghostMetaSchema = z.object({
  pagination: z.object({
    pages: z.number(),
    page: z.number(),
    limit: z.union([z.number(), z.literal("all")]),
    total: z.number(),
    prev: z.number().nullable(),
    next: z.number().nullable()
  })
});
var ghostExcerptSchema = z.object({
  excerpt: z.string().optional(),
  custom_excerpt: z.string().optional()
});
var ghostCodeInjectionSchema = z.object({
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable()
});
var ghostFacebookSchema = z.object({
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable()
});
var ghostTwitterSchema = z.object({
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable()
});
var ghostSocialMediaSchema = z.object({
  ...ghostFacebookSchema.shape,
  ...ghostTwitterSchema.shape
});
var ghostMetadataSchema = z.object({
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable()
});
var ghostVisibilitySchema = z.union([
  z.literal("public"),
  z.literal("members"),
  z.literal("none"),
  z.literal("internal"),
  z.literal("paid"),
  z.literal("tiers")
]);
var apiVersionsSchema = z.string().startsWith("v5.").or(z.string().startsWith("v6.")).default("v6.0");
var contentAPICredentialsSchema = z.object({
  key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
  version: apiVersionsSchema,
  url: z.string().url()
});
var adminAPICredentialsSchema = z.object({
  key: z.string().regex(/[0-9a-f]{24}:[0-9a-f]{64}/, {
    message: "'key' must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters"
  }),
  version: apiVersionsSchema,
  url: z.string().url()
});
var slugOrIdSchema = z.union([z.object({ slug: z.string() }), z.object({ id: z.string() })]);
var emailOrIdSchema = z.union([
  z.object({ email: z.string().email() }),
  z.object({ id: z.string() })
]);
var identitySchema = z.union([
  z.object({ email: z.string().email() }),
  z.object({ id: z.string() }),
  z.object({ slug: z.string() })
]);

// src/schemas/authors.ts
var baseAuthorsSchema = z2.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  name: z2.string(),
  profile_image: z2.string().nullable(),
  cover_image: z2.string().nullable(),
  bio: z2.string().nullable(),
  website: z2.string().nullable(),
  location: z2.string().nullable(),
  facebook: z2.string().nullable(),
  twitter: z2.string().nullable(),
  count: z2.object({
    posts: z2.number()
  }).optional(),
  url: z2.string().nullish()
});

// src/schemas/pages.ts
import { z as z4 } from "zod";

// src/schemas/tags.ts
import { z as z3 } from "zod";
var baseTagsSchema = z3.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  name: z3.string(),
  description: z3.string().nullable(),
  feature_image: z3.string().nullable(),
  visibility: ghostVisibilitySchema,
  canonical_url: z3.string().nullable(),
  accent_color: z3.string().nullable(),
  url: z3.string(),
  created_at: z3.string().nullish(),
  updated_at: z3.string().nullish(),
  count: z3.object({
    posts: z3.number()
  }).optional()
});

// src/schemas/pages.ts
var postsAuthorSchema = baseAuthorsSchema.extend({
  url: z4.string().nullish()
});
var basePagesSchema = z4.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z4.string(),
  html: z4.string().nullish(),
  plaintext: z4.string().nullish(),
  comment_id: z4.string().nullable(),
  feature_image: z4.string().nullable(),
  feature_image_alt: z4.string().nullable(),
  feature_image_caption: z4.string().nullable(),
  featured: z4.boolean(),
  custom_excerpt: z4.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: z4.string().nullable(),
  canonical_url: z4.string().nullable(),
  authors: z4.array(postsAuthorSchema).optional(),
  tags: z4.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: baseTagsSchema.nullish(),
  url: z4.string(),
  excerpt: z4.string().nullish(),
  reading_time: z4.number().optional().default(0),
  created_at: z4.string(),
  updated_at: z4.string().nullish(),
  published_at: z4.string().nullable(),
  email_subject: z4.string().nullish(),
  is_page: z4.boolean().default(true)
});

// src/schemas/posts.ts
import { z as z5 } from "zod";
var postsAuthorSchema2 = baseAuthorsSchema.extend({
  url: z5.string().nullish()
});
var basePostsSchema = z5.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z5.string(),
  html: z5.string().nullish(),
  plaintext: z5.string().nullish(),
  comment_id: z5.string().nullable(),
  feature_image: z5.string().nullable(),
  feature_image_alt: z5.string().nullable(),
  feature_image_caption: z5.string().nullable(),
  featured: z5.boolean(),
  custom_excerpt: z5.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: z5.string().nullable(),
  canonical_url: z5.string().nullable(),
  authors: z5.array(postsAuthorSchema2).optional(),
  tags: z5.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema2.nullish(),
  primary_tag: baseTagsSchema.nullish(),
  url: z5.string(),
  excerpt: z5.string().nullable(),
  reading_time: z5.number().optional().default(0),
  created_at: z5.string(),
  updated_at: z5.string().nullish(),
  published_at: z5.string().nullable(),
  email_subject: z5.string().nullish(),
  is_page: z5.boolean().default(false)
});

// src/schemas/settings.ts
import { z as z6 } from "zod";
var baseSettingsSchema = z6.object({
  title: z6.string(),
  description: z6.string(),
  logo: z6.string().nullable(),
  icon: z6.string().nullable(),
  accent_color: z6.string().nullable(),
  cover_image: z6.string().nullable(),
  facebook: z6.string().nullable(),
  twitter: z6.string().nullable(),
  lang: z6.string(),
  timezone: z6.string(),
  codeinjection_head: z6.string().nullable(),
  codeinjection_foot: z6.string().nullable(),
  navigation: z6.array(
    z6.object({
      label: z6.string(),
      url: z6.string()
    })
  ),
  secondary_navigation: z6.array(
    z6.object({
      label: z6.string(),
      url: z6.string()
    })
  ),
  meta_title: z6.string().nullable(),
  meta_description: z6.string().nullable(),
  og_image: z6.string().nullable(),
  og_title: z6.string().nullable(),
  og_description: z6.string().nullable(),
  twitter_image: z6.string().nullable(),
  twitter_title: z6.string().nullable(),
  twitter_description: z6.string().nullable(),
  members_support_address: z6.string(),
  url: z6.string()
});

// src/schemas/tiers.ts
import { z as z7 } from "zod";
var baseTiersSchema = z7.object({
  ...ghostIdentitySchema.shape,
  name: z7.string(),
  description: z7.string().nullable(),
  active: z7.boolean(),
  type: z7.union([z7.literal("free"), z7.literal("paid")]),
  welcome_page_url: z7.string().nullable(),
  created_at: z7.string(),
  updated_at: z7.string().nullable(),
  stripe_prices: z7.array(z7.number()).optional().transform((v) => v?.length ? v : []),
  monthly_price: z7.number().nullable().optional().transform((v) => v ? v : null),
  yearly_price: z7.number().nullable().optional().transform((v) => v ? v : null),
  benefits: z7.array(z7.string()).optional(),
  visibility: ghostVisibilitySchema,
  currency: z7.string().nullish(),
  trial_days: z7.number().default(0)
});

// src/schemas/email.ts
import { z as z8 } from "zod";
var baseEmailSchema = z8.object({
  id: z8.string(),
  uuid: z8.string(),
  status: z8.string(),
  recipient_filter: z8.string(),
  error: z8.string().nullish(),
  error_data: z8.any().nullable(),
  email_count: z8.number(),
  delivered_count: z8.number(),
  opened_count: z8.number(),
  failed_count: z8.number(),
  subject: z8.string(),
  from: z8.string(),
  reply_to: z8.string().nullable(),
  source: z8.string(),
  // lexical format
  html: z8.string().nullable(),
  plaintext: z8.string().nullable(),
  track_opens: z8.boolean(),
  submitted_at: z8.string(),
  created_at: z8.string(),
  updated_at: z8.string()
});

// src/schemas/offers.ts
import { z as z9 } from "zod";
var baseOffersSchema = z9.object({
  id: z9.string(),
  name: z9.string().meta({ description: "Internal name for an offer, must be unique" }).default(""),
  code: z9.string().meta({ description: "Shortcode for the offer, for example: https://yoursite.com/black-friday" }),
  display_title: z9.string().meta({ description: "Name displayed in the offer window" }).nullish(),
  display_description: z9.string().meta({ description: "Text displayed in the offer window" }).nullish(),
  type: z9.union([z9.literal("percent"), z9.literal("fixed"), z9.literal("trial")]),
  cadence: z9.union([z9.literal("month"), z9.literal("year")]),
  amount: z9.number().meta({
    description: `Offer discount amount, as a percentage or fixed value as set in type. 
      Amount is always denoted by the smallest currency unit 
      (e.g., 100 cents instead of $1.00 in USD)`
  }),
  duration: z9.union([z9.literal("once"), z9.literal("forever"), z9.literal("repeating"), z9.literal("trial")]).meta({
    description: "once/forever/repeating. repeating duration is only available when cadence is month"
  }),
  duration_in_months: z9.number().meta({ description: "Number of months offer should be repeated when duration is repeating" }).nullish(),
  currency_restriction: z9.boolean().meta({
    description: "Denotes whether the offer `currency` is restricted. If so, changing the currency invalidates the offer"
  }).nullish(),
  currency: z9.string().meta({
    description: "fixed type offers only - specifies tier's currency as three letter ISO currency code"
  }).nullish(),
  status: z9.union([z9.literal("active"), z9.literal("archived")]).meta({
    description: "active or archived - denotes if the offer is active or archived"
  }),
  redemption_count: z9.number().meta({ description: "Number of times the offer has been redeemed" }).nullish(),
  tier: z9.object({
    id: z9.string(),
    name: z9.string().nullish()
  }).meta({ description: "Tier on which offer is applied" })
});

// src/schemas/members.ts
import { z as z12 } from "zod";

// src/schemas/newsletter.ts
import { z as z10 } from "zod";
var baseNewsletterSchema = z10.object({
  ...ghostIdentitySchema.shape,
  name: z10.string().meta({ description: "Public name for the newsletter" }),
  description: z10.string().meta({ description: "(nullable) Public description of the newsletter" }).nullish(),
  sender_name: z10.string().meta({ description: "(nullable) The sender name of the emails" }).nullish(),
  sender_email: z10.string().meta({ description: "(nullable) The email from which to send emails. Requires validation." }).nullish(),
  sender_reply_to: z10.string().meta({
    description: "The reply-to email address for sent emails. Can be either newsletter (= use sender_email) or support (use support email from Portal settings)."
  }),
  status: z10.union([z10.literal("active"), z10.literal("archived")]).meta({
    description: "active or archived - denotes if the newsletter is active or archived"
  }),
  visibility: z10.union([z10.literal("public"), z10.literal("members")]),
  subscribe_on_signup: z10.boolean().meta({
    description: "true/false. Whether members should automatically subscribe to this newsletter on signup"
  }),
  sort_order: z10.number().meta({ description: "The order in which newsletters are displayed in the Portal" }),
  header_image: z10.string().meta({
    description: "(nullable) Path to an image to show at the top of emails. Recommended size 1200x600"
  }).nullish(),
  show_header_icon: z10.boolean().meta({ description: "true/false. Show the site icon in emails" }),
  show_header_title: z10.boolean().meta({ description: "true/false. Show the site name in emails" }),
  title_font_category: z10.union([z10.literal("serif"), z10.literal("sans_serif")]).meta({
    description: "Title font style. Either serif or sans_serif"
  }),
  title_alignment: z10.string().nullish(),
  show_feature_image: z10.boolean().meta({ description: "true/false. Show the post's feature image in emails" }),
  body_font_category: z10.union([z10.literal("serif"), z10.literal("sans_serif")]).meta({
    description: "Body font style. Either serif or sans_serif"
  }),
  footer_content: z10.string().meta({
    description: "(nullable) Extra information or legal text to show in the footer of emails. Should contain valid HTML."
  }).nullish(),
  show_badge: z10.boolean().meta({
    description: "true/false. Show you\u2019re a part of the indie publishing movement by adding a small Ghost badge in the footer"
  }),
  created_at: z10.string(),
  updated_at: z10.string().nullish(),
  show_header_name: z10.boolean().meta({ description: "true/false. Show the newsletter name in emails" }),
  uuid: z10.string()
});

// src/schemas/subscriptions.ts
import { z as z11 } from "zod";
var baseSubscriptionsSchema = z11.object({
  id: z11.string().meta({ description: "Stripe subscription ID sub_XXXX" }),
  customer: z11.object({
    id: z11.string(),
    name: z11.string().nullable(),
    email: z11.string()
  }).meta({ description: "Stripe customer attached to the subscription" }),
  status: z11.string().meta({ description: "Subscription status" }),
  start_date: z11.string().meta({ description: "Subscription start date" }),
  default_payment_card_last4: z11.string().meta({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: z11.boolean().meta({
    description: "If the subscription should be canceled or renewed at period end"
  }),
  cancellation_reason: z11.string().meta({ description: "Reason for subscription cancellation" }).nullable(),
  current_period_end: z11.string().meta({ description: "Subscription end date" }),
  price: z11.object({
    id: z11.string().meta({ description: "Stripe price ID" }),
    price_id: z11.string().meta({ description: "Ghost price ID" }),
    nickname: z11.string().meta({ description: "Price nickname" }),
    amount: z11.number().meta({ description: "Price amount" }),
    interval: z11.string().meta({ description: "Price interval" }),
    type: z11.string().meta({ description: "Price type" }),
    currency: z11.string().meta({ description: "Price currency" })
  }),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish()
});

// src/schemas/members.ts
var baseMembersSchema = z12.object({
  id: z12.string(),
  email: z12.string().meta({ description: "The email address of the member" }),
  name: z12.string().meta({ description: "The name of the member" }).nullable(),
  note: z12.string().meta({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: z12.string().meta({ description: "(nullable) The geolocation of the member" }).nullish(),
  created_at: z12.string().meta({ description: "The date and time the member was created" }),
  updated_at: z12.string().meta({ description: "(nullable) The date and time the member was last updated" }).nullish(),
  labels: z12.array(
    z12.object({
      id: z12.string().meta({ description: "The ID of the label" }),
      name: z12.string().meta({ description: "The name of the label" }),
      slug: z12.string().meta({ description: "The slug of the label" }),
      created_at: z12.string().meta({ description: "The date and time the label was created" }),
      updated_at: z12.string().meta({ description: "(nullable) The date and time the label was last updated" }).nullish()
    }).meta({ description: "The labels associated with the member" })
  ),
  subscriptions: z12.array(baseSubscriptionsSchema).meta({ description: "The subscriptions associated with the member" }),
  avatar_image: z12.string().meta({ description: "The URL of the member's avatar image" }),
  email_count: z12.number().meta({ description: "The number of emails sent to the member" }),
  email_opened_count: z12.number().meta({ description: "The number of emails opened by the member" }),
  email_open_rate: z12.number().meta({ description: "(nullable) The open rate of the member" }).nullish(),
  status: z12.string().meta({ description: "The status of the member" }),
  last_seen_at: z12.string().meta({ description: "(nullable) The date and time the member was last seen" }).nullish(),
  newsletters: z12.array(baseNewsletterSchema)
});

// src/schemas/site.ts
import { z as z13 } from "zod";
var baseSiteSchema = z13.object({
  title: z13.string(),
  description: z13.string(),
  logo: z13.string().nullable(),
  version: z13.string(),
  url: z13.string()
});

// src/fetchers/browse-fetcher.ts
import { z as z14 } from "zod";

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
    return z14.discriminatedUnion("success", [
      z14.object({
        success: z14.literal(true),
        meta: ghostMetaSchema,
        data: z14.array(this.config.output)
      }),
      z14.object({
        success: z14.literal(false),
        errors: z14.array(
          z14.object({
            type: z14.string(),
            message: z14.string()
          })
        ),
        status: z14.number()
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
import { z as z15 } from "zod";
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
    const res = z15.discriminatedUnion("success", [
      z15.object({
        success: z15.literal(true),
        data: this.config.output
      }),
      z15.object({
        success: z15.literal(false),
        errors: z15.array(
          z15.object({
            type: z15.string(),
            message: z15.string()
          })
        ),
        status: z15.number()
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
import { z as z16 } from "zod";
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
    const res = z16.discriminatedUnion("success", [
      z16.object({
        success: z16.literal(true),
        data: this.config.output
      }),
      z16.object({
        success: z16.literal(false),
        errors: z16.array(
          z16.object({
            type: z16.string(),
            message: z16.string()
          })
        ),
        status: z16.number()
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
import { z as z17 } from "zod";
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
    const schema = z17.discriminatedUnion("success", [
      z17.object({
        success: z17.literal(true),
        data: this.config.output
      }),
      z17.object({
        success: z17.literal(false),
        errors: z17.array(
          z17.object({
            type: z17.string(),
            message: z17.string(),
            context: z17.string().nullish()
          })
        ),
        status: z17.number()
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
import { z as z18 } from "zod";
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
    const schema = z18.discriminatedUnion("success", [
      z18.object({
        success: z18.literal(true)
      }),
      z18.object({
        success: z18.literal(false),
        errors: z18.array(
          z18.object({
            type: z18.string(),
            message: z18.string(),
            context: z18.string().nullish()
          })
        ),
        status: z18.number()
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
import { z as z20 } from "zod";

// src/helpers/browse-params.ts
import { z as z19 } from "zod";
var browseParamsSchema = z19.object({
  order: z19.string().optional(),
  limit: z19.union([
    z19.literal("all"),
    z19.number().refine((n) => n && n > 0 && n <= 15, {
      message: "Limit must be between 1 and 15"
    })
  ]).optional(),
  page: z19.number().refine((n) => n && n >= 1, {
    message: "Page must be greater than 1"
  }).optional(),
  filter: z19.string().optional()
});
var parseBrowseParams = (args, schema, includeSchema) => {
  const keys = [
    ...schema.keyof().options,
    ...includeSchema && includeSchema.keyof().options || []
  ];
  const augmentedSchema = browseParamsSchema.merge(
    z19.object({
      order: z19.string().superRefine((val, ctx) => {
        const orderPredicates = val.split(",");
        for (const orderPredicate of orderPredicates) {
          const [field, direction] = orderPredicate.split(" ");
          if (!keys.includes(field)) {
            ctx.addIssue({
              code: z19.ZodIssueCode.custom,
              message: `Field "${field}" is not a valid field`,
              fatal: true
            });
          }
          if (direction && !(direction.toUpperCase() === "ASC" || direction.toUpperCase() === "DESC")) {
            ctx.addIssue({
              code: z19.ZodIssueCode.custom,
              message: "Order direction must be ASC or DESC",
              fatal: true
            });
          }
        }
      }).optional(),
      filter: z19.string().superRefine((val, ctx) => {
        const filterPredicates = val.replace(/ *\[[^)]*\] */g, "").split(/[+(,]+(?=(?:[^']*'[^']*')*[^']*$)/);
        for (const filterPredicate of filterPredicates) {
          const field = filterPredicate.split(":")[0].split(".")[0];
          if (!keys.includes(field)) {
            ctx.addIssue({
              code: z19.ZodIssueCode.custom,
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
        identity: z20.parse(this.config.identitySchema, options)
      },
      this.httpClientFactory.create()
    );
  }
  async add(data, options) {
    if (!this.config.createSchema) {
      throw new Error("No createSchema defined");
    }
    const parsedData = z20.parse(this.config.createSchema, data);
    const parsedOptions = this.config.createOptionsSchema && options ? z20.parse(this.config.createOptionsSchema, options) : void 0;
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
    const cleanId = z20.string().min(1).parse(id);
    const parsedData = z20.parse(updateSchema, data);
    const parsedOptions = this.config.updateOptionsSchema && options ? z20.parse(this.config.updateOptionsSchema, options) : {};
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
    const cleanId = z20.string().min(1).parse(id);
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
import { SignJWT } from "jose";

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
    return new SignJWT({}).setProtectedHeader({ kid: id, alg: "HS256" }).setExpirationTime("5m").setIssuedAt().setAudience("/admin/").sign(
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
export {
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
};
//# sourceMappingURL=index.mjs.map