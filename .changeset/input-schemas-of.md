---
"@ts-ghost/core-api": minor
---

`inputSchemasOf(resource)` returns the request-body schemas behind a resource built with `APIComposer.access()`: the schema `add` parses with and the one `edit` parses with (the update schema, or the create schema made partial), for the operations the resource exposes. Additive; nothing else changes.
