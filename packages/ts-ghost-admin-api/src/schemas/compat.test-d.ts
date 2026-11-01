import { describe, expectTypeOf, test } from "vitest";
import type { InferFetcherDataShape } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "../admin-api";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const compat = new TSGhostAdminAPI("https://ghost.org", key, "v6.0");
const latest = new TSGhostAdminAPI("https://ghost.org", key, "v6.72", { schema: "latest" });
type Client = typeof compat | typeof latest;

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
  test("compat: redemption_type (Ghost 6.14) may be missing", () => {
    expectTypeOf<OfferOf<typeof compat>>().toEqualTypeOf<
      Flat<OfferCommon & { redemption_type?: Redemption | undefined }>
    >();
  });
  test("latest: redemption_type required", () => {
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
  test("compat: fields Ghost added after 5.130, and ones it removed, are optional", () => {
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

  test("latest: every field the pin sends is required; removed ones are gone", () => {
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

  test("uuid: nullable on compat (a nullable column until 6.0), a string on latest", () => {
    expectTypeOf<MemberOf<typeof compat>["uuid"]>().toEqualTypeOf<string | null>();
    expectTypeOf<MemberOf<typeof latest>["uuid"]>().toEqualTypeOf<string>();
  });
});

type Gifts =
  | "gift_subscription_notifications"
  | "gift_subscription_purchase_notification"
  | "gift_subscription_redemption_notification";

describe("a post's authors, exactly", () => {
  test("compat has all three, optional, as each lived in some 6.x", () => {
    expectTypeOf<OptionalKeys<AuthorOf<typeof compat>>>().toEqualTypeOf<"count" | "roles" | Gifts>();
    expectTypeOf<AuthorOf<typeof compat>["gift_subscription_notifications"]>().toEqualTypeOf<
      boolean | undefined
    >();
  });

  test("latest has only the current one, required", () => {
    expectTypeOf<
      Extract<keyof AuthorOf<typeof latest>, Gifts>
    >().toEqualTypeOf<"gift_subscription_notifications">();
    expectTypeOf<AuthorOf<typeof latest>["gift_subscription_notifications"]>().toEqualTypeOf<boolean>();
    expectTypeOf<OptionalKeys<AuthorOf<typeof latest>>>().toEqualTypeOf<"count" | "roles">();
  });
});

type PostOf<A extends Client> = InferFetcherDataShape<ReturnType<A["posts"]["read"]>>;
type PostOptional =
  | "count"
  | "email"
  | "html"
  | "lexical"
  | "mobiledoc"
  | "newsletter"
  | "plaintext"
  | "primary_tag"
  | "tags"
  | "tiers";
type Email<P> = NonNullable<P extends { email?: infer E } ? E : never>;

describe("posts, exactly", () => {
  test("a post has the same keys on every target", () => {
    expectTypeOf<keyof PostOf<typeof latest>>().toEqualTypeOf<keyof PostOf<typeof compat>>();
    expectTypeOf<OptionalKeys<PostOf<typeof compat>>>().toEqualTypeOf<PostOptional>();
    expectTypeOf<OptionalKeys<PostOf<typeof latest>>>().toEqualTypeOf<PostOptional>();
  });

  test("its email's csd_email_count (Ghost 6.7): optional on compat, required on latest", () => {
    expectTypeOf<Email<PostOf<typeof compat>>["csd_email_count"]>().toEqualTypeOf<
      number | null | undefined
    >();
    expectTypeOf<Email<PostOf<typeof latest>>["csd_email_count"]>().toEqualTypeOf<number | null>();
    expectTypeOf<OptionalKeys<Email<PostOf<typeof latest>>>>().toEqualTypeOf<never>();
  });
});

describe("inputs", () => {
  test("every target takes the same inputs, deprecated ones included", () => {
    for (const api of [compat, latest]) {
      void api.posts.add({ title: "t", locale: "de", mobiledoc: "{}", newsletter: { id: "n" } });
      void api.pages.add({ title: "t", locale: "de", mobiledoc: "{}" });
      void api.members.add({ email: "a@b.co", geolocation: "{}" });
      void api.members.edit("1", { geolocation: "{}", stripe_customer_id: "cus_1" });
      void api.tiers.browse().include({ monthly_price: true });
    }
  });
});

describe("tiers, offers and newsletters", () => {
  test("read by id only on every target: Ghost has no read-by-slug route for them", () => {
    for (const api of [compat, latest]) {
      void api.tiers.read({ id: "1" });
      // @ts-expect-error no tiers read by slug
      void api.tiers.read({ slug: "gold" });
      // @ts-expect-error no offers read by slug
      void api.offers.read({ slug: "black-friday" });
      // @ts-expect-error no newsletters read by slug
      void api.newsletters.read({ slug: "weekly" });
    }
  });
});
