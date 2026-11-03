---
"@ts-ghost/content-api": minor
---

Declares the keys Ghost sends, so they are typed and pass strict mode.

- Posts and pages: `uuid`, `frontmatter`; pages: `show_title_and_feature_image`.
- Authors, also on a post or page: `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `linkedin`.
- Settings: `locale`, the members, portal and email keys, `labs`, `site_uuid`, `version`, and optionally the social accounts (since Ghost 6.36), `transistor_portal_*` (since 6.19) and `portal_*_gift_promotion` (since 6.60).
