import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";

import { adminUserStatusSchema } from "./authors";

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
    donation_notifications: z.boolean().optional(),
    gift_subscription_notifications: z.boolean().optional(),
    recommendation_notifications: z.boolean().optional(),
    status: adminUserStatusSchema,
    roles: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          created_at: z.string().nullish(),
          updated_at: z.string().nullish(),
        })
      )
      .optional(),
  })
);

export type User = z.infer<typeof adminUsersSchema>;
