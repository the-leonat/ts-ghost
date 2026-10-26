---
"@ts-ghost/admin-api": patch
---

`tiers.read`, `offers.read` and `newsletters.read` now accept only `{ id }`. Ghost's Admin API registers no by-slug route for these three resources, so `read({ slug })` built a `/slug/<value>/` path that always answered 404. Such calls now fail to compile instead of failing at runtime; replace them with `read({ id })`, or `browse({ filter: "slug:<value>" })` to look one up by slug.
