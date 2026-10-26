---
"@ts-ghost/admin-api": patch
"@ts-ghost/core-api": patch
---

Deprecate the `monthly_price`, `yearly_price` and `benefits` include keys on admin `tiers.browse()` and `tiers.read()`. Ghost's tiers endpoint takes no `include` option and always sends a tier's prices and benefits, so these keys never did anything. They still compile, but are marked `@deprecated` and are no longer sent as an `include` query parameter; you can drop them from your calls.

The tiers output type now matches what Ghost sends without any include: `benefits` is always a `string[]`, and `monthly_price`/`yearly_price` are `number | null` (`null` for the free tier, which Ghost sends without prices). The exported `adminTiersSchema` is unchanged.

`@ts-ghost/core-api` adds `ignoredInclude()`: an include key the fetchers accept but never send.
