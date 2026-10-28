# 3. Check the clients live against pinned Ghost images, with a route manifest as the only generated artefact

- Status: accepted
- Date: 2026-10-28
- Context: spec the-leonat/ts-ghost#23, tickets #24–#43, #45; this ADR is ticket #36
- Supersedes: [ADR 0002](./0002-fixture-recorded-conformance-checks.md) (fixture-recorded conformance). ADR 0002 never reached `main`: it lived only on the branch `integration` (PR #11, closed) and is kept here as a historical record.

## Context

ADR 0002 (v1) recorded request/response fixtures inside Ghost's own e2e harness, in a 2.3 GB custom image, and checked the client offline against them. It worked but was too costly to maintain: about 1.6 MB of transcripts that had to come out byte-identical, placeholders for every volatile value, a replay server, an evidence check and a cross-check that read Ghost internals (the integration-token allowlist, controller bindings, input schemas). A drift correction meant re-recording and diffing transcripts. Each v1 fix commit also mixed a small client change with recorder and fixture changes, so none of them could go upstream (PhilDL/ts-ghost) as a reviewable PR.

## Decision

### Only the manifest is generated

`packages/ghost-conformance` (private, own scripts and workflows, imports the clients only through their public exports) generates one artefact per matrix leg: a **manifest** of every Admin API route with its method, labs flag and whether it accepts no credential, an integration key, the Owner's staff token and a session cookie (`manifest.json` for the pin, `manifests/ghost-<version>.json` for the frozen legs). The route list is read from Ghost's router inside the official image, confined to `src/manifest/ghost-router.ts`; auth is probed over HTTP on a throwaway instance (401/403 = refused). Responses and request bodies are never recorded. Query parameters, input schemas, controllers and per-role permissions are deliberately not in the manifest.

A static **client → manifest check** calls every public client method against a recording fetch stub, once per schema target, and asserts each route exists in that target's manifest and accepts an integration key. It runs with the unit tests, without Docker.

### A live suite with three rules

The live suite runs the public admin client (and the content client, #41/#45) against the official Ghost image plus MySQL 8, bootstrapped through Ghost's public API. Data is seeded through the client; a small SQL seed covers only what the API can't write (emails, recipients, suppressions, Stripe customers and subscriptions). Every test follows:

- **Unknown keys**: the suite builds the client in strict mode, so any undeclared key at any depth fails the result with a `ResponseSchemaError` naming its path. Deliberately unmodelled keys are ignored per describe (`liveTest.override({ ignore })`).
- **Read-back**: every add and edit is read back and compared with what was sent, which catches inputs Ghost drops silently.
- **Null and non-null**: every nullable or optional field is seeded both ways, and every typed relation is non-empty.

Nothing asserts byte-exact responses, ids or timestamps.

### Expected-failure markers are the fix list

The harness runs against the client as upstream ships it. Every disagreement is marked, each with a one-line reason: `test.fails`, `// @ts-expect-error`, pending keys (`src/live/pending-keys.ts`) and `EXPECTED_FAILURES` in the client → manifest check. A marker turns red once its cause is fixed, so removing markers proves each fix. The same markers specify pending resources in the incremental process.

### Client contract changes that ride on the fix PR

- **Error results instead of throws** (#35, #38): a response that doesn't match the schema returns `{ success: false }` with a `ResponseSchemaError`; a Ghost change no longer crashes consumers.
- **Pass-through plus strict** (#39): by default undeclared keys pass through at runtime (types stay as declared); `strict: true | { ignore }` is an explicit constructor option that fails on them. The live suite uses strict.
- **Three schema targets** (#43): `"v5.x"` selects v5 (exactly Ghost 5.last), `"v6.x"` selects v6-compat (required = present in every 6.x), `{ schema: "latest" }` selects v6-latest (exactly the pin). Presence and nullability are separate axes. `GHOST_FIELDS` records each field's `since`/`until` minor. Resource-level targets (hiding a getter on older Ghost) are deferred until the first post-6.0 resource; the drift job only records `resource.<group>` entries for now. The live suite runs one leg per target, each pinned to an exact image in `ghost-versions.json`.

### Drift is one rolling PR

A weekly workflow bumps the pin to the newest Ghost, regenerates the manifest, runs the client check and the live suite, updates `GHOST_FIELDS`, and force-pushes one rolling PR from `conformance/drift`. The PR carries the manifest diff, the results, the client's route coverage at the old and new pin and links to every release note in between (for what the suite can't see, such as new query options). It fails visibly if anything fails, accumulates releases while unmerged and closes itself when the pin is current. This replaces v1's drift job and re-recording.

### Coverage grows incrementally

There is no ledger. `docs/agents/incremental-coverage.md` tells an agent to compare the manifest with the client (the route-coverage report lists uncovered integration-token routes), add a resource's seed and expected-failure live tests first, then implement it with the composer pattern and remove the markers. Uploads, archives, CSV, YAML and OAuth-redirect routes are out of scope.

### Branch model

- Fork `main` = `upstream/main` plus only fork-only commits (agent docs, dist branches, ADRs). v1's fixes are not carried over.
- Upstream PR 1, the harness (PhilDL/ts-ghost#323, branch `harness`): the conformance package, manifests and workflows, every inconsistency marked.
- Upstream PR 2, the fixes (branch `fixes`, #25), stacked on the harness: client and schema fixes (including the ports of v1's fixes) that remove the markers, released as a major.
- Then one upstream PR per newly covered resource (labels #9, comments, …), and the content-api port (#45).
- Nothing is opened on upstream without the fork owner.

## Consequences

- Live runs need Docker; only the unit tests and the client → manifest check run offline.
- Some v1 checks have no live equivalent by design (input-schema and include cross-checks against Ghost internals, byte-exact responses). The full mapping and accepted gaps are in [0003-appendix-v1-coverage.md](./0003-appendix-v1-coverage.md).
- Once that appendix's gaps are accepted, the `integration` branch and v1's topic branches can be deleted; this ADR and ADR 0002 keep the reasoning.
