---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": major
"@ts-ghost/ghost-blog-buster": patch
---

A response that doesn't match the client's schema now returns an error result instead of throwing a `ZodError`.

- `fetch()`, `paginate()` and `submit()` (browse, read, add, edit, delete, site, settings) return `{ success: false, errors, status, body? }` when Ghost's response doesn't fit the schema. Each mismatch is one error item `{ type: "ResponseSchemaError", message }`, and the message names the failing path in Ghost's terms, e.g. `Response does not match the schema at posts[0].title: Invalid input: expected string, received null`.
- A Ghost error body whose items lack `type` or `message` also returns an error result with `ResponseSchemaError` items, and the raw `body` is kept.
- Public result types are unchanged. Code that caught a `ZodError` from a fetch should check `success === false` and `errors[].type === "ResponseSchemaError"` instead. Invalid inputs (browse params, identity, add/edit data) still throw as before.
- ghost-blog-buster: exports that page through posts or members now stop with an error when a page fails, instead of silently writing a partial export.
