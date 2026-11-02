---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
---

The admin client has two schema targets, chosen by the `schema` option:

| Option                 | Target   | Types                                                                                             |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| none, the default      | `compat` | parses what every supported Ghost (5.130 up to the pin) sends: fields not in all of them optional |
| `{ schema: "latest" }` | `latest` | exactly what Ghost 6.72, this release's pin, sends                                                |

- **The version string selects no types**: it names the Ghost you run and is sent as `Accept-Version`. Pass your Ghost's version, literal or from config, and you get `compat`. A `schema` known only at runtime (a `SchemaTarget` variable) is typed `compat`.
- **`latest` means pinning the exact package version.** Each release pins one Ghost minor (`GHOST_LATEST`, today `"6.72"`); its changelog says "Pins Ghost 6.72". Install the release for your Ghost without a version range and upgrade it with Ghost. On another Ghost, a field that Ghost lacks is an error result.
- **Releases**: a pin bump alone is a patch, and each is released, so every Ghost minor has a release to pin to. A field Ghost added is a minor; a field it removed or retyped, or a raised lower bound (compat's oldest Ghost, 5.130), is a major. `compat` promises runtime safety, not stable types: it changes in the same major.
- **A `latest` client warns** (`console.warn`) when Ghost's `content-version` names another minor than the pin, once per process for each such minor; it never fails a request.
- **Types per target**: `Post<T>`, `Page<T>`, `Member<T>`, `Author<T>`, `User<T>` and `Newsletter<T>` take a target (default `"compat"`), and `adminSchemas[target]` holds the runtime schemas. The exported `adminPostsSchema`, `adminMembersSchema`, … keep their names and are the `compat` ones, so they never move with the pin; `latest`'s are only in `adminSchemas.latest`.
- **Inputs are sent as given**: both targets take the same inputs, and the client sends everything you pass, `mobiledoc` and `locale` included (every supported Ghost renders `mobiledoc`; it stores `locale` but never returns it). Inputs every Ghost ignores are `@deprecated`, still sent, and go in a later major: a post's body `newsletter`, members' `geolocation`, edit's `stripe_customer_id` and the tiers price and benefit includes.
- **Strict mode is for tests**: `strict` is a testing and drift tool, not for production. A response that violates the schema (a required field missing, `null` where it isn't nullable) is always an error result, strict or not.

core-api: `SchemaTarget`, `ClientVersion` and `GHOST_LATEST`. admin-api also exports them.
