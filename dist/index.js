"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  TSGhostAdminAPI: () => TSGhostAdminAPI,
  adminAuthorsSchema: () => adminAuthorsSchema,
  adminMembersCreateSchema: () => adminMembersCreateSchema,
  adminMembersSchema: () => adminMembersSchema,
  adminNewsletterCreateSchema: () => adminNewsletterCreateSchema,
  adminOffersCreateSchema: () => adminOffersCreateSchema,
  adminOffersUpdateSchema: () => adminOffersUpdateSchema,
  adminPostsCreateSchema: () => adminPostsCreateSchema,
  adminPostsSchema: () => adminPostsSchema,
  adminPostsUpdateSchema: () => adminPostsUpdateSchema,
  adminTiersCreateSchema: () => adminTiersCreateSchema,
  adminTiersSchema: () => adminTiersSchema,
  adminWebhookCreateSchema: () => adminWebhookCreateSchema,
  adminWebhookSchema: () => adminWebhookSchema,
  adminWebhookUpdateSchema: () => adminWebhookUpdateSchema,
  ghostEventTypes: () => ghostEventTypes
});
module.exports = __toCommonJS(index_exports);

// src/admin-api.ts
var import_zod11 = require("zod");
var import_core_api7 = require("@ts-ghost/core-api");

// src/schemas/posts.ts
var import_zod3 = require("zod");
var import_core_api3 = require("@ts-ghost/core-api");

// src/schemas/authors.ts
var import_zod = require("zod");
var import_core_api = require("@ts-ghost/core-api");
var adminAuthorsSchema = import_core_api.baseAuthorsSchema.merge(
  import_zod.z.object({
    accessibility: import_zod.z.string().nullish(),
    comment_notifications: import_zod.z.boolean(),
    created_at: import_zod.z.string().nullish(),
    updated_at: import_zod.z.string().nullish(),
    email: import_zod.z.string().nullish(),
    free_member_signup_notification: import_zod.z.boolean(),
    last_seen: import_zod.z.string().nullish(),
    mention_notifications: import_zod.z.boolean().optional(),
    milestone_notifications: import_zod.z.boolean().optional(),
    paid_subscription_canceled_notification: import_zod.z.boolean(),
    paid_subscription_started_notification: import_zod.z.boolean(),
    status: import_zod.z.union([import_zod.z.literal("active"), import_zod.z.literal("invited"), import_zod.z.literal("locked")]),
    roles: import_zod.z.array(
      import_zod.z.object({
        id: import_zod.z.string(),
        name: import_zod.z.string(),
        description: import_zod.z.string(),
        created_at: import_zod.z.string().nullish(),
        updated_at: import_zod.z.string().nullish()
      })
    ).optional()
  })
);

// src/schemas/tiers.ts
var import_zod2 = require("zod");
var import_core_api2 = require("@ts-ghost/core-api");
var adminTiersSchema = import_core_api2.baseTiersSchema.merge(
  import_zod2.z.object({
    monthly_price_id: import_zod2.z.string().meta({ description: "Monthly Stripe price id" }).nullish(),
    yearly_price_id: import_zod2.z.string().meta({ description: "Yearly Stripe price id" }).nullish()
  })
);
var adminTiersCreateSchema = import_zod2.z.object({
  name: import_zod2.z.string().meta({ description: "Name of the tier" }).min(1).max(2e3),
  description: import_zod2.z.string().meta({ description: "Description of the tier" }).optional(),
  welcome_page_url: import_zod2.z.string().meta({ description: "Welcome page URL of the tier" }).optional(),
  visibility: import_zod2.z.union([import_zod2.z.literal("public"), import_zod2.z.literal("none")]).optional(),
  monthly_price: import_zod2.z.number().meta({ description: "Monthly price of the tier" }).optional(),
  yearly_price: import_zod2.z.number().meta({ description: "Yearly price of the tier" }).optional(),
  trial_days: import_zod2.z.number().meta({ description: "Trial days of the tier" }).optional(),
  benefits: import_zod2.z.array(import_zod2.z.string().meta({ description: "Benefits of the tier" })).optional(),
  currency: import_zod2.z.string().meta({ description: "Currency of the tier" }).optional(),
  active: import_zod2.z.boolean().meta({ description: "Active of the tier" }).optional()
});

