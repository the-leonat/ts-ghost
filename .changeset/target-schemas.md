---
"@ts-ghost/admin-api": major
---

Each schema target has its own response schemas (`adminSchemas.compat`, `adminSchemas.latest`):

- **latest** is exactly what Ghost 6.72 sends: every field it sends required, ones it dropped left out (a recipient's `email`, a member's `custom_fields`, a staff user's `gift_subscription_purchase_notification` and `gift_subscription_redemption_notification`).
- **compat** is derived from it in one file, `schemas/compat.ts`, one line per difference with the Ghost versions in a comment: every field any supported Ghost (5.130 to 6.72) sends, those not in all of them optional, e.g. `newsletter.show_share_button?: boolean` (since 6.23), a member's `can_comment?` (since 6.16), a recipient's `email?` (until 6.37), and a member's `uuid: string | null` (a nullable column before 6.0).
- **Exports**: every exported response schema (`adminPostsSchema`, `adminMembersSchema`, `adminTiersSchema`, …) is the `compat` one; `latest`'s are only in `adminSchemas.latest`.

Breaking type changes. Presence follows what Ghost 5.130 to 6.72 send (checked live against 5.130.6, 6.0.0 and 6.72.0); a field is non-null only where Ghost guarantees it (a `nullable: false` column in its schema, or its serializer always fills it):

- Present now, as Ghost always sends them: a post's or page's `updated_at`, `excerpt`, `primary_tag` (all `| null`) and `primary_author`; a post's `email_segment` and `frontmatter` (`| null`); a tag's `created_at` and `updated_at` (`| null`); a member's `updated_at` (`| null`), `comped`, `email_suppression`; a newsletter's `title_alignment`, `updated_at`, `description`, `sender_*`, `header_image`, `footer_content` (`| null`); an offer's `display_title`, `display_description`, `currency_restriction`, `redemption_count` (non-null: the offer serializer fills them); a subscription's `plan`, `price.tier` (`tier_id: string | null`), `tier` and `offer` (`| null`); an email's `error` (`| null`); a webhook's `api_version`, `integration_id`, `updated_at` (`| null`); a staff user's `url`, `email`, `created_at` and notification flags.
- Removed (never sent): a page's `email_subject` and `count.clicks`, a webhook's `status`.
- Optional with the reason in their description: fields only some reads carry, e.g. a post's `email`, `newsletter`, `count` (default includes) and `mobiledoc` (default formats), a member's `attribution` (not on browse), a comped member's stand-in subscription dates, an offer's `tier.name` (not in add's response).
- Added on compat: an email recipient's `email` (Ghost before 6.38), a staff user's `gift_subscription_purchase_notification` (6.28–6.38) and `gift_subscription_redemption_notification` (6.28), a member's `custom_fields` (6.53–6.61).
