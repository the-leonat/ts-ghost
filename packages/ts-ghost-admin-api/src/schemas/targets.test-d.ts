import { describe, expectTypeOf, test } from "vitest";
import type { z } from "zod";
import type { ClientVersion, InferFetcherDataShape, SchemaTarget } from "@ts-ghost/core-api";

import type { Member, Post } from "..";
import { TSGhostAdminAPI } from "../admin-api";
import type { AdminSchemas } from "./targets";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const compat = new TSGhostAdminAPI("https://ghost.org", key, "v6.0");
const latest = new TSGhostAdminAPI("https://ghost.org", key, "v6.0", { schema: "latest" });
// The clients are only read as types here.
void [compat, latest];

type PostOf<A extends typeof compat | typeof latest> = InferFetcherDataShape<ReturnType<A["posts"]["read"]>>;
type MemberOf<A extends TSGhostAdminAPI<any, any>> = InferFetcherDataShape<ReturnType<A["members"]["read"]>>;
type OfferOf<A extends typeof compat | typeof latest> = InferFetcherDataShape<
  ReturnType<A["offers"]["read"]>
>;
type Author<P> = P extends { authors: (infer A)[] } ? A : never;
type Newsletter<P> = NonNullable<P extends { newsletter?: infer N } ? N : never>;
type Recipient<M> = M extends { email_recipients?: (infer R)[] } ? R : never;

describe("the schema option alone selects the target", () => {
  const url = "https://ghost.org";
  const pinVersion = new TSGhostAdminAPI(url, key, "v6.72");
  const anyVersion = new TSGhostAdminAPI(url, key, "v6.0" as ClientVersion);
  const anyVersionLatest = new TSGhostAdminAPI(url, key, "v6.0" as ClientVersion, { schema: "latest" });
  const anyTarget = new TSGhostAdminAPI(url, key, "v6.0", { schema: "latest" as SchemaTarget });
  const otherOption = new TSGhostAdminAPI(url, key, "v6.0", { strict: true });
  // The clients are only read as types here.
  void [pinVersion, anyVersion, anyVersionLatest, anyTarget, otherOption];

  test("the pin's version is still compat", () => {
    expectTypeOf<MemberOf<typeof pinVersion>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
  });

  test("a non-literal version keeps every field", () => {
    expectTypeOf<MemberOf<typeof anyVersion>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<MemberOf<typeof anyVersionLatest>["can_comment"]>().toEqualTypeOf<boolean>();
  });

  test("a non-literal target types as compat, which latest's output fits", () => {
    expectTypeOf<MemberOf<typeof anyTarget>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
  });

  test("other options leave it compat, and a typo doesn't compile", () => {
    expectTypeOf<MemberOf<typeof otherOption>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
    // @ts-expect-error not a target
    new TSGhostAdminAPI(url, key, "v6.0", { schema: "lastest" });
  });
});

describe("posts per target", () => {
  test("compat: fields added after 5.130 are optional", () => {
    expectTypeOf<Author<PostOf<typeof compat>>["gift_subscription_notifications"]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Newsletter<PostOf<typeof compat>>["show_share_button"]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<PostOf<typeof compat>>().toEqualTypeOf<Post>();
  });

  test("latest: what the pin sends is required, and removed fields are gone", () => {
    expectTypeOf<
      Author<PostOf<typeof latest>>["gift_subscription_notifications"]
    >().toEqualTypeOf<boolean>();
    expectTypeOf<Author<PostOf<typeof latest>>>().not.toHaveProperty(
      "gift_subscription_purchase_notification",
    );
    expectTypeOf<Newsletter<PostOf<typeof latest>>["show_share_button"]>().toEqualTypeOf<boolean>();
    expectTypeOf<PostOf<typeof latest>>().toEqualTypeOf<Post<"latest">>();
  });
});

describe("members per target", () => {
  test("compat: later fields optional, nullability kept apart", () => {
    expectTypeOf<MemberOf<typeof compat>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<MemberOf<typeof compat>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null | undefined
    >();
    expectTypeOf<MemberOf<typeof compat>>().toEqualTypeOf<Member>();
  });

  test("latest: required as the pin sends them; the recipient's email is gone", () => {
    expectTypeOf<Recipient<MemberOf<typeof latest>>>().toHaveProperty("member_email");
    expectTypeOf<MemberOf<typeof latest>["can_comment"]>().toEqualTypeOf<boolean>();
    expectTypeOf<MemberOf<typeof latest>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null
    >();
    expectTypeOf<Recipient<MemberOf<typeof latest>>>().not.toHaveProperty("email");
  });
});

describe("offers per target", () => {
  test("redemption_type: optional on compat, required on latest", () => {
    expectTypeOf<OfferOf<typeof compat>>().toHaveProperty("code");
    expectTypeOf<OfferOf<typeof compat>["redemption_type"]>().toEqualTypeOf<
      "signup" | "retention" | undefined
    >();
    expectTypeOf<OfferOf<typeof latest>["redemption_type"]>().toEqualTypeOf<"signup" | "retention">();
  });

  test("a tier is nullable on every target", () => {
    expectTypeOf<OfferOf<typeof compat>["tier"]>().toBeNullable();
    expectTypeOf<OfferOf<typeof latest>["tier"]>().toBeNullable();
  });
});

type Out<T extends "compat" | "latest", R extends keyof AdminSchemas["latest"]> = z.output<
  AdminSchemas[T][R]
>;

// compat only widens latest, so it parses whatever the pin sends.
describe("latest's output is assignable to compat's", () => {
  test("posts, pages, members, users", () => {
    expectTypeOf<Out<"latest", "posts">>().toExtend<Out<"compat", "posts">>();
    expectTypeOf<Out<"latest", "pages">>().toExtend<Out<"compat", "pages">>();
    expectTypeOf<Out<"latest", "members">>().toExtend<Out<"compat", "members">>();
    expectTypeOf<Out<"latest", "users">>().toExtend<Out<"compat", "users">>();
  });

  test("newsletters, offers, tiers, tags, webhooks, site", () => {
    expectTypeOf<Out<"latest", "newsletters">>().toExtend<Out<"compat", "newsletters">>();
    expectTypeOf<Out<"latest", "offers">>().toExtend<Out<"compat", "offers">>();
    expectTypeOf<Out<"latest", "tiers">>().toExtend<Out<"compat", "tiers">>();
    expectTypeOf<Out<"latest", "tags">>().toExtend<Out<"compat", "tags">>();
    expectTypeOf<Out<"latest", "webhooks">>().toExtend<Out<"compat", "webhooks">>();
    expectTypeOf<Out<"latest", "site">>().toExtend<Out<"compat", "site">>();
  });
});