// src/schemas/posts.ts
var adminPostsSchema = import_core_api3.basePostsSchema.merge(
  import_zod3.z.object({
    uuid: import_zod3.z.string(),
    mobiledoc: import_zod3.z.string().nullish(),
    email_only: import_zod3.z.boolean(),
    status: import_zod3.z.union([import_zod3.z.literal("draft"), import_zod3.z.literal("published"), import_zod3.z.literal("scheduled")]),
    email_segment: import_zod3.z.string().nullish(),
    frontmatter: import_zod3.z.string().nullish(),
    tiers: import_zod3.z.array(adminTiersSchema).optional(),
    email: import_core_api3.baseEmailSchema.nullish(),
    newsletter: import_core_api3.baseNewsletterSchema.nullish(),
    count: import_zod3.z.object({
      clicks: import_zod3.z.number().nullish(),
      positive_feedback: import_zod3.z.number().nullish(),
      negative_feedback: import_zod3.z.number().nullish()
    }).nullish(),
    authors: import_zod3.z.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    lexical: import_zod3.z.string().catch(
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    ).optional(),
    html: import_zod3.z.string().catch("").optional(),
    plaintext: import_zod3.z.string().catch("").optional()
  })
);
var basePostsCreateSchema = import_zod3.z.object({
  title: import_zod3.z.string().min(1).max(2e3),
  slug: import_zod3.z.string().max(191).optional(),
  mobiledoc: import_zod3.z.string().max(1e9).optional(),
  lexical: import_zod3.z.string().max(1e9).optional(),
  html: import_zod3.z.string().max(1e9).optional(),
  feature_image: import_zod3.z.string().max(2e3).url().optional(),
  feature_image_alt: import_zod3.z.string().max(65535).optional(),
  feature_image_caption: import_zod3.z.string().max(65535).optional(),
  featured: import_zod3.z.boolean().optional(),
  status: import_zod3.z.union([import_zod3.z.literal("draft"), import_zod3.z.literal("published"), import_zod3.z.literal("scheduled"), import_zod3.z.literal("sent")]).optional(),
  locale: import_zod3.z.string().max(6).optional(),
  visibility: import_zod3.z.union([
    import_zod3.z.literal("public"),
    import_zod3.z.literal("internal"),
    import_zod3.z.literal("members"),
    import_zod3.z.literal("paid"),
    import_zod3.z.literal("tiers")
  ]).optional(),
  visibility_filter: import_zod3.z.string().optional(),
  meta_title: import_zod3.z.string().max(300).optional(),
  meta_description: import_zod3.z.string().max(500).optional(),
  updated_at: import_zod3.z.date().transform((val) => val.toISOString()).optional(),
  published_at: import_zod3.z.date().transform((val) => val.toISOString()).optional(),
  custom_excerpt: import_zod3.z.string().max(300).optional(),
  codeinjection_head: import_zod3.z.string().max(65535).optional(),
  codeinjection_foot: import_zod3.z.string().max(65535).optional(),
  og_image: import_zod3.z.string().max(2e3).url().optional(),
  og_title: import_zod3.z.string().max(300).optional(),
  og_description: import_zod3.z.string().max(500).optional(),
  twitter_image: import_zod3.z.string().max(2e3).url().optional(),
  twitter_title: import_zod3.z.string().max(300).optional(),
  twitter_description: import_zod3.z.string().max(500).optional(),
  email_subject: import_zod3.z.string().max(300).optional(),
  custom_template: import_zod3.z.string().max(100).optional(),
  canonical_url: import_zod3.z.string().max(2e3).url().optional(),
  email_only: import_zod3.z.boolean().optional(),
  tags: import_zod3.z.array(
    import_zod3.z.union([
      import_zod3.z.object({
        id: import_zod3.z.string().meta({ description: "The ID of the tags" })
      }),
      import_zod3.z.object({
        name: import_zod3.z.string().meta({ description: "The name of the tags" })
      }),
      import_zod3.z.object({
        slug: import_zod3.z.string().meta({ description: "The slug of the tags" })
      })
    ])
  ).meta({
    description: `The tags associated with the post array of either slug, id or name`
  }).optional(),
  tiers: import_zod3.z.array(
    import_zod3.z.union([
      import_zod3.z.object({
        id: import_zod3.z.string().meta({ description: "The ID of the tiers" })
      }),
      import_zod3.z.object({
        name: import_zod3.z.string().meta({ description: "The name of the tiers" })
      }),
      import_zod3.z.object({
        slug: import_zod3.z.string().meta({ description: "The slug of the tiers" })
      })
    ])
  ).meta({
    description: `The tiers associated with the post array of either slug, id or name`
  }).optional(),
  authors: import_zod3.z.array(
    import_zod3.z.union([
      import_zod3.z.object({
        id: import_zod3.z.string().meta({ description: "The ID of the author" })
      }),
      import_zod3.z.object({
        name: import_zod3.z.string().meta({ description: "The name of the author" })
      }),
      import_zod3.z.object({
        email: import_zod3.z.string().meta({ description: "The email of the author" })
      })
    ])
  ).meta({
    description: `Specifying author via id, name or slug.`
  }).optional(),
  newsletter: import_zod3.z.union([
    import_zod3.z.object({
      id: import_zod3.z.string().meta({ description: "The ID of the newsletter" })
    }),
    import_zod3.z.object({
      slug: import_zod3.z.string().meta({ description: "The slug of the newsletter" })
    })
  ]).optional()
});
var emailOnlyNewsletterRefinement = (data) => {
  if (data.email_only === true && data.status === "scheduled") {
    return data.newsletter !== void 0;
  }
  return true;
};
var emailOnlyNewsletterRefinementOptions = {
  message: "newsletter is required when scheduling an email_only post",
  path: ["newsletter"]
};
var adminPostsCreateSchema = basePostsCreateSchema.refine(
  emailOnlyNewsletterRefinement,
  emailOnlyNewsletterRefinementOptions
);
var adminPostsUpdateSchema = basePostsCreateSchema.partial({ title: true }).merge(
  import_zod3.z.object({
    updated_at: import_zod3.z.date().transform((val) => val.toISOString())
  })
).refine(emailOnlyNewsletterRefinement, emailOnlyNewsletterRefinementOptions);

