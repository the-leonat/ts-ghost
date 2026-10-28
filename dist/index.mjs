// src/admin-api.ts
import { z as z11 } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  baseNewsletterSchema as baseNewsletterSchema2,
  baseOffersSchema,
  baseSiteSchema,
  baseTagsSchema,
  BasicFetcher,
  emailOrIdSchema,
  HTTPClientFactory,
  slugOrIdSchema
} from "@ts-ghost/core-api";

// src/schemas/posts.ts
import { z as z3 } from "zod";
import { baseEmailSchema, baseNewsletterSchema, basePostsSchema } from "@ts-ghost/core-api";

// src/schemas/authors.ts
import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";
var adminAuthorsSchema = baseAuthorsSchema.merge(
  z.object({
    accessibility: z.string().nullish(),
    comment_notifications: z.boolean(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    email: z.string().nullish(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullish(),
    mention_notifications: z.boolean().optional(),
    milestone_notifications: z.boolean().optional(),
    paid_subscription_canceled_notification: z.boolean(),
    paid_subscription_started_notification: z.boolean(),
    status: z.union([z.literal("active"), z.literal("invited"), z.literal("locked")]),
    roles: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        created_at: z.string().nullish(),
        updated_at: z.string().nullish()
      })
    ).optional()
  })
);

// src/schemas/tiers.ts
import { z as z2 } from "zod";
import { baseTiersSchema } from "@ts-ghost/core-api";
var adminTiersSchema = baseTiersSchema.merge(
  z2.object({
    monthly_price_id: z2.string().meta({ description: "Monthly Stripe price id" }).nullish(),
    yearly_price_id: z2.string().meta({ description: "Yearly Stripe price id" }).nullish()
  })
);
var adminTiersCreateSchema = z2.object({
  name: z2.string().meta({ description: "Name of the tier" }).min(1).max(2e3),
  description: z2.string().meta({ description: "Description of the tier" }).optional(),
  welcome_page_url: z2.string().meta({ description: "Welcome page URL of the tier" }).optional(),
  visibility: z2.union([z2.literal("public"), z2.literal("none")]).optional(),
  monthly_price: z2.number().meta({ description: "Monthly price of the tier" }).optional(),
  yearly_price: z2.number().meta({ description: "Yearly price of the tier" }).optional(),
  trial_days: z2.number().meta({ description: "Trial days of the tier" }).optional(),
  benefits: z2.array(z2.string().meta({ description: "Benefits of the tier" })).optional(),
  currency: z2.string().meta({ description: "Currency of the tier" }).optional(),
  active: z2.boolean().meta({ description: "Active of the tier" }).optional()
});

