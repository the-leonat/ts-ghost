# @ts-ghost/ghost-conformance

Private package that checks `@ts-ghost/admin-api`'s schemas against a real Ghost. It runs the public client against the official Ghost Docker image (with MySQL 8) at a pinned version, and it keeps a manifest of every Admin API route. Nothing here is published, and the client packages don't import from it.

Every Ghost image is pinned to an exact version, and by digest, in [`ghost-versions.json`](./ghost-versions.json): the last Ghost 5 (`v5`), Ghost 6.0.0 (`v6.0`) and the pin (`pin`), which the drift job moves with its new digest. A Ghost run with `GHOST_LEG_VERSION` that isn't pinned there runs by tag alone; MySQL is pinned by digest in the compose file. The compose setup, the manifest, the drift job and the client version all read it from there ([`src/ghost/versions.ts`](./src/ghost/versions.ts)). The pin's minor is also core-api's `GHOST_LATEST` ([`ghost-latest.ts`](../ts-ghost-core-api/src/schemas/ghost-latest.ts)), the minor the client's latest target matches; a unit test keeps them equal, and the drift job moves both.

## The live suite

It checks the client's schemas, never Ghost's behaviour: a test earns its place only if a wrong output, input, include, format or error schema would fail it. It runs as one of three **legs**, chosen with `GHOST_LEG` (default `pin`), each one image with one client schema target:

| Leg    | Ghost            | Target   |
| ------ | ---------------- | -------- |
| `v5`   | the last Ghost 5 | `compat` |
| `v6.0` | 6.0.0            | `compat` |
| `pin`  | the pin          | `latest` |

Every leg uses the strict client: a key the target's schema doesn't declare fails the result with a `ResponseSchemaError` naming its path. Compat declares everything any supported Ghost sends, so a strict failure on an older Ghost is a missing line in `compat.ts`.

Per resource there are at most three tests:

- **Shape and nullability** (every leg): browse and read every seeded variant; each nullable top-level field must be null on one variant and set on another (`nullabilityGaps` in [`src/live/schema-keys.ts`](./src/live/schema-keys.ts), from the schema itself). A field no input nulls or sets sits in a short exception list with the reason. Alternate reads (slug, email) only have to parse.
- **Shape modifiers** (every leg): each `include` and `formats` entry adds its key, and a read without it doesn't.
- **Round trip** (`latest` only, `liveTest.runIf(onLatest)`): add and edit with every input, read back everything sent except deprecated inputs (`deprecatedKeys`, from `.meta({ deprecated: true })`) and a few keys Ghost never sends back, each listed with its reason. `unsentInputs` fails the test when an input schema gains a key the round trip doesn't send.

Once each ([`query-options.live.test.ts`](./src/live/query-options.live.test.ts), [`credentials.live.test.ts`](./src/live/credentials.live.test.ts)): both credentials, `fields`, filter syntax, `paginate`, and a 404 and a 401 as error results.

Seeds are bare and full records per resource, written through the client, plus a small SQL seed for what the API can't create (sent and failed emails, email recipients and suppressions, Stripe customers and subscriptions, staff users). Status variants (an inactive user, an archived tier or newsletter, a comped or paid member) are seed rows of the shape test, there because a nested schema has a null-or-set field no plain seed reaches.

`GHOST_LEG_VERSION=6.30.0` runs a leg's target against another Ghost. The client gets `{ schema: leg.target }` and the leg's Ghost as its version, `v<major>.<minor>`. Whether a Ghost has a route comes from its manifest: `manifestFor(version).has("GET /members/metafields/:namespace/")` in seeds, `requireRoute({ skip }, route)` to skip a test with the reason ([`src/live/require-route.ts`](./src/live/require-route.ts)).

## The manifest

[`manifest.json`](./manifest.json) lists every Admin API route of the pinned Ghost, one line per route; [`manifests/`](./manifests/) holds the same for the frozen legs (`ghost-5.130.6.json`, `ghost-6.0.0.json`):

```
{"method":"PUT","path":"/settings/","labs":null,"public":false,"integration":false,"staff":true,"session":true}
```

- `labs` is the labs flag that gates the route, or `null`.
- `public`, `integration`, `staff` and `session` say whether Ghost accepts the request with no credential, an integration Admin API key, the Owner's staff token or a session cookie.

`pnpm manifest [v5|v6.0|pin|<x.y.z>]` generates a Ghost's manifest (default the pin) on a fresh, throwaway Ghost; any other version lands in `manifests/` too. Ghost publishes no OpenAPI spec, so the route list is read from Ghost's router inside the container ([`src/manifest/ghost-route-reader.ts`](./src/manifest/ghost-route-reader.ts) is the only code that touches Ghost internals). Auth is probed over HTTP: each route is called once per credential with ids that don't exist and no body, and 401 or 403 counts as refused. The output is sorted, so a diff between two Ghost versions shows routes that were added, removed or re-permissioned. Responses and request bodies are not recorded.

The **client → manifest check** ([`src/client-routes/`](./src/client-routes/)) runs with the unit tests and needs no Docker. It calls every public client method against a fetch stub that records method and path, once per schema target, and checks each target's calls against its legs' manifests: compat against Ghost 5.130.6 and 6.0.0, latest against the pin. A test names the target, method, route and call; each route must exist and accept an integration key.

## Running it

