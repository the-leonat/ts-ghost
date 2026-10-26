import { z } from "zod";
import { baseMembersSchema } from "@ts-ghost/core-api";

import { adminTiersSchema } from "./tiers";

export const adminMembersCreateSchema = z.object({
  email: z.email().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).optional(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).optional(),
  geolocation: z.string().meta({ description: "(nullable) The geolocation of the member" }).optional(),
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

/**
 * One email Ghost sent to a member, as its `email_recipients` row. The
 * timestamps come from Mailgun events and are null until the event arrives.
 */
export const adminMemberEmailRecipientSchema = z.object({
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

/**
 * A member as Ghost's admin members serializer sends it. `labels`,
 * `newsletters` and `subscriptions` are always sent and cannot be included;
 * `tiers` and `email_recipients` are includable, optional here and required
 * on the type an `.include()` returns.
 *
 * Evidence gaps: the recorded fixtures (Ghost's seed, its in-process Stripe
 * mock, network off, privacy tinfoil on) cannot vouch for these, so a passing
 * client check says nothing about them; they are typed from Ghost's source.
 * - `avatar_image`: always null (Gravatar off); production sends a URL.
 * - `geolocation`, `note`, `last_seen_at`: always null. `geolocation` is
 *   GeoJS's answer as a JSON string, kept opaque.
 * - `email_suppression.info`: always null; no member is suppressed.
 * - `email_recipients`: always empty; the seed sends no emails.
 * - `metafields`: never sent; no member has any (not modelled, see the include schema).
 * - `subscriptions[].cancellation_reason` (free text) and `.offer`: always null.
 * - `subscriptions[].status`: always `active`; `default_payment_card_last4`
 *   is the seed's `4242` or the stand-in `****`; `price.id` is the seed's
 *   64-hex form, not Stripe's `price_…`; `customer` values are seed or mock literals.
 */
export const adminMembersSchema = baseMembersSchema.merge(
  z.object({
    subscribed: z.boolean(),
    comped: z.boolean().nullish(),
    email_suppression: z
      .object({
        suppressed: z.boolean(),
        // Mailgun bounce and complaint events, normalised by Ghost's
        // `EmailSuppressionData` (`email-suppression-list.js`). Null when not
        // suppressed, and when Ghost disabled the email with no suppression
        // list entry behind it. No fixture covers a suppressed member: Ghost
        // records one only from Mailgun events, so this follows Ghost's source.
        info: z
          .object({
            reason: z.union([z.literal("spam"), z.literal("fail")]),
            timestamp: z.string(),
          })
          .nullish(),
      })
      .nullish(),
    newsletters: z.array(
      z.object({
        id: z.string(),
        name: z.string().meta({ description: "Public name for the newsletter" }),
        description: z
          .string()
          .meta({ description: "(nullable) Public description of the newsletter" })
          .nullish(),
        status: z.union([z.literal("active"), z.literal("archived")]).meta({
          description: "active or archived - denotes if the newsletter is active or archived",
        }),
      }),
    ),
    // Includable (`include=tiers`): a browse sends it only when included; a
    // read, add or edit always sends it.
    tiers: z
      .array(adminTiersSchema)
      .meta({ description: "The tiers the member has access to (include: tiers)" })
      .optional(),
    // Includable (`include=email_recipients`), sent only when included. Typed
    // from Ghost's `email_recipients` table: no fixture holds a recipient.
    email_recipients: z
      .array(adminMemberEmailRecipientSchema)
      .meta({ description: "The emails sent to the member (include: email_recipients)" })
      .optional(),
  }),
);

/** The relations a member read or browse can include, as Ghost's members endpoint allows them. */
export const adminMembersIncludeSchema = z.object({
  tiers: z.literal(true).optional(),
  email_recipients: z.literal(true).optional(),
  // Ghost omits `metafields` for a member who has none, even when included, so
  // an include cannot make it required; and since an included key that the
  // member schema models is made required, `metafields` is left out of the
  // member schema (and stripped) until it can be typed from a recorded value.
  metafields: z.literal(true).optional(),
});

export type Member = z.infer<typeof adminMembersSchema>;
