import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";

export const adminUsersSchema = baseAuthorsSchema.merge(
  z.object({
    accessibility: z.string().nullish(),
    comment_notifications: z.boolean(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    tour: z.boolean().nullish(),
    email: z.string().nullish(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullish(),
    mention_notifications: z.boolean().optional(),
    milestone_notifications: z.boolean().optional(),
    paid_subscription_canceled_notification: z.boolean(),
    paid_subscription_started_notification: z.boolean(),
    // Ghost's user states (core/server/models/user.js): active, warn-1..4,
    // inactive and locked. `invited` is kept for existing consumers.
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

export type User = z.infer<typeof adminUsersSchema>;
