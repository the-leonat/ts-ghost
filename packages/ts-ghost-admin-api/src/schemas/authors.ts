import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";

/** A staff user as the Admin API sends it, both under /users/ and as a post's or page's author. */
export const adminAuthorsSchema = baseAuthorsSchema.merge(
  z.object({
    accessibility: z.string().nullish(),
    comment_notifications: z.boolean(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    // The stored JSON string of the onboarding steps the user has seen.
    tour: z.string().nullish(),
    email: z.string().nullish(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullish(),
    mention_notifications: z.boolean().optional(),
    milestone_notifications: z.boolean().optional(),
    // Added in Ghost 6, so optional for older Ghost versions; likewise the socials below.
    donation_notifications: z.boolean().optional(),
    gift_subscription_notifications: z.boolean().optional(),
    recommendation_notifications: z.boolean().optional(),
    paid_subscription_canceled_notification: z.boolean(),
    paid_subscription_started_notification: z.boolean(),
    bluesky: z.string().nullish(),
    instagram: z.string().nullish(),
    linkedin: z.string().nullish(),
    mastodon: z.string().nullish(),
    threads: z.string().nullish(),
    tiktok: z.string().nullish(),
    youtube: z.string().nullish(),
    // Ghost's user states (core/server/models/user.js); `invited` is kept for existing consumers.
    status: z.union([
      z.literal("active"),
      z.literal("invited"),
      z.literal("locked"),
      z.literal("inactive"),
      z.literal("warn-1"),
      z.literal("warn-2"),
      z.literal("warn-3"),
      z.literal("warn-4"),
    ]),
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
