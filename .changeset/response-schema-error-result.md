---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
"@ts-ghost/content-api": major
"@ts-ghost/ghost-blog-buster": patch
---

A response that doesn't match the client's schema now returns an error result instead of throwing a `ZodError`.

- `fetch()`, `paginate()` and `submit()` (browse, read, add, edit, delete, site, settings) return `{ success: false, errors, status, body? }` when Ghost's response doesn't fit the schema. Each mismatch is one error item `{ type: "ResponseSchemaError", message }`, and the message names the failing path in Ghost's terms, e.g. `Response does not match the schema at posts[0].title: Invalid input: expected string, received null`.
- A malformed Ghost error body keeps its well-formed items (string `type` and `message`); each other item becomes a `ResponseSchemaError` whose message carries the item, e.g. `... at errors[1]: {"code":"WEIRD"}`. An `errors` value that isn't a list becomes one such item.
- Result types: every error result gains `body?: string`, the response body as received. Code that caught a `ZodError` from a fetch should check `success === false` and `errors[].type === "ResponseSchemaError"` instead. Invalid inputs (browse params, identity, add/edit data) still throw as before.
- ghost-blog-buster, behaviour change: an export that pages through posts or members now stops with an error naming the failed page's errors, where it used to skip the page and write a partial export without a warning.
