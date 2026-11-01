---
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": minor
---

Posts, pages and newsletters as Ghost 6 sends them, and one deprecated input.

- `formats()` no longer fails on a post or page Ghost sends without a requested format (it omits a format the post has no content for). The missing format parses as its empty value: admin-api posts and pages give `html: ""`, `plaintext: ""`, `lexical` an empty Lexical document and `mobiledoc: null`; content-api posts and pages give `plaintext: null` (`html` already parsed as `""`). Before, such a post failed the whole result.
- admin-api posts and pages: an `.include()` now always asks for `authors` too. An explicit include replaces Ghost's default `authors,tags`, so `.include({ tags: true })` lost the required `authors` and `primary_author` and failed (PhilDL/ts-ghost#320).
- Newsletters and a post's newsletter (new `adminNewsletterSchema`) have their design settings (`background_color`, `button_*`, `link_*`, `title_font_weight`...), `feedback_enabled` and the `show_*` flags; `show_share_button` is optional on compat (since Ghost 6.23), the rest are always sent by Ghost 6.
- Pages have `show_title_and_feature_image`.
- `newsletters.add` no longer requires `sender_name`.
- Inputs are sent as given: `mobiledoc` (every supported Ghost honours it; since 6.51 it converts it to lexical) and `locale` (stored, never returned) are ordinary inputs of posts and pages, and `mobiledoc` is sent again. The `newsletter` key in a post's body is `@deprecated`: Ghost ignores it, so pass `posts.edit`'s `newsletter` option; it is still sent and goes in a later major.
- Breaking: `posts.add`/`posts.edit` no longer reject an `email_only` scheduled post without a body `newsletter`. Ghost decides: `posts.add` can't schedule an email-only post (Ghost answers 422), and `posts.edit(id, data, { newsletter })` schedules or sends it.
