import { describe, expectTypeOf, test } from "vitest";
import type { z } from "zod";

import {
  adminAuthorsSchema,
  adminMembersEmailRecipientsSchema,
  adminMembersSchema,
  adminNewsletterSchema,
  adminPagesSchema,
  adminPostsSchema,
  adminTiersSchema,
  adminUsersSchema,
  adminWebhookSchema,
  type Author,
  type Member,
  type Newsletter,
  type Page,
  type Post,
  type Tiers,
  type User,
} from "..";
import type { emailRecipients } from "./compat";
import type { AdminSchemas } from "./targets";

type Compat = AdminSchemas["compat"];
type Out<S extends z.ZodType> = z.output<S>;

// Each top-level export is the compat schema.
describe("admin-api exports are compat", () => {
  test("posts, pages, members, users, authors", () => {
    expectTypeOf<Out<typeof adminPostsSchema>>().toEqualTypeOf<Out<Compat["posts"]>>();
    expectTypeOf<Out<typeof adminPagesSchema>>().toEqualTypeOf<Out<Compat["pages"]>>();
    expectTypeOf<Out<typeof adminMembersSchema>>().toEqualTypeOf<Out<Compat["members"]>>();
    expectTypeOf<Out<typeof adminUsersSchema>>().toEqualTypeOf<Out<Compat["users"]>>();
    expectTypeOf<Out<typeof adminAuthorsSchema>>().toEqualTypeOf<Out<Compat["users"]>>();
  });

  test("newsletters, tiers, webhooks, email recipients", () => {
    expectTypeOf<Out<typeof adminNewsletterSchema>>().toEqualTypeOf<Out<Compat["newsletters"]>>();
    expectTypeOf<Out<typeof adminTiersSchema>>().toEqualTypeOf<Out<Compat["tiers"]>>();
    expectTypeOf<Out<typeof adminWebhookSchema>>().toEqualTypeOf<Out<Compat["webhooks"]>>();
    expectTypeOf<Out<typeof adminMembersEmailRecipientsSchema>>().toEqualTypeOf<
      Out<typeof emailRecipients>
    >();
  });

  test("the resource types default to compat", () => {
    expectTypeOf<Post>().toEqualTypeOf<Out<Compat["posts"]>>();
    expectTypeOf<Page>().toEqualTypeOf<Out<Compat["pages"]>>();
    expectTypeOf<Member>().toEqualTypeOf<Out<Compat["members"]>>();
    expectTypeOf<User>().toEqualTypeOf<Out<Compat["users"]>>();
    expectTypeOf<Author>().toEqualTypeOf<Out<Compat["users"]>>();
    expectTypeOf<Newsletter>().toEqualTypeOf<Out<Compat["newsletters"]>>();
    expectTypeOf<Tiers>().toEqualTypeOf<Out<Compat["tiers"]>>();
  });
});
