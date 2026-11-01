# @ts-ghost/ghost-conformance

Private package that checks `@ts-ghost/admin-api`'s schemas against a real Ghost. It runs the public client against the official Ghost Docker image (with MySQL 8) at a pinned version, and it keeps a manifest of every Admin API route. Nothing here is published, and the client packages don't import from it.

Every Ghost image is pinned to an exact version, and by digest, in [`ghost-versions.json`](./ghost-versions.json): the last Ghost 5 (`v5`), Ghost 6.0.0 (`v6.0`) and the pin (`pin`). A Ghost run with `GHOST_LEG_VERSION` that isn't pinned there runs by tag alone; MySQL is pinned by digest in the compose file. The compose setup, the manifest and the client version all read it from there ([`src/ghost/versions.ts`](./src/ghost/versions.ts)). The pin's minor is also core-api's `GHOST_LATEST` ([`ghost-latest.ts`](../ts-ghost-core-api/src/schemas/ghost-latest.ts)), the minor the client's latest target matches; a unit test keeps them equal.

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
pnpm --filter @ts-ghost/ghost-conformance test:manifest  # manifest generation test (Docker, own Ghost)
pnpm --filter @ts-ghost/ghost-conformance manifest   # regenerate manifest.json (Docker)
```

The `manifest` script runs TypeScript directly with Node's type stripping, so it needs Node ≥ 22.18. The manifest needs a running Docker with `docker compose`. Each run starts its own compose project (Ghost plus MySQL on tmpfs) on a free local port and removes it afterwards, so runs never share state. An interrupted run removes its Ghost on exit, and each run first removes projects left by a killed run (their names carry the owning process id).

The Tests workflow adds the client's route coverage to its job summary.

## Route coverage

`pnpm coverage` calls every method of the latest client, as the client → manifest check does, and counts the manifest routes the client calls, with labs-flagged routes left out. It gives two numbers: routes that accept an integration token (what the client can use today) and all routes, whatever their auth. It also tables each resource (the route's first path segment) and lists the integration-token routes the client doesn't call.
