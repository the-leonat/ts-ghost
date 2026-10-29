---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
---

`site.fetch()` types the keys Ghost 6 sends that the schema used to strip: `icon`, `cover_image` and `accent_color` (`string | null`), `locale`, `site_uuid` and `allow_external_signup` (always sent by Ghost 6), and `timezone` (optional: Ghost 6.0 lacks it). Breaking: a site without `locale`, `site_uuid` or `allow_external_signup` (Ghost before 6) now fails with a `ResponseSchemaError`.
