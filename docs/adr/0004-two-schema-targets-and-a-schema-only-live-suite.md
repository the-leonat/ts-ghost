# 4. Two schema targets, compat derived from latest, and a live suite that checks only schemas

- Status: accepted
- Date: 2026-11-01
- Context: spec the-leonat/ts-ghost#23, #46, #52; review of fork PRs #53–#55
- Supersedes, in [ADR 0003](./0003-live-conformance-suite.md): "Three schema targets", the live suite's rules, "Expected-failure markers are the fix list" and the branch model

## Context

ADR 0003 (after #52) had three targets: frozen v5-compat and v6-compat, and v6-latest for the pin. Checking that against Ghost's source at release tags showed:

- Ghost removes response fields inside a major: users' `gift_subscription_purchase_notification` (6.28–6.38) and `gift_subscription_redemption_notification` (6.28 only), email recipients' `email` (gone from 6.38), members' `custom_fields` (6.53–6.61). A frozen "safe for every 6.x" schema is a promise Ghost breaks at a minor, and fixing it means a breaking edit to the frozen target anyway.
- Ghost 5.130 and 6.0 send and accept the same shapes for every resource the client covers. A separate v5 target buys nothing.
- Shared input schemas plus stripping "dropped" inputs (#14) stopped sending `mobiledoc`, which every Ghost honours.
- The live suite had grown into testing Ghost's behaviour (scheduling, validation, persistence), which Ghost tests itself.

## Decision

### Two targets, selected by an option

| Target   | Selected by            | Promise                                                                                                 |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `compat` | default                | parses what every supported Ghost sends (5.130 up to the pin); exported schemas and types default to it |
| `latest` | `{ schema: "latest" }` | exactly what the pinned Ghost sends: narrow types, the editable schema modules                          |

The version string names the Ghost you run and is sent as `Accept-Version`; it never selects types. Matching it against the pin made every pin bump widen a `"v<pin>"` user's types under a minor release, and a non-literal version lost every field that differs between the targets.

The installed package release decides which Ghost `latest` is: each release pins one Ghost, and its changelog says which. A `latest` user on an older Ghost stays on the release that pinned it, so `latest` means pinning the exact package version. A `latest` client on another Ghost only warns, once per process per Ghost minor; throwing would break every `latest` user on every pin bump. A field that Ghost added and their Ghost lacks is an error result.

Releases: a pin bump alone is a `patch`, and each is released, so every Ghost minor has a release to pin to. A field Ghost added is a `minor`; a field it removed or retyped, or a raised lower bound, is a `major`.

`compat` is derived from `latest` in one file, `schemas/compat.ts`, with plain zod (`partial`, `extend`): one line per difference, commented with the Ghost versions (`// since 6.13`, `// 6.28–6.38`). The file is the history; there is no since/until table. A type test per resource asserts that `latest`'s output is assignable to `compat`'s.

`compat` promises runtime safety on every supported Ghost, not stable types: when Ghost removes or retypes a field, `latest` needs a major release and `compat` changes in the same one. Raising compat's oldest Ghost (5.130) is also a major.

### Inputs are shared and sent as given

One input schema per resource, the union of what any supported Ghost honours. The client sends everything the caller passes; nothing is stripped. Inputs every Ghost drops (posts' body `newsletter`, members' `geolocation`, edit's `stripe_customer_id`) are `@deprecated` and removed in a later major; `mobiledoc` and `locale` are ordinary inputs. Ghost drops unknown input keys (ajv `removeAdditional`, or the model's permitted attributes), except settings, which rejects them.

### Every resource on every target

A resource or route only newer Ghosts have is marked `@since` and answers an older Ghost with a 404 error result. Labels (#9) exist with the same shape on 5.130, 6.0 and the pin.

### The live suite checks only the client's schemas

It never checks Ghost's business logic. Legs: `v5` (5.130.6) and `v6.0` (6.0.0) on `compat`, `pin` on `latest`; every leg uses the strict client, so an undeclared key fails the result. Per resource, at most three tests:

- **Shape and nullability** (every leg): read every seeded variant; each nullable field is null on a bare seed and set on a full one; alternate reads (slug, email) must parse.
- **Shape modifiers** (every leg): each `include`/`formats`/`fields` entry adds its key, and leaving it out doesn't.
- **Round trip** (`latest` only): add and edit with every input, read back everything sent except deprecated inputs.

Plus, once each: both credentials, `paginate`, filter syntax, and a 404 and a 401 as error results. A monthly, hand-triggerable compat sweep runs the `compat` leg over intermediate Ghost minors, so "every 6.x" rests on evidence.

### Order of the upstream PRs

PR 0 (client plumbing), then PR A (schemas), then PR B (conformance) based on PR A. PR B carries no expected-failure markers.

## Consequences

- Drift edits the `latest` modules and adds one `compat.ts` line per removal or retype; the drift PR runs only the pin leg, and the `v5`/`v6.0` legs run on its normal CI.
- Removed: selecting a target by the version string (`TargetOf`, `schemaTarget`), the frozen v5-compat and v6-compat files, the `pin-compat` leg, `ghostAtLeast`, `requireStrict`, the undeclared-key and response-recording helpers, and the expected-failure machinery.
- A newly accepted input stays invisible to the suite (the manifest has no bodies); release notes cover it.
