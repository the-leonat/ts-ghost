---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": minor
---

Posts, pages and newsletters as Ghost 6 sends them, and one deprecation for the inputs Ghost drops.

- `formats()` no longer fails on a post or page Ghost sends without a requested format (it omits a format the post has no content for). The missing format parses as its empty value: admin-api posts and pages give `html: ""`, `plaintext: ""`, `lexical` an empty Lexical document and `mobiledoc: null`; content-api posts and pages give `plaintext: null` (`html` already parsed as `""`). Before, such a post failed the whole result.
- admin-api posts and pages: an `.include()` now always asks for `authors` too. An explicit include replaces Ghost's default `authors,tags`, so `.include({ tags: true })` lost the required `authors` and `primary_author` and failed (PhilDL/ts-ghost#320).
- Newsletters and a post's newsletter (new `adminNewsletterSchema`) have their design settings (`background_color`, `button_*`, `link_*`, `title_font_weight`...), `feedback_enabled` and the `show_*` flags; `show_share_button` is optional (Ghost 6.0 lacks it), the rest are always sent by Ghost 6.
- Pages have `show_title_and_feature_image`.
- `newsletters.add` no longer requires `sender_name`.
- Deprecated and no longer sent, though still accepted so existing calls compile: the `mobiledoc` input of posts and pages (Ghost 6 stores lexical only), their `locale` input (Ghost has none), and the `newsletter` key in a post's body (Ghost ignores it; pass `posts.edit`'s `newsletter` option).
- Breaking: `posts.add`/`posts.edit` no longer reject an `email_only` scheduled post without a body `newsletter`. Ghost decides: `posts.add` can't schedule an email-only post (Ghost answers 422), and `posts.edit(id, data, { newsletter })` schedules or sends it.
- Deprecated: `newsletters.read({ slug })` (Ghost has no such route, so it always fails; use `read({ id })`).
