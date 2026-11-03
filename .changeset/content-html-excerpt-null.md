---
"@ts-ghost/content-api": major
---

Posts' and pages' `html` and `excerpt` are what Ghost sends instead of an invented `""`.

- Breaking: `excerpt` is `string | null`: Ghost sends null on a post without content.
- Breaking: `html` is `string | null | undefined`: null on a post without content, and absent when `formats()` names only other formats. With `.formats({ html: true })` it is `string | null`.
- A value of the wrong type in either field is now an error result; it used to parse as `""`.
