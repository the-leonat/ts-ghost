---
"@ts-ghost/admin-api": patch
---

Schema fixes found by checking the client against responses recorded from Ghost 6.72:

- `webhooks.edit` accepts `secret`, as Ghost does. It used to be stripped from the update, so a rotation never reached Ghost (an update of the secret alone threw "No data to edit").
- `users` accepts every user status Ghost has (`inactive` and `warn-1` to `warn-4` as well as `active` and `locked`). A browse that included an inactive user failed validation.
- `settings.fetch()` accepts list-valued settings such as `all_blocked_email_domains`, which Ghost 6.72 always sends; every settings fetch threw a validation error.
- `newsletters.add` no longer requires `sender_name`; Ghost creates a newsletter without one.
