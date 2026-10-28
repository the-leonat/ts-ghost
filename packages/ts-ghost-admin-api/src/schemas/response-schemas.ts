import {
  baseOffersSchemaFor,
  baseSiteSchemaFor,
  baseTagsSchema,
  type SchemaTarget,
} from "@ts-ghost/core-api";

import { adminMembersSchemaFor } from "./members";
import { adminNewsletterSchemaFor } from "./newsletters";
import { adminPagesSchemaFor } from "./pages";
import { adminPostsSchemaFor } from "./posts";
import { adminTiersSchema } from "./tiers";
import { adminUsersSchemaFor } from "./users";
import { adminWebhookSchema } from "./webhooks";

/** The schema of one item of each Admin API resource's response, for a schema target. */
export const adminResponseSchemas = <T extends SchemaTarget>(target: T) => ({
  posts: adminPostsSchemaFor(target),
  pages: adminPagesSchemaFor(target),
  members: adminMembersSchemaFor(target),
  users: adminUsersSchemaFor(target),
  newsletters: adminNewsletterSchemaFor(target),
  offers: baseOffersSchemaFor(target),
  tiers: adminTiersSchema,
  tags: baseTagsSchema,
  webhooks: adminWebhookSchema,
  site: baseSiteSchemaFor(target),
});
