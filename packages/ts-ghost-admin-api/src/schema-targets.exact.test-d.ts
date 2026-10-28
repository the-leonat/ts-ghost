import { describe, expectTypeOf, test } from "vitest";
import type { InferFetcherDataShape } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "./admin-api";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const v5 = new TSGhostAdminAPI("https://ghost.org", key, "v5.130");
const compat = new TSGhostAdminAPI("https://ghost.org", key, "v6.0");
const latest = new TSGhostAdminAPI("https://ghost.org", key, "v6.72", { schema: "latest" });
type Client = typeof v5 | typeof compat | typeof latest;

type OfferOf<A extends Client> = InferFetcherDataShape<ReturnType<A["offers"]["read"]>>;
type MemberOf<A extends Client> = InferFetcherDataShape<ReturnType<A["members"]["read"]>>;
type AuthorOf<A extends Client> = InferFetcherDataShape<ReturnType<A["posts"]["read"]>>["authors"][number];
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

type OfferCommon = {
  id: string;
  name: string;
  code: string;
  display_title: string;
  display_description: string;
  type: "percent" | "fixed" | "trial";
  cadence: "month" | "year";
  amount: number;
  duration: "once" | "forever" | "repeating" | "trial";
  duration_in_months: number | null;
  currency_restriction: boolean;
  currency: string | null;
  status: "active" | "archived";
  redemption_count: number;
  tier: { id: string; name?: string | undefined } | null;
  created_at: string;
  last_redeemed: string | null;
};
type Redemption = "signup" | "retention";
type Flat<T> = { [K in keyof T]: T[K] };

describe("offers, exactly", () => {
  test("v5", () => {
    expectTypeOf<OfferOf<typeof v5>>().toEqualTypeOf<OfferCommon>();
  });
  test("v6-compat: redemption_type (Ghost 6.13) may be missing", () => {
    expectTypeOf<OfferOf<typeof compat>>().toEqualTypeOf<
      Flat<OfferCommon & { redemption_type?: Redemption | undefined }>
    >();
  });
  test("v6-latest: redemption_type required", () => {
    expectTypeOf<OfferOf<typeof latest>>().toEqualTypeOf<
      Flat<OfferCommon & { redemption_type: Redemption }>
    >();
  });
});

type MemberRequired =
  | "avatar_image"
  | "comped"
  | "created_at"
  | "email"
  | "email_count"
  | "email_open_rate"
  | "email_opened_count"
  | "email_suppression"
  | "geolocation"
  | "id"
  | "labels"
  | "last_seen_at"
  | "name"
  | "newsletters"
  | "note"
  | "status"
  | "subscribed"
  | "subscriptions"
  | "unsubscribe_url"
  | "updated_at"
  | "uuid";
type Later = "can_comment" | "commenting" | "current_subscription" | "enable_comment_notifications";

describe("members, exactly", () => {
  test("v5: only what Ghost 5 sends; includes stay optional", () => {
    expectTypeOf<RequiredKeys<MemberOf<typeof v5>>>().toEqualTypeOf<MemberRequired>();
    expectTypeOf<OptionalKeys<MemberOf<typeof v5>>>().toEqualTypeOf<
      "attribution" | "email_recipients" | "tiers"
    >();
  });

  test("v6-compat: fields Ghost added after 6.0, and ones it removed, are optional", () => {
    expectTypeOf<RequiredKeys<MemberOf<typeof compat>>>().toEqualTypeOf<MemberRequired>();
    expectTypeOf<OptionalKeys<MemberOf<typeof compat>>>().toEqualTypeOf<
      | "attribution"
      | "email_recipients"
      | "tiers"
      | Later
      | "enable_updates_and_announcements"
      | "metafields"
      | "custom_fields"
    >();
    expectTypeOf<MemberOf<typeof compat>["can_comment"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<MemberOf<typeof compat>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null | undefined
    >();
  });

  test("v6-latest: every field the pin sends is required; removed ones are gone", () => {
    expectTypeOf<RequiredKeys<MemberOf<typeof latest>>>().toEqualTypeOf<
      MemberRequired | Later | "enable_updates_and_announcements"
    >();
    expectTypeOf<OptionalKeys<MemberOf<typeof latest>>>().toEqualTypeOf<
      "attribution" | "email_recipients" | "tiers" | "metafields"
    >();
    expectTypeOf<MemberOf<typeof latest>["can_comment"]>().toEqualTypeOf<boolean>();
    expectTypeOf<MemberOf<typeof latest>["enable_updates_and_announcements"]>().toEqualTypeOf<
      boolean | null
    >();
  });
});

type Gifts =
  | "gift_subscription_notifications"
  | "gift_subscription_purchase_notification"
  | "gift_subscription_redemption_notification";

describe("a post's authors, exactly", () => {
  test("v5 has none of Ghost 6's gift notifications", () => {
    expectTypeOf<Extract<keyof AuthorOf<typeof v5>, Gifts>>().toEqualTypeOf<never>();
    expectTypeOf<OptionalKeys<AuthorOf<typeof v5>>>().toEqualTypeOf<"count" | "roles">();
  });

  test("v6-compat has all three, optional, as each lived in some 6.x", () => {
    expectTypeOf<OptionalKeys<AuthorOf<typeof compat>>>().toEqualTypeOf<"count" | "roles" | Gifts>();
    expectTypeOf<AuthorOf<typeof compat>["gift_subscription_notifications"]>().toEqualTypeOf<
      boolean | undefined
    >();
  });

  test("v6-latest has only the current one, required", () => {
    expectTypeOf<
      Extract<keyof AuthorOf<typeof latest>, Gifts>
    >().toEqualTypeOf<"gift_subscription_notifications">();
    expectTypeOf<AuthorOf<typeof latest>["gift_subscription_notifications"]>().toEqualTypeOf<boolean>();
    expectTypeOf<OptionalKeys<AuthorOf<typeof latest>>>().toEqualTypeOf<"count" | "roles">();
  });
});

describe("deprecated forms", () => {
  test("every target keeps them, as @deprecated", () => {
    for (const api of [v5, compat, latest]) {
      void api.offers.read({ slug: "black-friday" });
      void api.posts.add({ title: "t", locale: "de", newsletter: { id: "n" } });
      void api.pages.add({ title: "t", mobiledoc: "{}" });
      void api.members.add({ email: "a@b.co", geolocation: "{}" });
      void api.members.edit("1", { geolocation: "{}", stripe_customer_id: "cus_1" });
      void api.tiers.browse().include({ monthly_price: true });
    }
  });
});