// src/schemas/members.ts
var import_zod4 = require("zod");
var import_core_api4 = require("@ts-ghost/core-api");
var adminMembersCreateSchema = import_zod4.z.object({
  email: import_zod4.z.email().meta({ description: "The email address of the member" }),
  name: import_zod4.z.string().meta({ description: "The name of the member" }).optional(),
  note: import_zod4.z.string().meta({ description: "(nullable) A note about the member" }).optional(),
  geolocation: import_zod4.z.string().meta({ description: "(nullable) The geolocation of the member" }).optional(),
  labels: import_zod4.z.array(
    import_zod4.z.union([
      import_zod4.z.object({
        id: import_zod4.z.string().meta({ description: "The ID of the label" })
      }),
      import_zod4.z.object({
        name: import_zod4.z.string().meta({ description: "The name of the label" })
      }),
      import_zod4.z.object({
        slug: import_zod4.z.string().meta({ description: "The slug of the label" })
      })
    ])
  ).meta({ description: "The labels associated with the member" }).optional(),
  products: import_zod4.z.array(
    import_zod4.z.union([
      import_zod4.z.object({
        id: import_zod4.z.string().meta({ description: "The ID of the subscription" })
      }),
      import_zod4.z.object({
        name: import_zod4.z.string().meta({ description: "The name of the subscription" })
      }),
      import_zod4.z.object({
        slug: import_zod4.z.string().meta({ description: "The slug of the subscription" })
      })
    ])
  ).meta({
    description: `The products associated with the member, they correspond to a stripe product. 
          If given the member status will be 'comped' as given away a subscription.`
  }).optional(),
  // newsletters and subscribed exclude each other. `subscribed`
  newsletters: import_zod4.z.array(
    import_zod4.z.union([
      import_zod4.z.object({
        id: import_zod4.z.string().meta({ description: "The ID of the newsletter" })
      }),
      import_zod4.z.object({
        name: import_zod4.z.string().meta({ description: "The name of the newsletter" })
      })
    ])
  ).meta({
    description: `Specifying newsletter to subscribe to via id or name, incompatible with the \`subscribed\` property`
  }).optional(),
  subscribed: import_zod4.z.boolean().meta({
    description: "Will subscribe the user to the default Newsletter, incompatible with the `newsletters` property"
  }).optional(),
  comped: import_zod4.z.boolean().optional(),
  stripe_customer_id: import_zod4.z.string().optional()
  // subscriptions: NOT_USED it seems that subscriptions are not used on the API see Ghost source code: ghost/members-api/lib/repositories/member.js (method create)
});
var adminMembersSchema = import_core_api4.baseMembersSchema.merge(
  import_zod4.z.object({
    subscribed: import_zod4.z.boolean(),
    comped: import_zod4.z.boolean().nullish(),
    email_suppression: import_zod4.z.object({
      suppressed: import_zod4.z.boolean(),
      info: import_zod4.z.string().nullish()
    }).nullish(),
    newsletters: import_zod4.z.array(
      import_zod4.z.object({
        id: import_zod4.z.string(),
        name: import_zod4.z.string().meta({ description: "Public name for the newsletter" }),
        description: import_zod4.z.string().meta({ description: "(nullable) Public description of the newsletter" }).nullish(),
        status: import_zod4.z.union([import_zod4.z.literal("active"), import_zod4.z.literal("archived")]).meta({
          description: "active or archived - denotes if the newsletter is active or archived"
        })
      })
    )
  })
);

