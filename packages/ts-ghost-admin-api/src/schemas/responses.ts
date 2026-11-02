import type { z } from "zod";

import { emailRecipients } from "./compat";
import { adminSchemas } from "./targets";

// The exported response schemas are the compat ones; latest is only adminSchemas.latest.
const compat = adminSchemas.compat;

export const adminPostsSchema = compat.posts;
export const adminPagesSchema = compat.pages;
export const adminMembersSchema = compat.members;
export const adminMembersEmailRecipientsSchema = emailRecipients;
export const adminUsersSchema = compat.users;
export const adminAuthorsSchema = compat.users;
export const adminNewsletterSchema = compat.newsletters;
export const adminTiersSchema = compat.tiers;
export const adminWebhookSchema = compat.webhooks;

export type Tiers = z.infer<typeof adminTiersSchema>;
