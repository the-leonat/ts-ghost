---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": major
---

Keys Ghost sends that the client's schema doesn't declare now pass through to the result instead of being stripped, and a new `strict` option fails on them.

- By default, an undeclared key at any depth (e.g. a field a newer Ghost adds) reaches `result.data` unchanged. TypeScript types stay as declared, and nothing errors. With `.fields()`, the declared fields you didn't select still stay out, even where Ghost ignores `fields` and sends them.
- `new TSGhostAdminAPI(url, key, version, { strict: true })` (same for `TSGhostContentAPI`) instead returns `{ success: false, errors, status, body }` with one `{ type: "ResponseSchemaError", kind: "undeclared", path: "posts[0].new_key", message }` per undeclared key. `strict: { ignore: ["posts[].new_key"] }` lets listed paths (`[]` for any index) pass through. Strict mode is off by default and doesn't depend on `NODE_ENV`.
- Code that relied on unknown keys being stripped, e.g. by spreading a result into an object sent elsewhere, now carries those keys along.
