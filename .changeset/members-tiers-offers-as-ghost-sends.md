---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
---

Members, tiers and offers typed as Ghost 6 sends them.

Breaking type changes:

- `offer.tier` is nullable on every read (a retention offer has none), including `subscriptions[].offer.tier`.
- `member.avatar_image` is nullable (null when Gravatar is off).
- `member.email_suppression.info` is `{ reason: "spam" | "fail", timestamp }` instead of a string.
- `subscriptions[].current_period_end` (null on a comped member's stand-in subscription), `customer.email`, `price.nickname` and `price.interval` are nullable.

Additions:

- Members take `.include({ tiers, email_recipients, metafields })`, and the member schema has `tiers`, `email_recipients`, `metafields`, `uuid`, `attribution`, `current_subscription`, `unsubscribe_url`, `can_comment`, `commenting`, `enable_comment_notifications` and `enable_updates_and_announcements`.
- Subscriptions have `plan`, `next_payment`, `attribution`, `offer_redemptions`, trial and discount dates, and `price.tier`; tiers have `monthly_price_id`, `yearly_price_id` and `expiry_at`.
- Offers have `redemption_type`, `created_at` and `last_redeemed`, and `offers.add` creates trial offers (`type: "trial"`, `duration: "trial"`, `amount` in days).
- core-api: `ignoredInclude()` (an include key accepted but never sent) and `sparseInclude()` (an include that doesn't make its key required); `baseSubscriptionsSchema` and `baseAttributionSchema` are exported.

Deprecations (still callable):

- The tiers `monthly_price`, `yearly_price` and `benefits` includes: Ghost always sends them, so the client no longer sends the include.
- `tiers.read({ slug })` and `offers.read({ slug })`: Ghost has no such route and answers 404. Read by `id`.
- `members.add`/`members.edit` `geolocation` and `members.edit` `stripe_customer_id`: Ghost drops them, so the client no longer sends them.
