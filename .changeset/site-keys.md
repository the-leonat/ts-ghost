---
"@ts-ghost/core-api": minor
"@ts-ghost/admin-api": minor
---

`site.fetch()` keeps the keys Ghost 6.72 sends that the schema used to strip: `icon`, `cover_image` and `accent_color` (nullable), and `locale`, `timezone`, `site_uuid` and `allow_external_signup`. All are optional, so older Ghost versions still parse.
