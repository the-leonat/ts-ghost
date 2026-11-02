---
"@ts-ghost/admin-api": minor
---

`webhooks.edit` accepts `secret`, as Ghost does. It used to be stripped from the update, so a rotation never reached Ghost, and an edit of the secret alone threw "No data to edit".
