---
"@ts-ghost/admin-api": minor
---

Webhook schemas accept what Ghost's webhooks input schema accepts:

- `event` takes any lowercase string of up to 50 characters on `add`/`edit`, not only the 33 known events. Its type is the new `GhostWebhookEvent`: the known events (`GhostWebhookEventTypes`, still exported, so editors still autocomplete them) or any other string.
- `target_url` takes any URI reference of up to 2000 characters, relative ones included, instead of an absolute URL.

**Output types widen.** A returned webhook's `event` is now `GhostWebhookEvent` instead of the closed union, and its `target_url` is any string, so a webhook Ghost stored with another event or a relative target no longer fails to parse. Code that switches exhaustively over `event`, or relies on `target_url` being absolute, needs a default branch.
