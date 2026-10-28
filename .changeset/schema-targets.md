---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": major
---

Three schema targets, picked by the version you pass: `"v5.x"` parses as the last Ghost 5 (`v5`), `"v6.x"` as any Ghost 6 (`v6-compat`, the default), and `"v6.x"` with `{ schema: "latest" }` as Ghost 6.72 (`v6-latest`). Types and runtime schemas follow the target, and strict mode checks against it (#43).

- **Presence and nullability are separate.** Optional (`?`) means some Ghost version leaves the field out; nullable means Ghost sends `null`. v6-compat makes fields Ghost added after 6.0 (or removed since) optional; v6-latest requires every field 6.72 sends and drops removed ones; v5 has no Ghost 6 field. When each field appeared or went is in core-api's `GHOST_FIELDS` (`since`/`until`), maintained by the drift job.
- **Targets differ in response types only.** Every target keeps the deprecated forms as `@deprecated`: read-by-slug on newsletters, tiers and offers, and the inputs Ghost drops (`locale`, `mobiledoc`, a post's body `newsletter`, members' `geolocation`, edit's `stripe_customer_id`, the tiers price and benefit includes), which are never sent.
- **A v6-latest client warns once** (`console.warn`) when Ghost's `content-version` names another minor than 6.72; it never fails a request.
- **Types per target**: `Post<T>`, `Page<T>`, `Member<T>`, `Author<T>`, `User<T>` and `Newsletter<T>` take a target (default `"v6-compat"`); `adminPostsSchemaFor(target)` and the other `*SchemaFor` factories, and `adminResponseSchemas(target)`, give the runtime schemas. The existing `adminPostsSchema`, `baseOffersSchema`, … are the v6-compat ones.

Breaking type changes. Presence follows what Ghost 5.130 to 6.72 send (checked live against 5.130.6, 6.0.0 and 6.72.0); a field is non-null only where Ghost guarantees it (a `nullable: false` column in its schema, or its serializer always fills it):

- Present now, as Ghost always sends them: a post's or page's `updated_at`, `excerpt`, `primary_tag` (all `| null`) and `primary_author`; a post's `email_segment` and `frontmatter` (`| null`); a tag's `created_at` and `updated_at` (`| null`); a member's `updated_at` (`| null`), `comped`, `email_suppression`; a newsletter's `title_alignment`, `updated_at`, `description`, `sender_*`, `header_image`, `footer_content` (`| null`); an offer's `display_title`, `display_description`, `currency_restriction`, `redemption_count` (non-null: the offer serializer fills them); a subscription's `plan`, `price.tier` (`tier_id: string | null`), `tier` and `offer` (`| null`); an email's `error` (`| null`); a webhook's `api_version`, `integration_id`, `updated_at` (`| null`); a staff user's `url`, `email`, `created_at` and notification flags.
- Removed (never sent): a page's `email_subject` and `count.clicks`, a webhook's `status`.
- Optional with the reason in their description: fields only some reads carry, e.g. a post's `email`, `newsletter`, `count` (default includes) and `mobiledoc` (default formats), a member's `attribution` (not on browse), a comped member's stand-in subscription dates, an offer's `tier.name` (not in add's response).
- Added: an email recipient's `email` (Ghost before 6.38), a staff user's `gift_subscription_purchase_notification` (6.28–6.38) and `gift_subscription_redemption_notification` (6.28), a member's `custom_fields` (6.53–6.61).

core-api: `HTTPClientOptions.onResponse` sees every response before it is read.
