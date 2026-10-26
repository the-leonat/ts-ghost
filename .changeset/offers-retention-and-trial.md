---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
---

Offers: retention offers read without a validation error, and trial offers can be created. Checked against offers recorded from Ghost 6.72.

- `offers.read` and `offers.browse` accept a retention offer. Ghost sends it with `tier: null`, which used to fail validation, so a browse that held one failed outright.
- The offer read type gains `redemption_type` (`"signup" | "retention"`), `created_at` and `last_redeemed` (`string | null`). Ghost always sends them; they used to be stripped.
- `offers.add` accepts a trial offer: `type: "trial"`, `duration: "trial"`, `amount` is the trial length in days, and `tier` is required as on every signup offer. A trial offer with another duration, or a percent/fixed offer with a `"trial"` duration, is rejected before any request.

**Output-type change:** `tier` on `baseOffersSchema` (and so on `members` `subscriptions[].offer`) is now `{ id, name? } | null` instead of always an object. Code that reads `offer.tier.id` without a null check stops compiling under `strictNullChecks`; use `offer.tier?.id`, or check `offer.redemption_type === "signup"` first (a signup offer always has a tier). Anyone constructing an offer value against the schema type must now also supply `redemption_type`, `created_at` and `last_redeemed`.
