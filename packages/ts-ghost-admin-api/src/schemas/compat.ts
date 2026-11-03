import { z } from "zod";

import { latestAuthorsSchema } from "./authors";
import { latestEmailSchema } from "./email";
import { latestEmailRecipientsSchema, latestMembersSchema } from "./members";
import { latestNewsletterSchema } from "./newsletters";
import { latestOffersSchema } from "./offers";
import { latestPagesSchema } from "./pages";
import { latestPostsSchema } from "./posts";
import { DEFAULT_INCLUDES } from "./reasons";
import { latestSiteSchema } from "./site";
import { latestSubscriptionsSchema } from "./subscriptions";
import { latestTagsSchema } from "./tags";
import { latestTiersSchema } from "./tiers";
import { latestWebhookSchema } from "./webhooks";

// compat parses what every supported Ghost sends, 5.130 up to the pin: latest, widened.
// One line per difference, with the Ghost versions that differ; 5.130 and 6.0 send the same shapes.

const offers = latestOffersSchema.partial({ redemption_type: true }); // since 6.14

const email = latestEmailSchema.partial({ csd_email_count: true }); // since 6.7

const subscriptions = latestSubscriptionsSchema.partial({ next_payment: true }).extend({
  // next_payment: since 6.16
  offer: offers.nullable(),
  offer_redemptions: z
    .array(offers)
    .meta({ description: "The offers redeemed on the subscription" })
    .optional(), // since 6.20
});

const users = latestAuthorsSchema.partial({ gift_subscription_notifications: true }).extend({
  // gift_subscription_notifications: since 6.39
  gift_subscription_purchase_notification: z.boolean().optional(), // 6.28–6.38, then renamed
  gift_subscription_redemption_notification: z.boolean().optional(), // 6.28 only
});

const newsletters = latestNewsletterSchema.partial({ show_share_button: true }); // since 6.23

/** An email sent to a member, as compat parses it. */
export const emailRecipients = latestEmailRecipientsSchema.extend({
  email: email.meta({ description: "The email itself, sent by Ghost before 6.38" }).optional(), // until 6.37
});

const members = latestMembersSchema
  .partial({
    can_comment: true, // since 6.16
    commenting: true, // since 6.16
    current_subscription: true, // since 6.45
    enable_comment_notifications: true, // since 6.45
    enable_updates_and_announcements: true, // since 6.46
  })
  .extend({
    uuid: z.string().nullable(), // a nullable column until 6.0
    custom_fields: z.record(z.string(), z.unknown()).optional(), // 6.53–6.61, then metafields
    subscriptions: z
      .array(subscriptions)
      .meta({ description: "The subscriptions associated with the member" }),
    email_recipients: z
      .array(emailRecipients)
      .meta({ description: "The emails sent to the member (include: email_recipients)" })
      .optional(),
  });

const posts = latestPostsSchema.extend({
  authors: z.array(users),
  primary_author: users,
  email: email.meta({ description: `(nullable) ${DEFAULT_INCLUDES}` }).nullish(),
  newsletter: newsletters.meta({ description: `(nullable) ${DEFAULT_INCLUDES}` }).nullish(),
});

const pages = latestPagesSchema.extend({ authors: z.array(users), primary_author: users });

const site = latestSiteSchema.partial({ timezone: true }); // since 6.60

// Tiers, tags and webhooks are the same on every supported Ghost.
export const compatSchemas = {
  posts,
  pages,
  members,
  users,
  newsletters,
  offers,
  tiers: latestTiersSchema,
  tags: latestTagsSchema,
  webhooks: latestWebhookSchema,
  site,
};
// temporary, to trigger the sweep