// src/schemas/newsletters.ts
var import_zod5 = require("zod");
var adminNewsletterCreateSchema = import_zod5.z.object({
  name: import_zod5.z.string(),
  description: import_zod5.z.string().max(3e3).optional(),
  sender_name: import_zod5.z.string(),
  sender_email: import_zod5.z.email().nullish(),
  sender_reply_to: import_zod5.z.string().optional(),
  status: import_zod5.z.union([import_zod5.z.literal("active"), import_zod5.z.literal("archived")]).optional(),
  subscribe_on_signup: import_zod5.z.boolean().optional(),
  sort_order: import_zod5.z.number().optional(),
  header_image: import_zod5.z.string().url().nullish(),
  show_header_icon: import_zod5.z.boolean().optional(),
  show_header_title: import_zod5.z.boolean().optional(),
  title_font_category: import_zod5.z.union([import_zod5.z.literal("sans_serif"), import_zod5.z.literal("serif")]).optional(),
  title_alignment: import_zod5.z.string().optional(),
  show_feature_image: import_zod5.z.boolean().optional(),
  body_font_category: import_zod5.z.union([import_zod5.z.literal("sans_serif"), import_zod5.z.literal("serif")]).optional(),
  footer_content: import_zod5.z.string().nullish(),
  show_badge: import_zod5.z.boolean().optional(),
  show_header_name: import_zod5.z.boolean().optional()
});

// src/schemas/offers.ts
var import_isSlug = __toESM(require("validator/lib/isSlug"));
var import_zod6 = require("zod");
var baseOffersCreateSchema = import_zod6.z.object({
  name: import_zod6.z.string(),
  code: import_zod6.z.string().refine((value) => (0, import_isSlug.default)(value), {
    message: "Code must be a valid slug"
  }),
  display_title: import_zod6.z.string().optional(),
  display_description: import_zod6.z.string().optional(),
  cadence: import_zod6.z.union([import_zod6.z.literal("year"), import_zod6.z.literal("month")]),
  amount: import_zod6.z.number().meta({
    description: "Amount of the percent or fixed amount in the smallest unit of the currency"
  }),
  duration: import_zod6.z.union([import_zod6.z.literal("once"), import_zod6.z.literal("forever"), import_zod6.z.literal("repeating")]),
  duration_in_months: import_zod6.z.number().meta({
    description: "Number of months offer should be repeated when duration is repeating"
  }).nullish(),
  currency_restriction: import_zod6.z.boolean().optional(),
  status: import_zod6.z.union([import_zod6.z.literal("active"), import_zod6.z.literal("archived")]).optional(),
  redemption_count: import_zod6.z.number().optional(),
  tier: import_zod6.z.object({
    id: import_zod6.z.string().min(1),
    name: import_zod6.z.string().optional()
  })
});
var adminOffersCreateSchema = import_zod6.z.discriminatedUnion("type", [
  import_zod6.z.object({
    type: import_zod6.z.literal("fixed"),
    currency: import_zod6.z.string(),
    ...baseOffersCreateSchema.shape
  }),
  import_zod6.z.object({
    type: import_zod6.z.literal("percent"),
    currency: import_zod6.z.string().nullish(),
    ...baseOffersCreateSchema.shape
  })
]);
var adminOffersUpdateSchema = import_zod6.z.object({
  name: import_zod6.z.string().optional(),
  code: import_zod6.z.string().refine((value) => (0, import_isSlug.default)(value), {
    message: "Code must be a valid slug"
  }).optional(),
  display_title: import_zod6.z.string().optional(),
  display_description: import_zod6.z.string().optional(),
  status: import_zod6.z.union([import_zod6.z.literal("active"), import_zod6.z.literal("archived")]).optional()
});