// src/schemas/posts.ts
var adminPostsSchema = basePostsSchema.merge(
  z3.object({
    uuid: z3.string(),
    mobiledoc: z3.string().nullish(),
    email_only: z3.boolean(),
    status: z3.union([z3.literal("draft"), z3.literal("published"), z3.literal("scheduled")]),
    email_segment: z3.string().nullish(),
    frontmatter: z3.string().nullish(),
    tiers: z3.array(adminTiersSchema).optional(),
    email: baseEmailSchema.nullish(),
    newsletter: baseNewsletterSchema.nullish(),
    count: z3.object({
      clicks: z3.number().nullish(),
      positive_feedback: z3.number().nullish(),
      negative_feedback: z3.number().nullish()
    }).nullish(),
    authors: z3.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    lexical: z3.string().catch(
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    ).optional(),
    html: z3.string().catch("").optional(),
    plaintext: z3.string().catch("").optional()
  })
);
var basePostsCreateSchema = z3.object({
  title: z3.string().min(1).max(2e3),
  slug: z3.string().max(191).optional(),
  mobiledoc: z3.string().max(1e9).optional(),
  lexical: z3.string().max(1e9).optional(),
  html: z3.string().max(1e9).optional(),
  feature_image: z3.string().max(2e3).url().optional(),
  feature_image_alt: z3.string().max(65535).optional(),
  feature_image_caption: z3.string().max(65535).optional(),
  featured: z3.boolean().optional(),
  status: z3.union([z3.literal("draft"), z3.literal("published"), z3.literal("scheduled"), z3.literal("sent")]).optional(),
  locale: z3.string().max(6).optional(),
  visibility: z3.union([
    z3.literal("public"),
    z3.literal("internal"),
    z3.literal("members"),
    z3.literal("paid"),
    z3.literal("tiers")
  ]).optional(),
  visibility_filter: z3.string().optional(),
  meta_title: z3.string().max(300).optional(),
  meta_description: z3.string().max(500).optional(),
  updated_at: z3.date().transform((val) => val.toISOString()).optional(),
  published_at: z3.date().transform((val) => val.toISOString()).optional(),
  custom_excerpt: z3.string().max(300).optional(),
  codeinjection_head: z3.string().max(65535).optional(),
  codeinjection_foot: z3.string().max(65535).optional(),
  og_image: z3.string().max(2e3).url().optional(),
  og_title: z3.string().max(300).optional(),
  og_description: z3.string().max(500).optional(),
  twitter_image: z3.string().max(2e3).url().optional(),
  twitter_title: z3.string().max(300).optional(),
  twitter_description: z3.string().max(500).optional(),
  email_subject: z3.string().max(300).optional(),
  custom_template: z3.string().max(100).optional(),
  canonical_url: z3.string().max(2e3).url().optional(),
  email_only: z3.boolean().optional(),
  tags: z3.array(
    z3.union([
      z3.object({
        id: z3.string().meta({ description: "The ID of the tags" })
      }),
      z3.object({
        name: z3.string().meta({ description: "The name of the tags" })
      }),
      z3.object({
        slug: z3.string().meta({ description: "The slug of the tags" })
      })
    ])
  ).meta({
    description: `The tags associated with the post array of either slug, id or name`
  }).optional(),
  tiers: z3.array(
    z3.union([
      z3.object({
        id: z3.string().meta({ description: "The ID of the tiers" })
      }),
      z3.object({
        name: z3.string().meta({ description: "The name of the tiers" })
      }),
      z3.object({
        slug: z3.string().meta({ description: "The slug of the tiers" })
      })
    ])
  ).meta({
    description: `The tiers associated with the post array of either slug, id or name`
  }).optional(),
  authors: z3.array(
    z3.union([
      z3.object({
        id: z3.string().meta({ description: "The ID of the author" })
      }),
      z3.object({
        name: z3.string().meta({ description: "The name of the author" })
      }),
      z3.object({
        email: z3.string().meta({ description: "The email of the author" })
      })
    ])
  ).meta({
    description: `Specifying author via id, name or slug.`
  }).optional(),
  newsletter: z3.union([
    z3.object({
      id: z3.string().meta({ description: "The ID of the newsletter" })
    }),
    z3.object({
      slug: z3.string().meta({ description: "The slug of the newsletter" })
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
  z3.object({
    updated_at: z3.date().transform((val) => val.toISOString())
  })
).refine(emailOnlyNewsletterRefinement, emailOnlyNewsletterRefinementOptions);

// src/schemas/members.ts
import { z as z4 } from "zod";
import { baseMembersSchema } from "@ts-ghost/core-api";
var adminMembersCreateSchema = z4.object({
  email: z4.email().meta({ description: "The email address of the member" }),
  name: z4.string().meta({ description: "The name of the member" }).optional(),
  note: z4.string().meta({ description: "(nullable) A note about the member" }).optional(),
  geolocation: z4.string().meta({ description: "(nullable) The geolocation of the member" }).optional(),
  labels: z4.array(
    z4.union([
      z4.object({
        id: z4.string().meta({ description: "The ID of the label" })
      }),
      z4.object({
        name: z4.string().meta({ description: "The name of the label" })
      }),
      z4.object({
        slug: z4.string().meta({ description: "The slug of the label" })
      })
    ])
  ).meta({ description: "The labels associated with the member" }).optional(),
  products: z4.array(
    z4.union([
      z4.object({
        id: z4.string().meta({ description: "The ID of the subscription" })
      }),
      z4.object({
        name: z4.string().meta({ description: "The name of the subscription" })
      }),
      z4.object({
        slug: z4.string().meta({ description: "The slug of the subscription" })
      })
    ])
  ).meta({
    description: `The products associated with the member, they correspond to a stripe product. 
          If given the member status will be 'comped' as given away a subscription.`
  }).optional(),
  // newsletters and subscribed exclude each other. `subscribed`
  newsletters: z4.array(
    z4.union([
      z4.object({
        id: z4.string().meta({ description: "The ID of the newsletter" })
      }),
      z4.object({
        name: z4.string().meta({ description: "The name of the newsletter" })
      })
    ])
  ).meta({
    description: `Specifying newsletter to subscribe to via id or name, incompatible with the \`subscribed\` property`
  }).optional(),
  subscribed: z4.boolean().meta({
    description: "Will subscribe the user to the default Newsletter, incompatible with the `newsletters` property"
  }).optional(),
  comped: z4.boolean().optional(),
  stripe_customer_id: z4.string().optional()
  // subscriptions: NOT_USED it seems that subscriptions are not used on the API see Ghost source code: ghost/members-api/lib/repositories/member.js (method create)
});
var adminMembersSchema = baseMembersSchema.merge(
  z4.object({
    subscribed: z4.boolean(),
    comped: z4.boolean().nullish(),
    email_suppression: z4.object({
      suppressed: z4.boolean(),
      info: z4.string().nullish()
    }).nullish(),
    newsletters: z4.array(
      z4.object({
        id: z4.string(),
        name: z4.string().meta({ description: "Public name for the newsletter" }),
        description: z4.string().meta({ description: "(nullable) Public description of the newsletter" }).nullish(),
        status: z4.union([z4.literal("active"), z4.literal("archived")]).meta({
          description: "active or archived - denotes if the newsletter is active or archived"
        })
      })
    )
  })
);

// src/schemas/newsletters.ts
import { z as z5 } from "zod";
var adminNewsletterCreateSchema = z5.object({
  name: z5.string(),
  description: z5.string().max(3e3).optional(),
  sender_name: z5.string(),
  sender_email: z5.email().nullish(),
  sender_reply_to: z5.string().optional(),
  status: z5.union([z5.literal("active"), z5.literal("archived")]).optional(),
  subscribe_on_signup: z5.boolean().optional(),
  sort_order: z5.number().optional(),
  header_image: z5.string().url().nullish(),
  show_header_icon: z5.boolean().optional(),
  show_header_title: z5.boolean().optional(),
  title_font_category: z5.union([z5.literal("sans_serif"), z5.literal("serif")]).optional(),
  title_alignment: z5.string().optional(),
  show_feature_image: z5.boolean().optional(),
  body_font_category: z5.union([z5.literal("sans_serif"), z5.literal("serif")]).optional(),
  footer_content: z5.string().nullish(),
  show_badge: z5.boolean().optional(),
  show_header_name: z5.boolean().optional()
});

// src/schemas/offers.ts
import isSlug from "validator/lib/isSlug";
import { z as z6 } from "zod";
var baseOffersCreateSchema = z6.object({
  name: z6.string(),
  code: z6.string().refine((value) => isSlug(value), {
    message: "Code must be a valid slug"
  }),
  display_title: z6.string().optional(),
  display_description: z6.string().optional(),
  cadence: z6.union([z6.literal("year"), z6.literal("month")]),
  amount: z6.number().meta({
    description: "Amount of the percent or fixed amount in the smallest unit of the currency"
  }),
  duration: z6.union([z6.literal("once"), z6.literal("forever"), z6.literal("repeating")]),
  duration_in_months: z6.number().meta({
    description: "Number of months offer should be repeated when duration is repeating"
  }).nullish(),
  currency_restriction: z6.boolean().optional(),
  status: z6.union([z6.literal("active"), z6.literal("archived")]).optional(),
  redemption_count: z6.number().optional(),
  tier: z6.object({
    id: z6.string().min(1),
    name: z6.string().optional()
  })
});
var adminOffersCreateSchema = z6.discriminatedUnion("type", [
  z6.object({
    type: z6.literal("fixed"),
    currency: z6.string(),
    ...baseOffersCreateSchema.shape
  }),
  z6.object({
    type: z6.literal("percent"),
    currency: z6.string().nullish(),
    ...baseOffersCreateSchema.shape
  })
]);
var adminOffersUpdateSchema = z6.object({
  name: z6.string().optional(),
  code: z6.string().refine((value) => isSlug(value), {
    message: "Code must be a valid slug"
  }).optional(),
  display_title: z6.string().optional(),
  display_description: z6.string().optional(),
  status: z6.union([z6.literal("active"), z6.literal("archived")]).optional()
});

// src/schemas/webhooks.ts
import { z as z7 } from "zod";
var ghostEventTypes = z7.union([
  z7.literal("site.changed").meta({
    description: "Triggered whenever any content changes in your site data or settings"
  }),
  z7.literal("post.added").meta({ description: "Triggered whenever a post is added to Ghost" }),
  z7.literal("post.deleted").meta({ description: "Triggered whenever a post is deleted from Ghost" }),
  z7.literal("post.edited").meta({ description: "Triggered whenever a post is edited in Ghost" }),
  z7.literal("post.published").meta({ description: "Triggered whenever a post is published to Ghost" }),
  z7.literal("post.published.edited").meta({
    description: "Triggered whenever a published post is edited in Ghost"
  }),
  z7.literal("post.unpublished").meta({ description: "Triggered whenever a post is unpublished from Ghost" }),
  z7.literal("post.scheduled").meta({
    description: "Triggered whenever a post is scheduled to be published in Ghost"
  }),
  z7.literal("post.unscheduled").meta({
    description: "Triggered whenever a post is unscheduled from publishing in Ghost"
  }),
  z7.literal("post.rescheduled").meta({
    description: "Triggered whenever a post is rescheduled to publish in Ghost"
  }),
  z7.literal("page.added").meta({ description: "Triggered whenever a page is added to Ghost" }),
  z7.literal("page.deleted").meta({ description: "Triggered whenever a page is deleted from Ghost" }),
  z7.literal("page.edited").meta({ description: "Triggered whenever a page is edited in Ghost" }),
  z7.literal("page.published").meta({ description: "Triggered whenever a page is published to Ghost" }),
  z7.literal("page.published.edited").meta({
    description: "Triggered whenever a published page is edited in Ghost"
  }),
  z7.literal("page.unpublished").meta({ description: "Triggered whenever a page is unpublished from Ghost" }),
  z7.literal("page.scheduled").meta({
    description: "Triggered whenever a page is scheduled to be published in Ghost"
  }),
  z7.literal("page.unscheduled").meta({
    description: "Triggered whenever a page is unscheduled from publishing in Ghost"
  }),
  z7.literal("page.rescheduled").meta({
    description: "Triggered whenever a page is rescheduled to publish in Ghost"
  }),
  z7.literal("tag.added").meta({ description: "Triggered whenever a tag is added to Ghost" }),
  z7.literal("tag.edited").meta({ description: "Triggered whenever a tag is edited in Ghost" }),
  z7.literal("tag.deleted").meta({ description: "Triggered whenever a tag is deleted from Ghost" }),
  z7.literal("post.tag.attached").meta({ description: "Triggered whenever a tag is attached to a post in Ghost" }),
  z7.literal("post.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a post in Ghost"
  }),
  z7.literal("page.tag.attached").meta({ description: "Triggered whenever a tag is attached to a page in Ghost" }),
  z7.literal("page.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a page in Ghost"
  }),
  z7.literal("member.added").meta({ description: "Triggered whenever a member is added to Ghost" }),
  z7.literal("member.edited").meta({ description: "Triggered whenever a member is edited in Ghost" }),
  z7.literal("member.deleted").meta({ description: "Triggered whenever a member is deleted from Ghost" })
]);
var adminWebhookSchema = z7.object({
  id: z7.string().meta({ description: "The ID of the webhook" }),
  event: ghostEventTypes,
  target_url: z7.url().meta({ description: "The URL of the webhook" }),
  name: z7.string().meta({ description: "The name of the webhook" }).nullish(),
  secret: z7.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: z7.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: z7.string().meta({ description: "The ID of the integration" }).nullish(),
  status: z7.string().meta({ description: "The status of the webhook" }).nullish(),
  last_triggered_at: z7.string().meta({ description: "The date and time of the last webhook trigger" }).nullish(),
  last_triggered_status: z7.string().meta({ description: "The status of the last webhook trigger" }).nullish(),
  last_triggered_error: z7.string().meta({ description: "The error of the last webhook trigger" }).nullish(),
  created_at: z7.string().meta({ description: "The date and time of the webhook creation" }),
  updated_at: z7.string().meta({ description: "The date and time of the webhook update" }).nullish()
});
var adminWebhookCreateSchema = z7.object({
  event: ghostEventTypes,
  target_url: z7.url().meta({ description: "The URL of the webhook" }),
  name: z7.string().meta({ description: "The name of the webhook" }).optional(),
  secret: z7.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: z7.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: z7.string().meta({ description: "The ID of the integration" }).nullish()
});
var adminWebhookUpdateSchema = z7.object({
  event: ghostEventTypes.optional(),
  target_url: z7.url().meta({ description: "The URL of the webhook" }).optional(),
  name: z7.string().meta({ description: "The name of the webhook" }).optional(),
  api_version: z7.string().meta({ description: "The API version of the webhook" }).nullish()
});

// src/schemas/pages.ts
import { z as z8 } from "zod";
import { basePagesSchema } from "@ts-ghost/core-api";
var adminPagesSchema = basePagesSchema.merge(
  z8.object({
    uuid: z8.string(),
    mobiledoc: z8.string().nullish(),
    status: z8.union([z8.literal("draft"), z8.literal("published"), z8.literal("scheduled")]),
    frontmatter: z8.string().nullish(),
    tiers: z8.array(adminTiersSchema).nullish(),
    count: z8.object({
      clicks: z8.number().nullish(),
      positive_feedback: z8.number().nullish(),
      negative_feedback: z8.number().nullish(),
      paid_conversions: z8.number().nullish(),
      signups: z8.number().nullish()
    }).nullish(),
    authors: z8.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    lexical: z8.string().catch(
      '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    ).optional(),
    html: z8.string().catch("").optional(),
    plaintext: z8.string().catch("").optional()
  })
);
var adminPagesCreateSchema = z8.object({
  title: z8.string().min(1).max(2e3),
  slug: z8.string().max(191).optional(),
  mobiledoc: z8.string().max(1e9).optional(),
  lexical: z8.string().max(1e9).optional(),
  html: z8.string().max(1e9).optional(),
  feature_image: z8.string().max(2e3).url().optional(),
  feature_image_alt: z8.string().max(65535).optional(),
  feature_image_caption: z8.string().max(65535).optional(),
  featured: z8.boolean().optional(),
  status: z8.union([z8.literal("draft"), z8.literal("published"), z8.literal("scheduled")]).optional(),
  locale: z8.string().max(6).optional(),
  visibility: z8.union([
    z8.literal("public"),
    z8.literal("internal"),
    z8.literal("members"),
    z8.literal("paid"),
    z8.literal("tiers")
  ]).optional(),
  visibility_filter: z8.string().optional(),
  meta_title: z8.string().max(300).optional(),
  meta_description: z8.string().max(500).optional(),
  updated_at: z8.date().transform((val) => val.toISOString()).optional(),
  published_at: z8.date().transform((val) => val.toISOString()).optional(),
  custom_excerpt: z8.string().max(300).optional(),
  codeinjection_head: z8.string().max(65535).optional(),
  codeinjection_foot: z8.string().max(65535).optional(),
  og_image: z8.string().max(2e3).url().optional(),
  og_title: z8.string().max(300).optional(),
  og_description: z8.string().max(500).optional(),
  twitter_image: z8.string().max(2e3).url().optional(),
  twitter_title: z8.string().max(300).optional(),
  twitter_description: z8.string().max(500).optional(),
  custom_template: z8.string().max(100).optional(),
  canonical_url: z8.string().max(2e3).url().optional(),
  tags: z8.array(
    z8.union([
      z8.object({
        id: z8.string().meta({ description: "The ID of the tags" })
      }),
      z8.object({
        name: z8.string().meta({ description: "The name of the tags" })
      }),
      z8.object({
        slug: z8.string().meta({ description: "The slug of the tags" })
      })
    ])
  ).meta({
    description: `The tags associated with the post array of either slug, id or name`
  }).optional(),
  tiers: z8.array(
    z8.union([
      z8.object({
        id: z8.string().meta({ description: "The ID of the tiers" })
      }),
      z8.object({
        name: z8.string().meta({ description: "The name of the tiers" })
      }),
      z8.object({
        slug: z8.string().meta({ description: "The slug of the tiers" })
      })
    ])
  ).meta({
    description: `The tiers associated with the post array of either slug, id or name`
  }).optional(),
  authors: z8.array(
    z8.union([
      z8.object({
        id: z8.string().meta({ description: "The ID of the author" })
      }),
      z8.object({
        name: z8.string().meta({ description: "The name of the author" })
      }),
      z8.object({
        email: z8.string().meta({ description: "The email of the author" })
      })
    ])
  ).meta({
    description: `Specifying author via id, name or slug.`
  }).optional()
});
var adminPagesUpdateSchema = adminPagesCreateSchema.partial({ title: true }).merge(
  z8.object({
    updated_at: z8.date().transform((val) => val.toISOString())
  })
);

// src/schemas/tags.ts
import { z as z9 } from "zod";
var adminTagsCreateSchema = z9.object({
  name: z9.string().min(1).max(191),
  slug: z9.string().max(191).optional(),
  description: z9.string().max(500).optional(),
  feature_image: z9.url().optional(),
  visibility: z9.union([z9.literal("public"), z9.literal("internal")]).optional(),
  meta_title: z9.string().max(300).optional(),
  meta_description: z9.string().max(500).optional(),
  og_image: z9.string().url().optional(),
  og_title: z9.string().max(300).optional(),
  og_description: z9.string().max(500).optional(),
  twitter_image: z9.string().url().optional(),
  twitter_title: z9.string().max(300).optional(),
  twitter_description: z9.string().max(500).optional(),
  codeinjection_head: z9.string().max(65535).optional(),
  codeinjection_foot: z9.string().max(65535).optional(),
  canonical_url: z9.string().url().optional(),
  accent_color: z9.string().max(50).optional()
});
var adminTagsUpdateSchema = adminTagsCreateSchema.merge(
  z9.object({
    name: z9.string().min(1).max(191).optional()
  })
);

// src/schemas/users.ts
import { z as z10 } from "zod";
import { baseAuthorsSchema as baseAuthorsSchema2 } from "@ts-ghost/core-api";
var adminUsersSchema = baseAuthorsSchema2.merge(
  z10.object({
    accessibility: z10.string().nullish(),
    comment_notifications: z10.boolean(),
    created_at: z10.string().nullish(),
    updated_at: z10.string().nullish(),
    tour: z10.boolean().nullish(),
    email: z10.string().nullish(),
    free_member_signup_notification: z10.boolean(),
    last_seen: z10.string().nullish(),
    mention_notifications: z10.boolean().optional(),
    milestone_notifications: z10.boolean().optional(),
    paid_subscription_canceled_notification: z10.boolean(),
    paid_subscription_started_notification: z10.boolean(),
    status: z10.union([z10.literal("active"), z10.literal("invited"), z10.literal("locked")]),
    roles: z10.array(
      z10.object({
        id: z10.string(),
        name: z10.string(),
        description: z10.string(),
        created_at: z10.string().nullish(),
        updated_at: z10.string().nullish()
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
    const apiCredentials = adminAPICredentialsSchema.parse({
      key,
      version,
      url
    });
    this.httpClientFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "admin"
    });
  }
  httpClientFactory;
  get posts() {
    const postsIncludeSchema = z11.object({
      authors: z11.literal(true).optional(),
      tags: z11.literal(true).optional(),
      tiers: z11.literal(true).optional()
    });
    return new APIComposer(
      "posts",
      {
        schema: adminPostsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
        createSchema: adminPostsCreateSchema,
        updateSchema: adminPostsUpdateSchema,
        updateOptionsSchema: z11.object({
          newsletter: z11.string().optional(),
          email_segment: z11.string().optional(),
          force_rerender: z11.boolean().optional(),
          save_revision: z11.boolean().optional(),
          convert_to_lexical: z11.boolean().optional(),
          source: z11.literal("html").optional()
        }),
        createOptionsSchema: z11.object({
          source: z11.literal("html").optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get pages() {
    const pagesIncludeSchema = z11.object({
      authors: z11.literal(true).optional(),
      tags: z11.literal(true).optional(),
      tiers: z11.literal(true).optional()
    });
    return new APIComposer(
      "pages",
      {
        schema: adminPagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
        createSchema: adminPagesCreateSchema,
        updateSchema: adminPagesUpdateSchema,
        updateOptionsSchema: z11.object({
          force_rerender: z11.boolean().optional(),
          save_revision: z11.boolean().optional(),
          convert_to_lexical: z11.boolean().optional(),
          source: z11.literal("html").optional()
        }),
        createOptionsSchema: z11.object({
          source: z11.literal("html").optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get members() {
    return new APIComposer(
      "members",
      {
        schema: adminMembersSchema,
        identitySchema: z11.object({ id: z11.string() }),
        include: z11.object({}),
        createSchema: adminMembersCreateSchema,
        createOptionsSchema: z11.object({
          send_email: z11.boolean().optional(),
          email_type: z11.union([z11.literal("signin"), z11.literal("subscribe"), z11.literal("signup")]).optional()
        }),
        updateOptionsSchema: z11.object({
          send_email: z11.boolean().optional(),
          email_type: z11.union([z11.literal("signin"), z11.literal("subscribe"), z11.literal("signup")]).optional()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get tiers() {
    const tiersIncludeSchema = z11.object({
      monthly_price: z11.literal(true).optional(),
      yearly_price: z11.literal(true).optional(),
      benefits: z11.literal(true).optional()
    });
    return new APIComposer(
      "tiers",
      {
        schema: adminTiersSchema,
        identitySchema: slugOrIdSchema,
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read"]);
  }
  get newsletters() {
    const newslettersIncludeSchema = z11.object({});
    return new APIComposer(
      "newsletters",
      {
        schema: baseNewsletterSchema2,
        identitySchema: slugOrIdSchema,
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z11.object({
          opt_in_existing: z11.boolean()
        })
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit"]);
  }
  get offers() {
    const offersIncludeSchema = z11.object({});
    return new APIComposer(
      "offers",
      {
        schema: baseOffersSchema,
        identitySchema: slugOrIdSchema,
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit"]);
  }
  get tags() {
    const tagsIncludeSchema = z11.object({
      "count.posts": z11.literal(true).optional()
    });
    return new APIComposer(
      "tags",
      {
        schema: baseTagsSchema,
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema
      },
      this.httpClientFactory
    ).access(["browse", "read", "add", "edit", "delete"]);
  }
  get users() {
    const usersIncludeSchema = z11.object({});
    return new APIComposer(
      "users",
      {
        schema: adminUsersSchema,
        identitySchema: emailOrIdSchema,
        include: usersIncludeSchema
      },
      this.httpClientFactory
    ).access(["browse", "read"]);
  }
  get webhooks() {
    return new APIComposer(
      "webhooks",
      {
        schema: adminWebhookSchema,
        identitySchema: z11.object({ id: z11.string() }),
        include: z11.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema
      },
      this.httpClientFactory
    ).access(["add", "edit", "delete"]);
  }
  get site() {
    return new BasicFetcher("site", { output: baseSiteSchema }, this.httpClientFactory.create());
  }
  get settings() {
    return new BasicFetcher(
      "settings",
      {
        output: z11.array(
          z11.object({
            key: z11.string(),
            value: z11.string().nullable().or(z11.number().nullable()).or(z11.boolean().nullable())
          })
        )
      },
      this.httpClientFactory.create()
    );
  }
};
export {
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
};
//# sourceMappingURL=index.mjs.map