import { z } from "zod";

import { latestAttributionSchema, latestSubscriptionsSchema } from "./subscriptions";
import { latestTiersSchema } from "./tiers";

export const adminMembersCreateSchema = z.object({
  email: z.email().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).optional(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).optional(),
  /** @deprecated Ghost drops it; removed in a later major. */
  geolocation: z.string().meta({ deprecated: true }).optional(),
  labels: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the label" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the label" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the label" }),
        }),
      ]),
    )
    .meta({ description: "The labels associated with the member" })
    .optional(),
  products: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the subscription" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the subscription" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the subscription" }),
        }),
      ]),
    )
    .meta({
      description: `The products associated with the member, they correspond to a stripe product. 
          If given the member status will be 'comped' as given away a subscription.`,
    })
    .optional(),
  // newsletters and subscribed exclude each other. `subscribed`
  newsletters: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the newsletter" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the newsletter" }),
        }),
      ]),
    )
    .meta({
      description: `Specifying newsletter to subscribe to via id or name, incompatible with the \`subscribed\` property`,
    })
    .optional(),
  subscribed: z
    .boolean()
    .meta({
      description:
        "Will subscribe the user to the default Newsletter, incompatible with the `newsletters` property",
    })
    .optional(),
  comped: z.boolean().optional(),
  stripe_customer_id: z.string().optional(),
  // subscriptions: NOT_USED it seems that subscriptions are not used on the API see Ghost source code: ghost/members-api/lib/repositories/member.js (method create)
});

export const adminMembersUpdateSchema = adminMembersCreateSchema.partial().extend({
  /** @deprecated Ghost drops it on edit; removed in a later major. */
  stripe_customer_id: z.string().meta({ deprecated: true }).optional(),
});

/** An email sent to a member; the Mailgun event timestamps are null until the event arrives. */
export const latestEmailRecipientsSchema = z.object({
  id: z.string(),
  email_id: z.string(),
  member_id: z.string(),
  batch_id: z.string(),
  processed_at: z.string().nullable(),
  delivered_at: z.string().nullable(),
  opened_at: z.string().nullable(),
  failed_at: z.string().nullable(),
  member_uuid: z.string(),
  member_email: z.string(),
  member_name: z.string().nullable(),
});

/** A member as the Admin API sends it. */
export const latestMembersSchema = z.object({
  id: z.string(),
  email: z.string().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).nullable(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).nullable(),
  geolocation: z.string().meta({ description: "(nullable) The geolocation of the member" }).nullable(),
  created_at: z.string().meta({ description: "The date and time the member was created" }),
  updated_at: z.string().meta({ description: "The date and time the member was last updated" }).nullable(),
  labels: z.array(
    z
      .object({
        id: z.string().meta({ description: "The ID of the label" }),
        name: z.string().meta({ description: "The name of the label" }),
        slug: z.string().meta({ description: "The slug of the label" }),
        created_at: z.string().meta({ description: "The date and time the label was created" }),
        updated_at: z
          .string()
          .meta({ description: "The date and time the label was last updated" })
          .nullable(),
      })
      .meta({ description: "The labels associated with the member" }),
  ),
  subscriptions: z
    .array(latestSubscriptionsSchema)
    .meta({ description: "The subscriptions associated with the member" }),
  avatar_image: z
    .string()
    .meta({ description: "(nullable) The URL of the member's avatar image, null when Gravatar is off" })
    .nullable(),
  email_count: z.number().meta({ description: "The number of emails sent to the member" }),
  email_opened_count: z.number().meta({ description: "The number of emails opened by the member" }),
  email_open_rate: z.number().meta({ description: "(nullable) The open rate of the member" }).nullable(),
  status: z.string().meta({ description: "The status of the member" }),
  last_seen_at: z
    .string()
    .meta({ description: "(nullable) The date and time the member was last seen" })
    .nullable(),
  uuid: z.string(),
  subscribed: z.boolean(),
  comped: z.boolean(),
  email_suppression: z.object({
    suppressed: z.boolean(),
    info: z
      .object({
        reason: z.union([z.literal("spam"), z.literal("fail")]),
        timestamp: z.string(),
      })
      .meta({
        description: "(nullable) The Mailgun complaint (spam) or bounce (fail) that suppressed the email",
      })
      .nullable(),
  }),
  newsletters: z.array(
    z.object({
      id: z.string(),
      name: z.string().meta({ description: "Public name for the newsletter" }),
      description: z
        .string()
        .meta({ description: "(nullable) Public description of the newsletter" })
        .nullable(),
      status: z.union([z.literal("active"), z.literal("archived")]).meta({
        description: "active or archived - denotes if the newsletter is active or archived",
      }),
    }),
  ),
  current_subscription: latestSubscriptionsSchema
    .omit({ price: true, tier: true, offer: true, next_payment: true, offer_redemptions: true })
    .meta({ description: "(nullable) The member's active subscription, without price, tier and offer" })
    .nullable(),
  attribution: latestAttributionSchema
    .meta({ description: "(nullable) Where the member came from; a browse leaves it out" })
    .nullish(),
  unsubscribe_url: z.string(),
  can_comment: z.boolean(),
  commenting: z.object({
    disabled: z.boolean(),
    disabled_reason: z.string().nullable(),
    disabled_until: z.string().nullable(),
  }),
  enable_comment_notifications: z.boolean(),
  enable_updates_and_announcements: z.boolean().nullable(),
  tiers: z
    .array(latestTiersSchema)
    .meta({ description: "The member's tiers; a browse sends them only with include: tiers" })
    .optional(),
  email_recipients: z
    .array(latestEmailRecipientsSchema)
    .meta({ description: "The emails sent to the member (include: email_recipients)" })
    .optional(),
  metafields: z
    .record(z.string(), z.record(z.string(), z.unknown()))
    .meta({ description: "Custom field values by namespace and key (include: metafields)" })
    .optional(),
});

export const adminMembersIncludeSchema = z.object({
  tiers: z.literal(true).optional(),
  email_recipients: z.literal(true).optional(),
  // Ghost leaves `metafields` out for a member who has none, even when included.
  metafields: z.literal(true).optional().meta({ omittedWhenEmpty: true }),
});