// src/schemas/webhooks.ts
var import_zod7 = require("zod");
var ghostEventTypes = import_zod7.z.union([
  import_zod7.z.literal("site.changed").meta({
    description: "Triggered whenever any content changes in your site data or settings"
  }),
  import_zod7.z.literal("post.added").meta({ description: "Triggered whenever a post is added to Ghost" }),
  import_zod7.z.literal("post.deleted").meta({ description: "Triggered whenever a post is deleted from Ghost" }),
  import_zod7.z.literal("post.edited").meta({ description: "Triggered whenever a post is edited in Ghost" }),
  import_zod7.z.literal("post.published").meta({ description: "Triggered whenever a post is published to Ghost" }),
  import_zod7.z.literal("post.published.edited").meta({
    description: "Triggered whenever a published post is edited in Ghost"
  }),
  import_zod7.z.literal("post.unpublished").meta({ description: "Triggered whenever a post is unpublished from Ghost" }),
  import_zod7.z.literal("post.scheduled").meta({
    description: "Triggered whenever a post is scheduled to be published in Ghost"
  }),
  import_zod7.z.literal("post.unscheduled").meta({
    description: "Triggered whenever a post is unscheduled from publishing in Ghost"
  }),
  import_zod7.z.literal("post.rescheduled").meta({
    description: "Triggered whenever a post is rescheduled to publish in Ghost"
  }),
  import_zod7.z.literal("page.added").meta({ description: "Triggered whenever a page is added to Ghost" }),
  import_zod7.z.literal("page.deleted").meta({ description: "Triggered whenever a page is deleted from Ghost" }),
  import_zod7.z.literal("page.edited").meta({ description: "Triggered whenever a page is edited in Ghost" }),
  import_zod7.z.literal("page.published").meta({ description: "Triggered whenever a page is published to Ghost" }),
  import_zod7.z.literal("page.published.edited").meta({
    description: "Triggered whenever a published page is edited in Ghost"
  }),
  import_zod7.z.literal("page.unpublished").meta({ description: "Triggered whenever a page is unpublished from Ghost" }),
  import_zod7.z.literal("page.scheduled").meta({
    description: "Triggered whenever a page is scheduled to be published in Ghost"
  }),
  import_zod7.z.literal("page.unscheduled").meta({
    description: "Triggered whenever a page is unscheduled from publishing in Ghost"
  }),
  import_zod7.z.literal("page.rescheduled").meta({
    description: "Triggered whenever a page is rescheduled to publish in Ghost"
  }),
  import_zod7.z.literal("tag.added").meta({ description: "Triggered whenever a tag is added to Ghost" }),
  import_zod7.z.literal("tag.edited").meta({ description: "Triggered whenever a tag is edited in Ghost" }),
  import_zod7.z.literal("tag.deleted").meta({ description: "Triggered whenever a tag is deleted from Ghost" }),
  import_zod7.z.literal("post.tag.attached").meta({ description: "Triggered whenever a tag is attached to a post in Ghost" }),
  import_zod7.z.literal("post.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a post in Ghost"
  }),
  import_zod7.z.literal("page.tag.attached").meta({ description: "Triggered whenever a tag is attached to a page in Ghost" }),
  import_zod7.z.literal("page.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a page in Ghost"
  }),
  import_zod7.z.literal("member.added").meta({ description: "Triggered whenever a member is added to Ghost" }),
  import_zod7.z.literal("member.edited").meta({ description: "Triggered whenever a member is edited in Ghost" }),
  import_zod7.z.literal("member.deleted").meta({ description: "Triggered whenever a member is deleted from Ghost" })
]);
var adminWebhookSchema = import_zod7.z.object({
  id: import_zod7.z.string().meta({ description: "The ID of the webhook" }),
  event: ghostEventTypes,
  target_url: import_zod7.z.url().meta({ description: "The URL of the webhook" }),
  name: import_zod7.z.string().meta({ description: "The name of the webhook" }).nullish(),
  secret: import_zod7.z.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: import_zod7.z.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: import_zod7.z.string().meta({ description: "The ID of the integration" }).nullish(),
  status: import_zod7.z.string().meta({ description: "The status of the webhook" }).nullish(),
  last_triggered_at: import_zod7.z.string().meta({ description: "The date and time of the last webhook trigger" }).nullish(),
  last_triggered_status: import_zod7.z.string().meta({ description: "The status of the last webhook trigger" }).nullish(),
  last_triggered_error: import_zod7.z.string().meta({ description: "The error of the last webhook trigger" }).nullish(),
  created_at: import_zod7.z.string().meta({ description: "The date and time of the webhook creation" }),
  updated_at: import_zod7.z.string().meta({ description: "The date and time of the webhook update" }).nullish()
});
var adminWebhookCreateSchema = import_zod7.z.object({
  event: ghostEventTypes,
  target_url: import_zod7.z.url().meta({ description: "The URL of the webhook" }),
  name: import_zod7.z.string().meta({ description: "The name of the webhook" }).optional(),
  secret: import_zod7.z.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: import_zod7.z.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: import_zod7.z.string().meta({ description: "The ID of the integration" }).nullish()
});
var adminWebhookUpdateSchema = import_zod7.z.object({
  event: ghostEventTypes.optional(),
  target_url: import_zod7.z.url().meta({ description: "The URL of the webhook" }).optional(),
  name: import_zod7.z.string().meta({ description: "The name of the webhook" }).optional(),
  api_version: import_zod7.z.string().meta({ description: "The API version of the webhook" }).nullish()
});

