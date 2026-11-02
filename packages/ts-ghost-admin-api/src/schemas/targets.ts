import type { z } from "zod";
import type { SchemaTarget } from "@ts-ghost/core-api";

import { latestAuthorsSchema } from "./authors";
import { compatSchemas } from "./compat";
import { latestMembersSchema } from "./members";
import { latestNewsletterSchema } from "./newsletters";
import { latestOffersSchema } from "./offers";
import { latestPagesSchema } from "./pages";
import { latestPostsSchema } from "./posts";
import { latestSiteSchema } from "./site";
import { latestTagsSchema } from "./tags";
import { latestTiersSchema } from "./tiers";
import { latestWebhookSchema } from "./webhooks";

// Exactly what the pinned Ghost (GHOST_LATEST) sends: the editable schema modules. Drift edits those.
const latestSchemas = {
  posts: latestPostsSchema,
  pages: latestPagesSchema,
  members: latestMembersSchema,
  users: latestAuthorsSchema,
  newsletters: latestNewsletterSchema,
  offers: latestOffersSchema,
  tiers: latestTiersSchema,
  tags: latestTagsSchema,
  webhooks: latestWebhookSchema,
  site: latestSiteSchema,
};

/** Each schema target's response schema per Admin API resource (one item of its response). */
export const adminSchemas = {
  compat: compatSchemas,
  latest: latestSchemas,
} satisfies Record<SchemaTarget, Record<keyof typeof latestSchemas, z.ZodObject>>;

export type AdminSchemas = typeof adminSchemas;

export type Post<T extends SchemaTarget = "compat"> = z.infer<AdminSchemas[T]["posts"]>;
export type Page<T extends SchemaTarget = "compat"> = z.infer<AdminSchemas[T]["pages"]>;
export type Member<T extends SchemaTarget = "compat"> = z.infer<AdminSchemas[T]["members"]>;
export type User<T extends SchemaTarget = "compat"> = z.infer<AdminSchemas[T]["users"]>;
export type Author<T extends SchemaTarget = "compat"> = User<T>;
export type Newsletter<T extends SchemaTarget = "compat"> = z.infer<AdminSchemas[T]["newsletters"]>;
