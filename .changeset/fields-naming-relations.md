---
"@ts-ghost/core-api": patch
"@ts-ghost/content-api": patch
"@ts-ghost/admin-api": patch
---

`.fields()` can select relations: `authors`, `tags` and `tiers` are sent as `include` instead of failing with Ghost's 400, and `primary_author` and `primary_tag` bring their relation.

`.include({ authors: true })` makes `primary_author` required and `.include({ tags: true })` makes `primary_tag` required (still nullable). On the Content API `primary_author` is no longer nullable.
