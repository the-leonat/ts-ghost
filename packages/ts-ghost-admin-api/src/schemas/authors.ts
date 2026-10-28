import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";

/** A staff user as the Admin API sends it, both under /users/ and as a post's or page's author. */
export const adminAuthorsSchema = baseAuthorsSchema.merge(
  z.object({
    accessibility: z.string().nullish(),
    comment_notifications: z.boolean(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    tour: z
      .string()
      .meta({ description: "(nullable) The JSON list of onboarding steps the user has seen" })
      .nullish(),
    email: z.string().nullish(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullish(),
    mention_notifications: z.boolean().optional(),
    milestone_notifications: z.boolean().optional(),
    donation_notifications: z.boolean(),
    gift_subscription_notifications: z
      .boolean()
      .meta({ description: "Sent by Ghost 6.x after 6.0" })
      .optional(),
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
          created_at: z.string().nullish(),
          updated_at: z.string().nullish(),
        }),
      )
      .optional(),
  }),
);

export type Author = z.infer<typeof adminAuthorsSchema>;
