import { z } from "zod";
import { baseAuthorsSchema, ghostObject, perTarget, type SchemaTarget } from "@ts-ghost/core-api";

/** A staff user as the Admin API sends it, under /users/ and as an author, for a schema target. */
export const adminAuthorsSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "admin.authors", {
    ...baseAuthorsSchema.shape,
    url: z.string(),
    accessibility: z.string().nullable(),
    comment_notifications: z.boolean(),
    created_at: z.string(),
    updated_at: z.string().nullable(),
    tour: z
      .string()
      .meta({ description: "(nullable) The JSON list of onboarding steps the user has seen" })
      .nullable(),
    email: z.string(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullable(),
    mention_notifications: z.boolean(),
    milestone_notifications: z.boolean(),
    donation_notifications: z.boolean(),
    gift_subscription_notifications: z.boolean(),
    gift_subscription_purchase_notification: z.boolean(),
    gift_subscription_redemption_notification: z.boolean(),
    recommendation_notifications: z.boolean(),
    paid_subscription_canceled_notification: z.boolean(),
    paid_subscription_started_notification: z.boolean(),
    bluesky: z.string().nullable(),
    instagram: z.string().nullable(),
    linkedin: z.string().nullable(),
    mastodon: z.string().nullable(),
    threads: z.string().nullable(),
    tiktok: z.string().nullable(),
    youtube: z.string().nullable(),
    status: z
      .union([
        z.literal("active"),
        z.literal("invited"),
        z.literal("locked"),
        z.literal("inactive"),
        z.literal("warn-1"),
        z.literal("warn-2"),
        z.literal("warn-3"),
        z.literal("warn-4"),
      ])
      .meta({
        description: "Ghost's user states; inactive is a suspended user, invited is kept for older Ghost",
      }),
    roles: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          created_at: z.string(),
          updated_at: z.string().nullable(),
        }),
      )
      .meta({ description: "Sent on a post's or page's authors unless the read names its includes" })
      .optional(),
  }),
);

/** The v6-compat staff user schema. */
export const adminAuthorsSchema = adminAuthorsSchemaFor("v6-compat");

export type Author<T extends SchemaTarget = "v6-compat"> = z.infer<
  ReturnType<typeof adminAuthorsSchemaFor<T>>
>;
