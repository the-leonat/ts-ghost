# 1. Consume the fork from dist branches, with internal dependencies rewritten to git references

- Status: accepted
- Date: 2026-10-26
- Context: spec the-leonat/ts-ghost#1 ("Distribution", user stories 43–45), ticket #10

## Context

Downstream applications need this fork's fixes without anything being published to a package registry, and upstream's package names, versions and dependency pins must stay untouched so every change is a clean diff against upstream.

A plain git dependency on this repository does not work. The root manifest is a private workspace root with no entry point, and no major package manager installs a subdirectory of a git dependency. The built output (`dist/`) is also gitignored on the source branches.

## Decision

A workflow (`.github/workflows/dist-branches.yml`, script `scripts/dist-branches/publish.mjs`) builds each package and force-pushes its publishable contents to one orphan branch per package:

| Package                 | Branch             |
| ----------------------- | ------------------ |
| `@ts-ghost/core-api`    | `dist/core-api`    |
| `@ts-ghost/admin-api`   | `dist/admin-api`   |
| `@ts-ghost/content-api` | `dist/content-api` |

The branch root is the package. Its contents are exactly what `pnpm pack` would put in the npm tarball (manifest, `dist/`, README, LICENSE). Each push is a single parentless commit whose message names the source commit. Consumers install by git reference:

```json
"@ts-ghost/admin-api": "git+https://github.com/the-leonat/ts-ghost.git#dist/admin-api"
```

The staged manifest is rewritten at build time:

- **Internal dependencies point at their dist branch.** `@ts-ghost/core-api` in admin-api (and content-api) becomes `git+https://github.com/the-leonat/ts-ghost.git#dist/core-api`.
- `scripts` and `devDependencies` are dropped. They only work inside the monorepo, and package managers can run lifecycle scripts of git dependencies.
- Name and version are unchanged.

The source manifests are never edited. The rewrite happens only on the staged copy.

## The core-dependency trap

On the source branch, admin-api declares `"@ts-ghost/core-api": "workspace:*"`. Packing turns that into the registry version (`7.0.0`). If that version were left on the dist branch, a consumer would install the fork's admin-api together with **upstream's unpatched core-api from npm**. Most schema fixes live in core, so nothing would fail: the install looks correct, everything type-checks, and the fixes are just missing.

`pnpm dist:test` guards against this. It publishes to a throwaway bare repository over `file://`, scratch-installs admin-api from it, and asserts that the lockfile resolves core-api to the dist-branch commit and not to the registry version. With the rewrite disabled, the test fails. The workflow runs this check before every publish.

## Consequences

- **pnpm 11+ consumers must opt in to git subdependencies.** Newer pnpm refuses a git-resolved transitive dependency by default (`ERR_PNPM_EXOTIC_SUBDEP`), and declaring core-api directly as well does not help. Consumers set the following in `pnpm-workspace.yaml`. pnpm 10 (this repo's version) accepts git subdependencies without it.

  ```yaml
  blockExoticSubdeps: false
  ```

- Core is referenced by branch, not commit. A consumer's lockfile pins the commit it resolved, and `pnpm update` moves admin and core forward together. Force-pushing leaves old dist commits unreachable, so a lockfile pinned to an old commit can stop resolving once the host garbage-collects it. Consumers should update rather than hold old pins.
- The fork's version numbers are upstream's. Identify a build by its dist commit (whose message names the source commit), not by its version.
- The npm release workflow is unchanged and separate.
- Not verified: npm's git fetcher could not install from a `file://` bare repository in local testing, so the scratch check covers pnpm only. npm against the real GitHub URL is unverified.
