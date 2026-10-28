import { describe, expectTypeOf, test } from "vitest";
import { GHOST_LATEST, type InferFetcherDataShape } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "./admin-api";
import type { Member, Post } from "./schemas";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const v5 = new TSGhostAdminAPI("https://ghost.org", key, "v5.130");
const compat = new TSGhostAdminAPI("https://ghost.org", key, "v6.0");
const latest = new TSGhostAdminAPI("https://ghost.org", key, `v${GHOST_LATEST}`, { schema: "latest" });
// The clients are only read as types here.
void [v5, compat, latest];

type PostOf<A extends typeof v5 | typeof compat | typeof latest> = InferFetcherDataShape<
  ReturnType<A["posts"]["read"]>
>;
type MemberOf<A extends typeof v5 | typeof compat | typeof latest> = InferFetcherDataShape<
  ReturnType<A["members"]["read"]>
>;
type OfferOf<A extends typeof v5 | typeof compat | typeof latest> = InferFetcherDataShape<
  ReturnType<A["offers"]["read"]>
>;
type Author<P> = P extends { authors: (infer A)[] } ? A : never;
type Newsletter<P> = NonNullable<P extends { newsletter?: infer N } ? N : never>;
type Recipient<M> = M extends { email_recipients?: (infer R)[] } ? R : never;

describe("posts per target", () => {
  test("v5: no Ghost 6 fields", () => {
    expectTypeOf<Author<PostOf<typeof v5>>>().toHaveProperty("name");
    expectTypeOf<Newsletter<PostOf<typeof v5>>>().toHaveProperty("sender_reply_to");
    expectTypeOf<Author<PostOf<typeof v5>>>().not.toHaveProperty("gift_subscription_notifications");
    expectTypeOf<Newsletter<PostOf<typeof v5>>>().not.toHaveProperty("show_share_button");
    expectTypeOf<PostOf<typeof v5>>().toEqualTypeOf<Post<"v5">>();
  });

  test("v6-compat: fields added after 6.0 are optional", () => {
    expectTypeOf<Author<PostOf<typeof compat>>["gift_subscription_notifications"]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<Newsletter<PostOf<typeof compat>>["show_share_button"]>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<PostOf<typeof compat>>().toEqualTypeOf<Post>();
  });

  test("v6-latest: what the pin sends is required, and removed fields are gone", () => {
    expectTypeOf<
      Author<PostOf<typeof latest>>["gift_subscription_notifications"]
    >().toEqualTypeOf<boolean>();
    expectTypeOf<Author<PostOf<typeof latest>>>().not.toHaveProperty(
      "gift_subscription_purchase_notification",
    );
    expectTypeOf<Newsletter<PostOf<typeof latest>>["show_share_button"]>().toEqualTypeOf<boolean>();
    expectTypeOf<PostOf<typeof latest>>().toEqualTypeOf<Post<"v6-latest">>();
  });
});

describe("members per target", () => {
  test("v5: no commenting, and an email recipient carries its email", () => {
    expectTypeOf<MemberOf<typeof v5>>().toHaveProperty("email");
    expectTypeOf<MemberOf<typeof v5>>().not.toHaveProperty("can_comment");
    expectTypeOf<MemberOf<typeof v5>>().not.toHaveProperty("current_subscription");
    expectTypeOf<Recipient<MemberOf<typeof v5>>>().toHaveProperty("email");
    expectTypeOf<Recipient<MemberOf<typeof v5>>["email"]>().not.toBeUndefined();
  });

  test("v6-compat: later fields optional, nullability kept apart", () => {
    expectTypeOf<MemberOf<typeof compat>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<MemberOf<typeof compat>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null | undefined
    >();
    expectTypeOf<MemberOf<typeof compat>>().toEqualTypeOf<Member>();
  });

  test("v6-latest: required as the pin sends them; the recipient's email is gone", () => {
    expectTypeOf<Recipient<MemberOf<typeof latest>>>().toHaveProperty("member_email");
    expectTypeOf<MemberOf<typeof latest>["can_comment"]>().toEqualTypeOf<boolean>();
    expectTypeOf<MemberOf<typeof latest>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null
    >();
    expectTypeOf<Recipient<MemberOf<typeof latest>>>().not.toHaveProperty("email");
  });
});

describe("offers per target", () => {
  test("redemption_type: absent on v5, optional on v6-compat, required on v6-latest", () => {
    expectTypeOf<OfferOf<typeof v5>>().toHaveProperty("code");
    expectTypeOf<OfferOf<typeof v5>>().not.toHaveProperty("redemption_type");
    expectTypeOf<OfferOf<typeof compat>["redemption_type"]>().toEqualTypeOf<
      "signup" | "retention" | undefined
    >();
    expectTypeOf<OfferOf<typeof latest>["redemption_type"]>().toEqualTypeOf<"signup" | "retention">();
  });

  test("a tier is nullable on every target", () => {
    expectTypeOf<OfferOf<typeof v5>["tier"]>().toBeNullable();
    expectTypeOf<OfferOf<typeof latest>["tier"]>().toBeNullable();
  });
});

describe("selection", () => {
  test('{ schema: "latest" } takes exactly the version of GHOST_LATEST', () => {
    expectTypeOf(latest.target).toEqualTypeOf<"v6-latest">();
    expectTypeOf(
      new TSGhostAdminAPI("https://ghost.org", key, `v${GHOST_LATEST}`, { schema: "latest", strict: true })
        .target,
    ).toEqualTypeOf<"v6-latest">();
  });

  test('{ schema: "latest" } with another version is a type error naming the expected one', () => {
    // @ts-expect-error Argument of type '"v6.2"' is not assignable to parameter of type '"v6.72"' (GHOST_LATEST)
    new TSGhostAdminAPI("https://ghost.org", key, "v6.2", { schema: "latest" });
    // @ts-expect-error a later minor is not the pinned one either
    new TSGhostAdminAPI("https://ghost.org", key, "v6.999", { schema: "latest" });
    // @ts-expect-error Ghost 5 has one schema target
    new TSGhostAdminAPI("https://ghost.org", key, "v5.130", { schema: "latest" });
    const version: string = `v${GHOST_LATEST}`;
    // @ts-expect-error a non-literal version can't be checked, so it is refused
    new TSGhostAdminAPI("https://ghost.org", key, version as `v6.${string}`, { schema: "latest" });
  });

  test("without latest, any Ghost 5 or 6 version is accepted", () => {
    expectTypeOf(new TSGhostAdminAPI("https://ghost.org", key, "v6.2").target).toEqualTypeOf<"v6-compat">();
    expectTypeOf(
      new TSGhostAdminAPI("https://ghost.org", key, "v6.2", { schema: "compat" }).target,
    ).toEqualTypeOf<"v6-compat">();
  });
});