// src/schemas/pages.ts
var import_zod8 = require("zod");
var import_core_api5 = require("@ts-ghost/core-api");
var adminPagesSchema = import_core_api5.basePagesSchema.merge(
  import_zod8.z.object({
    uuid: import_zod8.z.string(),
    mobiledoc: import_zod8.z.string().nullish(),
    status: import_zod8.z.union([import_zod8.z.literal("draft"), import_zod8.z.literal("published"), import_zod8.z.literal("scheduled")]),
    frontmatter: import_zod8.z.string().nullish(),
    tiers: import_zod8.z.array(adminTiersSchema).nullish(),
    count: import_zod8.z.object({
      clicks: import_zod8.z.number().nullish(),
      positive_feedback: import_zod8.z.number().nullish(),
      negative_feedback: import_zod8.z.number().nullish(),
      paid_conversions: import_zod8.z.number().nullish(),
      signups: import_zod8.z.number().nullish()
    }).nullish(),
    authors: import_zod8.z.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    lexical: import_zod8.z.string().catch(
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    ).optional(),
    html: import_zod8.z.string().catch("").optional(),
    plaintext: import_zod8.z.string().catch("").optional()
  })
);
var adminPagesCreateSchema = import_zod8.z.object({
  title: import_zod8.z.string().min(1).max(2e3),
  slug: import_zod8.z.string().max(191).optional(),
  mobiledoc: import_zod8.z.string().max(1e9).optional(),
  lexical: import_zod8.z.string().max(1e9).optional(),
  html: import_zod8.z.string().max(1e9).optional(),
  feature_image: import_zod8.z.string().max(2e3).url().optional(),
  feature_image_alt: import_zod8.z.string().max(65535).optional(),
  feature_image_caption: import_zod8.z.string().max(65535).optional(),
  featured: import_zod8.z.boolean().optional(),
  status: import_zod8.z.union([import_zod8.z.literal("draft"), import_zod8.z.literal("published"), import_zod8.z.literal("scheduled")]).optional(),
  locale: import_zod8.z.string().max(6).optional(),
  visibility: import_zod8.z.union([
    import_zod8.z.literal("public"),
    import_zod8.z.literal("internal"),
    import_zod8.z.literal("members"),
    import_zod8.z.literal("paid"),
    import_zod8.z.literal("tiers")
  ]).optional(),
  visibility_filter: import_zod8.z.string().optional(),
  meta_title: import_zod8.z.string().max(300).optional(),
  meta_description: import_zod8.z.string().max(500).optional(),
  updated_at: import_zod8.z.date().transform((val) => val.toISOString()).optional(),
  published_at: import_zod8.z.date().transform((val) => val.toISOString()).optional(),
  custom_excerpt: import_zod8.z.string().max(300).optional(),
  codeinjection_head: import_zod8.z.string().max(65535).optional(),
  codeinjection_foot: import_zod8.z.string().max(65535).optional(),
  og_image: import_zod8.z.string().max(2e3).url().optional(),
  og_title: import_zod8.z.string().max(300).optional(),
  og_description: import_zod8.z.string().max(500).optional(),
  twitter_image: import_zod8.z.string().max(2e3).url().optional(),
  twitter_title: import_zod8.z.string().max(300).optional(),
  twitter_description: import_zod8.z.string().max(500).optional(),
  custom_template: import_zod8.z.string().max(100).optional(),
  canonical_url: import_zod8.z.string().max(2e3).url().optional(),
  tags: import_zod8.z.array(
    import_zod8.z.union([
      import_zod8.z.object({
        id: import_zod8.z.string().meta({ description: "The ID of the tags" })
      }),
      import_zod8.z.object({
        name: import_zod8.z.string().meta({ description: "The name of the tags" })
      }),
      import_zod8.z.object({
        slug: import_zod8.z.string().meta({ description: "The slug of the tags" })
      })
    ])
  ).meta({
    description: `The tags associated with the post array of either slug, id or name`
  }).optional(),
  tiers: import_zod8.z.array(
    import_zod8.z.union([
      import_zod8.z.object({
        id: import_zod8.z.string().meta({ description: "The ID of the tiers" })
      }),
      import_zod8.z.object({
        name: import_zod8.z.string().meta({ description: "The name of the tiers" })
      }),
      import_zod8.z.object({
        slug: import_zod8.z.string().meta({ description: "The slug of the tiers" })
      })
    ])
  ).meta({
    description: `The tiers associated with the post array of either slug, id or name`
  }).optional(),
  authors: import_zod8.z.array(
    import_zod8.z.union([
      import_zod8.z.object({
        id: import_zod8.z.string().meta({ description: "The ID of the author" })
      }),
      import_zod8.z.object({
        name: import_zod8.z.string().meta({ description: "The name of the author" })
      }),
      import_zod8.z.object({
        email: import_zod8.z.string().meta({ description: "The email of the author" })
      })
    ])
  ).meta({
    description: `Specifying author via id, name or slug.`
  }).optional()
});
var adminPagesUpdateSchema = adminPagesCreateSchema.partial({ title: true }).merge(
  import_zod8.z.object({
    updated_at: import_zod8.z.date().transform((val) => val.toISOString())
  })
);

