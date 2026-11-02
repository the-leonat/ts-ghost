---
"@ts-ghost/core-api": minor
---

Fetcher and composer fixes the admin client builds on:

- `formats()` parses a requested format Ghost omits (it leaves out a format a post has no content for) as the field's empty value: its own default, else `null`, else `""`. Before, such a post failed the whole result.
- An include key whose schema has `.meta({ omittedWhenEmpty: true })` isn't made required on the output, since Ghost leaves it out of a record that has none.