```sh
pnpm --filter @ts-ghost/ghost-conformance test       # unit tests + client → manifest check (no Docker)
pnpm --filter @ts-ghost/ghost-conformance test:live  # live suite (Docker), pin leg
GHOST_LEG=v5 pnpm --filter @ts-ghost/ghost-conformance test:live  # another leg
pnpm --filter @ts-ghost/ghost-conformance test:manifest  # manifest generation test (Docker, own Ghost)
pnpm --filter @ts-ghost/ghost-conformance manifest   # regenerate manifest.json (Docker)
```

The `manifest` and `drift` scripts run TypeScript directly with Node's type stripping, so they need Node ≥ 22.18. The live suite and the manifest need a running Docker with `docker compose`. Each run starts its own compose project (Ghost plus MySQL on tmpfs) on a free local port and removes it afterwards, so runs never share state. An interrupted run removes its Ghost on exit, and each live run first removes projects left by a killed run (their names carry the owning process id).

The live suite's global setup runs Ghost's first-run setup to create the Owner, signs in, creates an integration and fetches the Owner's staff token, all through Ghost's public API, then applies the SQL seed.

The code depends one way, `ghost ← seeds ← live`: [`src/ghost/`](./src/ghost/) starts, bootstraps and pins Ghost and builds the client (`adminApi(ghost, leg, options)` in `admin-client.ts`); [`src/seeds/`](./src/seeds/) seeds a given Ghost, with its helpers in `helpers.ts`; [`src/live/`](./src/live/) holds the test run: global setup, `liveTest`, the schema helpers and the tests.

CI runs the live suite on every PR to `main`, once per leg ([`.github/workflows/conformance.yml`](../../.github/workflows/conformance.yml)). The Tests workflow adds the client's route coverage to its job summary.

## Compat sweep

The legs only see Ghost 5.130, 6.0 and the pin, but Ghost adds and removes fields between them. [`.github/workflows/conformance-sweep.yml`](../../.github/workflows/conformance-sweep.yml) runs monthly, and by hand with a list of versions: for Ghost 6.10, 6.30, 6.50, 6.60 and the minor before the pin, it generates that Ghost's manifest and runs the compat leg against it (`GHOST_LEG=v6.0 GHOST_LEG_VERSION=<version>`). A failure is a field `compat.ts` doesn't declare yet.

## Route coverage

`pnpm coverage` calls every method of the latest client, as the client → manifest check does, and counts the manifest routes the client calls, with labs-flagged routes left out. It gives two numbers: routes that accept an integration token (what the client can use today) and all routes, whatever their auth. It also tables each resource (the route's first path segment) and lists the integration-token routes the client doesn't call. The drift PR shows the same report for the pin and the new Ghost side by side.

## Drift PR

[`.github/workflows/conformance-drift.yml`](../../.github/workflows/conformance-drift.yml) runs every Monday and can be started by hand with a Ghost version, from the default branch only. There is one drift PR, from the branch `conformance/drift`. When a newer Ghost image exists, the workflow:

1. bumps the pin in `ghost-versions.json` and `GHOST_LATEST` to its minor, and regenerates the manifest,
2. runs the conformance, core-api and admin-api unit tests (with the client → manifest check) and the live suite's `pin` leg (latest) against the new Ghost; the `v5` and `v6.0` legs run on the PR's normal CI,
3. writes no schema: the reviewer updates latest (the schema modules in `packages/ts-ghost-admin-api/src/schemas/`) to what the new Ghost sends and adds a line to `schemas/compat.ts` for each field Ghost removed or retyped, so compat still parses older Ghosts; an added field gets a `minor` changeset (compat makes it optional with `partial`), a removed or retyped one a `major` changeset,
4. writes `.changeset/ghost-pin.md`, a `patch` changeset saying "Pins Ghost <minor>", replaced on each run. A pin bump alone is a patch, and each is released, so every Ghost minor has a release for `{ schema: "latest" }` users to pin to,
5. force-pushes `conformance/drift` and rewrites the PR's title and description: always from the default branch's pin to the newest Ghost, with the manifest diff, the test results, the route coverage at both versions, and links to the release notes of every version in between,
6. fails the run if the manifest, the client check or the live suite failed, so a breaking release doesn't show up as green.

Merging the PR bumps the pin. If nobody fixes it, it stays open and the next runs add the newer releases to it. The next run overwrites commits pushed to the drift branch, so fix on another branch or merge soon after. When the pin already is the newest Ghost, the run closes an open drift PR. A PR opened with the workflow's default `GITHUB_TOKEN` starts no other workflows: close and reopen it, or set a `CONFORMANCE_PR_TOKEN` secret (GitHub App or fine-grained token).

The release notes matter because the suite can't see everything, such as new query options or newly accepted inputs. If the new Ghost has a major the client doesn't support yet, the live suite doesn't run, and the PR and the job say so.

The workflow has two jobs. `drift` runs the dependencies and a fresh Ghost with a read-only token and hands its results to `pr` as an artifact; `pr` runs only `src/drift/workflow-steps.ts` with plain Node and is the only job that can push and edit PRs. The steps can be run locally with `pnpm drift <step>`.

Setup:

- **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**. Without it, the `pr` job fails with a message pointing to that setting.
- PRs opened with the workflow's `GITHUB_TOKEN` start no other workflows, so the drift PR shows no Tests or Conformance checks until someone closes and reopens it. An optional `CONFORMANCE_PR_TOKEN` secret (a GitHub App installation token or a fine-grained token with contents and pull-requests write on this repository) is used instead when set, and CI then runs on its own.
