---
"@ts-ghost/core-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/content-api": patch
---

Posts, pages, users and newsletters gain the fields Ghost 6 sends, and inputs Ghost ignores are deprecated:

- `formats({ html, plaintext, ... })` no longer fails on a post or page with no content, which Ghost sends without that format. The missing format parses as empty: `""` in the Admin API, `null` in the Content API.
- Users and authors: `bluesky`, `instagram`, `linkedin`, `mastodon`, `threads`, `tiktok`, `youtube`, `donation_notifications`, `gift_subscription_notifications` and `recommendation_notifications`.
- A post's email: `post_id`, `newsletter_id`, `source_type`, `track_clicks`, `feedback_enabled` and `csd_email_count`.
- Newsletters and a post's newsletter (new `adminNewsletterSchema`): their design settings (`background_color`, `button_*`, `link_*`, `title_font_weight`...) and `feedback_enabled` and `show_*` flags.
- Pages: `show_title_and_feature_image`.
- `newsletters.add` no longer requires `sender_name`.
- Deprecated: `newsletters.read({ slug })` (Ghost has no such route, so it always fails; use `read({ id })`), the `mobiledoc` input of posts and pages (Ghost 6 stores lexical only), their `locale` input (Ghost has none), and the `newsletter` key in a post's body, which Ghost ignores and the client no longer sends; pass `posts.edit`'s `newsletter` option instead.

The new fields are optional, so older Ghost versions still parse.
