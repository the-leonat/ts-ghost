import { describe, expect, test } from "vitest";
import {
  baseEmailSchemaFor,
  baseMembersSchemaFor,
  baseOffersSchemaFor,
  baseSiteSchemaFor,
  baseSubscriptionsSchemaFor,
  GHOST_FIELDS,
  type SchemaTarget,
} from "@ts-ghost/core-api";

import { adminAuthorsSchemaFor } from "./authors";
import { adminMembersEmailRecipientsSchemaFor, adminMembersSchemaFor } from "./members";
import { adminNewsletterSchemaFor } from "./newsletters";
import { adminPagesSchemaFor } from "./pages";
import { adminPostsSchemaFor } from "./posts";

// Every object the since/until table names, by its table name.
const OBJECTS: Record<string, (target: SchemaTarget) => { shape: object }> = {
  "admin.authors": adminAuthorsSchemaFor,
  "admin.email_recipients": adminMembersEmailRecipientsSchemaFor,
  "admin.members": adminMembersSchemaFor,
  "admin.newsletters": adminNewsletterSchemaFor,
  "admin.pages": adminPagesSchemaFor,
  "admin.posts": adminPostsSchemaFor,
  email: baseEmailSchemaFor,
  members: baseMembersSchemaFor,
  offers: baseOffersSchemaFor,
  site: baseSiteSchemaFor,
  subscriptions: baseSubscriptionsSchemaFor,
};

describe("the since/until table", () => {
  // The drift job adds an entry for a key Ghost starts sending; this fails until the schema types it.
  test.each(Object.entries(GHOST_FIELDS))("%s names a field its schema declares", (key, range) => {
    const name = key.slice(0, key.lastIndexOf("."));
    const field = key.slice(key.lastIndexOf(".") + 1);
    expect(OBJECTS, `no schema is mapped to "${name}"`).toHaveProperty([name]);
    const target = (range as { until?: string }).until === "6.0" ? "v5" : "v6-compat";
    expect(Object.keys(OBJECTS[name]!(target).shape)).toContain(field);
  });
});
