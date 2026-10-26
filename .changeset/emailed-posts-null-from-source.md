---
"@ts-ghost/core-api": patch
"@ts-ghost/admin-api": patch
---

A post sent as a newsletter whose email has no `from` or `source` no longer fails validation. Ghost sends both as `null` on such an email (as on Ghost's own `members:emails` seed), and because the fetchers validate with `.parse()`, one such post made the whole `posts.browse().fetch()` throw and lost every other post on the page.

**Widened output type:** `baseEmailSchema`'s `from` and `source`, and so a post's `email.from` and `email.source` in `@ts-ghost/admin-api`, are now `string | null` instead of `string`. Code that uses them as strings needs a null check.
