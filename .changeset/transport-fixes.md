---
"@ts-ghost/core-api": minor
"@ts-ghost/admin-api": minor
"@ts-ghost/content-api": minor
---

Transport fixes, all additive:

- Headers passed in request options are merged with the generated ones (`Authorization`, `Accept-Version`, `Content-Type`) instead of replacing them, so adding a header no longer drops authentication. A caller header replaces a generated header of the same name.
- Default request options can be set once at construction: `HTTPClientOptions.defaultRequestOptions`, and `{ defaultRequestOptions: { redirect: "manual" } }` as the fourth argument of `TSGhostAdminAPI` and `TSGhostContentAPI`. They apply to every request, including the admin client's `add`, `edit` and `delete`, which take no per-call options. Per-call options win over them.
- Failed results keep the HTTP status and now also carry `body`, the response body as received, so a non-JSON error from a proxy can be diagnosed. A `delete` that gets a non-JSON error now reports its real status instead of `0`.
- `fetchRawResponse` (used by `delete`) builds a fresh URL per call instead of extending the client's base URL, so a second call on the same client no longer hits a wrong path.
