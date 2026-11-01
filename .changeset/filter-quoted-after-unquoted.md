---
"@ts-ghost/core-api": patch
"@ts-ghost/admin-api": patch
---

`browse({ filter })` now type-checks a quoted value after an unquoted clause, such as `email:[a@x.com,b@x.com]+name:'x'` or `status:draft+title:'Hello'`, and a quoted value holding a separator followed by more clauses, such as `email:'a+b@x.com',status:free`. Unknown fields are still rejected.