// src/schemas/tags.ts
var import_zod9 = require("zod");
var adminTagsCreateSchema = import_zod9.z.object({
  name: import_zod9.z.string().min(1).max(191),
  slug: import_zod9.z.string().max(191).optional(),
  description: import_zod9.z.string().max(500).optional(),
  feature_image: import_zod9.z.url().optional(),
  visibility: import_zod9.z.union([import_zod9.z.literal("public"), import_zod9.z.literal("internal")]).optional(),
  meta_title: import_zod9.z.string().max(300).optional(),
  meta_description: import_zod9.z.string().max(500).optional(),
  og_image: import_zod9.z.string().url().optional(),
  og_title: import_zod9.z.string().max(300).optional(),
  og_description: import_zod9.z.string().max(500).optional(),
  twitter_image: import_zod9.z.string().url().optional(),
  twitter_title: import_zod9.z.string().max(300).optional(),
  twitter_description: import_zod9.z.string().max(500).optional(),
  codeinjection_head: import_zod9.z.string().max(65535).optional(),
  codeinjection_foot: import_zod9.z.string().max(65535).optional(),
  canonical_url: import_zod9.z.string().url().optional(),
  accent_color: import_zod9.z.string().max(50).optional()
});
var adminTagsUpdateSchema = adminTagsCreateSchema.merge(
  import_zod9.z.object({
    name: import_zod9.z.string().min(1).max(191).optional()
  })
);

// src/schemas/users.ts
var import_zod10 = require("zod");
var import_core_api6 = require("@ts-ghost/core-api");
var adminUsersSchema = import_core_api6.baseAuthorsSchema.merge(
  import_zod10.z.object({
    accessibility: import_zod10.z.string().nullish(),
    comment_notifications: import_zod10.z.boolean(),
    created_at: import_zod10.z.string().nullish(),
    updated_at: import_zod10.z.string().nullish(),
    tour: import_zod10.z.boolean().nullish(),
    email: import_zod10.z.string().nullish(),
    free_member_signup_notification: import_zod10.z.boolean(),
    last_seen: import_zod10.z.string().nullish(),
    mention_notifications: import_zod10.z.boolean().optional(),
    milestone_notifications: import_zod10.z.boolean().optional(),
    paid_subscription_canceled_notification: import_zod10.z.boolean(),
    paid_subscription_started_notification: import_zod10.z.boolean(),
    status: import_zod10.z.union([import_zod10.z.literal("active"), import_zod10.z.literal("invited"), import_zod10.z.literal("locked")]),
    roles: import_zod10.z.array(
      import_zod10.z.object({
        id: import_zod10.z.string(),
        name: import_zod10.z.string(),
        description: import_zod10.z.string(),
        created_at: import_zod10.z.string().nullish(),
        updated_at: import_zod10.z.string().nullish()
      })
    ).optional()
  })
);

