---
"@ts-ghost/core-api": minor
"@ts-ghost/admin-api": minor
---

Transport fixes, all additive:

- Headers passed in request options are merged with the generated ones (`Authorization`, `Accept-Version`, `Content-Type`) instead of replacing them, so adding a header no longer drops authentication. A caller header replaces a generated header of the same name.
- Default request options can be set once at construction: `HTTPClientOptions.defaultRequestOptions`, and `new TSGhostAdminAPI(url, key, version, { defaultRequestOptions: { redirect: "manual" } })`. They apply to every request, including `add`, `edit` and `delete`, which take no per-call options. Per-call options win over them.
- Failed results keep the HTTP status and now also carry `body`, the response body as received, so a non-JSON error from a proxy can be diagnosed. A `delete` that gets a non-JSON error now reports its real status instead of `0`.
- The server's reported version (its `content-version` header) is available after a response: `HTTPClientFactory.serverVersion`, `HTTPClient.serverVersion` and `TSGhostAdminAPI.getServerVersion()`. Nothing depends on it.
