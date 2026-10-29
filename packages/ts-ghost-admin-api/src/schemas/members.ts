import { z } from "zod";
import {
  baseAttributionSchema,
  baseEmailSchemaFor,
  baseMembersShape,
  baseSubscriptionsSchemaFor,
  ghostObject,
  perTarget,
  type SchemaTarget,
} from "@ts-ghost/core-api";

import { droppedByGhost } from "./dropped-by-ghost";
import { adminTiersSchema } from "./tiers";

export const adminMembersCreateSchema = z.object({
  email: z.email().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).optional(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).optional(),
  /** @deprecated Ghost drops it, so it is not sent. */
  geolocation: droppedByGhost(z.string()),
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
  /** @deprecated Ghost drops it on edit, so it is not sent. */
  stripe_customer_id: droppedByGhost(z.string()),
});

/** An email sent to a member, for a schema target; the Mailgun event timestamps are null until the event arrives. */
export const adminMembersEmailRecipientsSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "admin.email_recipients", {
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
    email: baseEmailSchemaFor(target).meta({ description: "The email itself, sent by Ghost before 6.38" }),
  }),
);

/** The v6-compat email recipient schema. */
export const adminMembersEmailRecipientsSchema = adminMembersEmailRecipientsSchemaFor("v6-compat");

/** A member as the Admin API sends it, for a schema target. */
export const adminMembersSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "admin.members", {
    ...baseMembersShape(target),
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
    // Never seen set in a live run, so not split by target.
    current_subscription: baseSubscriptionsSchemaFor("v6-compat")
      .omit({ price: true, tier: true, offer: true, next_payment: true, offer_redemptions: true })
      .meta({ description: "(nullable) The member's active subscription, without price, tier and offer" })
      .nullable(),
    attribution: baseAttributionSchema
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
      .array(adminTiersSchema)
      .meta({ description: "The member's tiers; a browse sends them only with include: tiers" })
      .optional(),
    email_recipients: z
      .array(adminMembersEmailRecipientsSchemaFor(target))
      .meta({ description: "The emails sent to the member (include: email_recipients)" })
      .optional(),
    metafields: z
      .record(z.string(), z.record(z.string(), z.unknown()))
      .meta({ description: "Custom field values by namespace and key (include: metafields)" })
      .optional(),
    custom_fields: z
      .record(z.string(), z.unknown())
      .meta({ description: "Custom field values, on a read with the membersCustomFields labs flag on" })
      .optional(),
  }),
);

/** The v6-compat member schema. */
export const adminMembersSchema = adminMembersSchemaFor("v6-compat");

export const adminMembersIncludeSchema = z.object({
  tiers: z.literal(true).optional(),
  email_recipients: z.literal(true).optional(),
  // Ghost leaves `metafields` out for a member who has none, even when included.
  metafields: z.literal(true).optional().meta({ omittedWhenEmpty: true }),
});

export type Member<T extends SchemaTarget = "v6-compat"> = z.infer<
  ReturnType<typeof adminMembersSchemaFor<T>>
>;