// src/admin-api.ts
var TSGhostAdminAPI = class {
  constructor(url, key, version, options) {
    this.url = url;
    this.key = key;
    this.version = version;
    this.options = options;
    const apiCredentials = import_core_api7.adminAPICredentialsSchema.parse({
      key,
      version,
      url
    });
    this.httpClientFactory = new import_core_api7.HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "admin"
    });
  }
  httpClientFactory;
  get posts() {
    const postsIncludeSchema = import_zod11.z.object({
      authors: import_zod11.z.literal(true).optional(),
      tags: import_zod11.z.literal(true).optional(),
      tiers: import_zod11.z.literal(true).optional()
    });
    return new import_core_api7.APIComposer(
      "posts",
      {
        schema: adminPostsSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: postsIncludeSchema,
        createSchema: adminPostsCreateSchema,
        updateSchema: adminPostsUpdateSchema,
        updateOptionsSchema: import_zod11.z.object({
          newsletter: import_zod11.z.string().optional(),
          email_segment: import_zod11.z.string().optional(),
          force_rerender: import_zod11.z.boolean().optional(),
          save_revision: import_zod11.z.boolean().optional(),
          convert_to_lexical: import_zod11.z.boolean().optional(),
          source: import_zod11.z.literal("html").optional()
        }),
        createOptionsSchema: import_zod11.z.object({
          source: import_zod11.z.literal("html").optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get pages() {
    const pagesIncludeSchema = import_zod11.z.object({
      authors: import_zod11.z.literal(true).optional(),
      tags: import_zod11.z.literal(true).optional(),
      tiers: import_zod11.z.literal(true).optional()
    });
    return new import_core_api7.APIComposer(
      "pages",
      {
        schema: adminPagesSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: pagesIncludeSchema,
        createSchema: adminPagesCreateSchema,
        updateSchema: adminPagesUpdateSchema,
        updateOptionsSchema: import_zod11.z.object({
          force_rerender: import_zod11.z.boolean().optional(),
          save_revision: import_zod11.z.boolean().optional(),
          convert_to_lexical: import_zod11.z.boolean().optional(),
          source: import_zod11.z.literal("html").optional()
        }),
        createOptionsSchema: import_zod11.z.object({
          source: import_zod11.z.literal("html").optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get members() {
    return new import_core_api7.APIComposer(
      "members",
      {
        schema: adminMembersSchema,
        identitySchema: import_zod11.z.object({ id: import_zod11.z.string() }),
        include: import_zod11.z.object({}),
        createSchema: adminMembersCreateSchema,
        createOptionsSchema: import_zod11.z.object({
          send_email: import_zod11.z.boolean().optional(),
          email_type: import_zod11.z.union([import_zod11.z.literal("signin"), import_zod11.z.literal("subscribe"), import_zod11.z.literal("signup")]).optional()
        }),
        updateOptionsSchema: import_zod11.z.object({
          send_email: import_zod11.z.boolean().optional(),
          email_type: import_zod11.z.union([import_zod11.z.literal("signin"), import_zod11.z.literal("subscribe"), import_zod11.z.literal("signup")]).optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get tiers() {
    const tiersIncludeSchema = import_zod11.z.object({
      monthly_price: import_zod11.z.literal(true).optional(),
      yearly_price: import_zod11.z.literal(true).optional(),
      benefits: import_zod11.z.literal(true).optional()
    });
    return new import_core_api7.APIComposer(
      "tiers",
      {
        schema: adminTiersSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read"]);
  }
  get newsletters() {
    const newslettersIncludeSchema = import_zod11.z.object({});
    return new import_core_api7.APIComposer(
      "newsletters",
      {
        schema: import_core_api7.baseNewsletterSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: import_zod11.z.object({
          opt_in_existing: import_zod11.z.boolean()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit"]);
  }
  get offers() {
    const offersIncludeSchema = import_zod11.z.object({});
    return new import_core_api7.APIComposer(
      "offers",
      {
        schema: import_core_api7.baseOffersSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit"]);
  }
  get tags() {
    const tagsIncludeSchema = import_zod11.z.object({
      "count.posts": import_zod11.z.literal(true).optional()
    });
    return new import_core_api7.APIComposer(
      "tags",
      {
        schema: import_core_api7.baseTagsSchema,
        identitySchema: import_core_api7.slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get users() {
    const usersIncludeSchema = import_zod11.z.object({});
    return new import_core_api7.APIComposer(
      "users",
      {
        schema: adminUsersSchema,
        identitySchema: import_core_api7.emailOrIdSchema,
        include: usersIncludeSchema
      },
      this.httpClientFactory
    ).access(["browse", "read"]);
  }
  get webhooks() {
    return new import_core_api7.APIComposer(
      "webhooks",
      {
        schema: adminWebhookSchema,
        identitySchema: import_zod11.z.object({ id: import_zod11.z.string() }),
        include: import_zod11.z.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema
      },
      this.httpClientFactory
    ).access(["add", "edit", "delete"]);
  }
  get site() {
    return new import_core_api7.BasicFetcher("site", { output: import_core_api7.baseSiteSchema }, this.httpClientFactory.create());
  }
  get settings() {
    return new import_core_api7.BasicFetcher(
      "settings",
      {
        output: import_zod11.z.array(
          import_zod11.z.object({
            key: import_zod11.z.string(),
            value: import_zod11.z.string().nullable().or(import_zod11.z.number().nullable()).or(import_zod11.z.boolean().nullable())
          })
        )
      },
      this.httpClientFactory.create()
    );
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  TSGhostAdminAPI,
  adminAuthorsSchema,
  adminMembersCreateSchema,
  adminMembersSchema,
  adminNewsletterCreateSchema,
  adminOffersCreateSchema,
  adminOffersUpdateSchema,
  adminPostsCreateSchema,
  adminPostsSchema,
  adminPostsUpdateSchema,
  adminTiersCreateSchema,
  adminTiersSchema,
  adminWebhookCreateSchema,
  adminWebhookSchema,
  adminWebhookUpdateSchema,
  ghostEventTypes
});
//# sourceMappingURL=index.js.map