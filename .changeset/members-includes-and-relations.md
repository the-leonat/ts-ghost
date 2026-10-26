---
"@ts-ghost/admin-api": major
"@ts-ghost/core-api": major
---

Members: includes and relations, checked against fixtures recorded from Ghost 6.72.

- `members.browse()` and `members.read()` take `.include({ tiers, email_recipients, metafields })`, the relations Ghost's members endpoint allows. A member has a typed `tiers` (the admin tier shape) and `email_recipients`, both optional on a plain read and required on the type an `.include()` returns. Ghost sends `tiers` on every read, add and edit, and on a browse only when included. An included `metafields` is kept, typed `unknown` (an object keyed by field), and stays optional on the included type, because Ghost leaves it out for a member who has none. Labels, newsletters and subscriptions are always sent and cannot be included. Member `edit` still takes no include, as Ghost's accepts none.
- A browse or read containing any member without a Gravatar, a comped or gift member, or a subscription on a Stripe price with no nickname no longer fails validation.

**Output types widen (consumer-breaking for strict code).** These now include `null`, so code that uses them as plain strings needs a null check:

- `avatar_image` is `string | null`. Ghost sends null when Gravatar is off.
- `subscriptions[].current_period_end` is `string | null`. It is null on Ghost's stand-in subscription for a comped or gift member.
- `subscriptions[].price.nickname` and `subscriptions[].price.interval` are `string | null`. Both come from Stripe, and Ghost stores them as nullable.
- `subscriptions[].customer.email` is `string | null`, as Ghost stores it.

**Output type changes.** `email_suppression.info` is now `{ reason: "spam" | "fail"; timestamp: string } | null | undefined`, the object Ghost sends, instead of `string | null | undefined`. Before this, any suppressed member failed to parse. Code that read `info` as a string must read `info.reason` instead. Members gain the optional `tiers`, `email_recipients` and `metafields` keys, and the include mask changes from empty to the three keys above. Both changes are additive.

In `@ts-ghost/core-api`, `baseMembersSchema` and `baseSubscriptionsSchema` change their nullability in the same way.
