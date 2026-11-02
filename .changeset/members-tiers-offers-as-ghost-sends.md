---
"@ts-ghost/admin-api": major
---

Members, tiers and offers typed as Ghost 6 sends them.

Breaking type changes:

- `offer.tier` is nullable on every read (a retention offer has none), including `subscriptions[].offer.tier`. Before, `offers.browse()` failed once a retention offer existed (PhilDL/ts-ghost#314).
- `member.avatar_image` is nullable (null when Gravatar is off).
- `member.email_suppression.info` is `{ reason: "spam" | "fail", timestamp }` instead of a string.
- `subscriptions[].current_period_end` (null on a comped member's stand-in subscription), `customer.email`, `price.nickname` and `price.interval` are nullable.
- `tiers.browse()`/`tiers.read()` type `benefits` as `string[]`, always present: Ghost's tiers endpoint always sends them. A tier embedded in a member or post still has them optional.
- `members.add`/`members.edit` `labels` take `{ name }` only. Ghost matches labels by name: without one, Ghost 6.38 and later answers 200 and removes the member's labels, older Ghosts answer 500. Labels read from a member can be sent back; before, they went out as `{ id }` and were lost.
- A member's `uuid` and `unsubscribe_url`, and an offer's `created_at` and `last_redeemed` (`string | null`), are always sent and typed as present; on compat a member's `uuid` is `string | null` (a nullable column before Ghost 6.0).

Additions:

- Members take `.include({ tiers, email_recipients, metafields })` (`adminMembersEmailRecipientsSchema` types an email recipient), and the member schema has `tiers`, `email_recipients`, `metafields`, `attribution`, `current_subscription`, `can_comment`, `commenting`, `enable_comment_notifications` and `enable_updates_and_announcements`.
- Subscriptions have `plan`, `next_payment` (with its typed offer `discount`), `attribution`, `offer_redemptions` (the redeemed offers), trial and discount dates, and `price.tier`; tiers have `monthly_price_id`, `yearly_price_id` and `expiry_at`.
- Offers have `redemption_type` (optional on compat, since Ghost 6.14), and `offers.add` creates trial offers (`type: "trial"`, `duration: "trial"`, `amount` in days).

Deprecations (still sent as given; removed in a later major):

- The tiers `monthly_price`, `yearly_price` and `benefits` includes: Ghost always sends these fields, so the include does nothing.
- `members.add`/`members.edit` `geolocation` and `members.edit` `stripe_customer_id`: every Ghost ignores them.
