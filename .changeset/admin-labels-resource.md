---
"@ts-ghost/admin-api": minor
"@ts-ghost/core-api": minor
---

Add the `labels` resource to the admin client: `browse`, `read` by `id` or `slug`, `add`, `edit` and `delete`, with the `count.members` include. Checked against fixtures recorded from Ghost 6.72; the label schemas (`adminLabelsSchema`, `adminLabelsCreateSchema`, `adminLabelsUpdateSchema`) are exported. `@ts-ghost/core-api` adds `"labels"` to `APIResource`.
