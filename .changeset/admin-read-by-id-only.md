---
"@ts-ghost/admin-api": major
---

Removed `read({ slug })` on tiers, offers and newsletters: Ghost has no such routes, so these calls always returned 404. Read them with `read({ id })`.
