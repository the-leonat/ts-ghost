---
"@ts-ghost/admin-api": major
---

`settings.fetch()` accepts list-valued settings such as `all_blocked_email_domains`, which Ghost 6.72 always sends; every settings fetch used to throw a validation error. Breaking type change: a setting's `value` is now `string | number | boolean | null | string[]`.
