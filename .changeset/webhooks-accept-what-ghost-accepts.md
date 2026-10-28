---
"@ts-ghost/admin-api": major
---

Webhooks accept and parse any event and target Ghost accepts. `event` is any lowercase string of up to 50 characters, typed `GhostWebhookEvent` (the known events, still autocompleted, or any other string), on add, edit and reads; `target_url` is any URI reference of up to 2000 characters, relative ones included. Before, a stored webhook with another event or a relative target failed to parse. Breaking type change: a webhook's `event` widens from the known events to `GhostWebhookEvent`.
