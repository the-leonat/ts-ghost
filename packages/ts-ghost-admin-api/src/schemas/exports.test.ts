import { describe, expect, test } from "vitest";

import * as api from "..";
import { emailRecipients } from "./compat";

const compat = api.adminSchemas.compat;

describe("the top-level response schemas are the compat ones", () => {
  test.each([
    ["adminPostsSchema", compat.posts],
    ["adminPagesSchema", compat.pages],
    ["adminMembersSchema", compat.members],
    ["adminUsersSchema", compat.users],
    ["adminAuthorsSchema", compat.users],
    ["adminNewsletterSchema", compat.newsletters],
    ["adminTiersSchema", compat.tiers],
    ["adminWebhookSchema", compat.webhooks],
    ["adminMembersEmailRecipientsSchema", emailRecipients],
  ] as const)("%s", (name, schema) => {
    expect(api[name]).toBe(schema);
  });

  test("latest's editable modules are not exported", () => {
    expect(Object.keys(api).filter((k) => /^latest/.test(k))).toEqual([]);
  });
});
