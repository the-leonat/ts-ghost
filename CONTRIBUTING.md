# Contributing

Thank you for thinking about contributing! `ts-ghost` is a small project that wants to grow and improve. We are always looking for new contributors to help us make it better. This document will help you get started.

## Development workflow

We use [pnpm](https://pnpm.io) as our package manager, so make sure to [install](https://pnpm.io/installation) it first.

```bash
git clone git@github.com:PhilDL/ts-ghost.git
cd ts-ghost
pnpm i
pnpm build
```

### Commands

This is a monorepo powered by turborepo, so you can run commands in the root directory and it will run the command in all packages.

```bash
# From the project root directory
pnpm build
```

This will build all the packages.

### Testing

During your developement you may want to keep the tests running in watch mode.

```bash
# From the project root directory
pnpm test:watch
# If you want to test a specific package
pnpm test:watch --filter @ts-ghost/core-api
```

### Conformance suite against a real Ghost in Docker

`packages/ghost-conformance` checks `@ts-ghost/admin-api` and `@ts-ghost/content-api` against the official Ghost Docker image at a pinned version. It needs Docker and no credentials; see its [README](./packages/ghost-conformance/README.md).

```bash
pnpm --filter @ts-ghost/ghost-conformance test:live
# Manifest generation test, on a throwaway Ghost of its own
pnpm --filter @ts-ghost/ghost-conformance test:manifest
```

### Linting, typecheck

```bash
# Eslint
pnpm lint
# Typecheck typescript
pnpm typecheck
```

### Running `validate` to lint, typecheck and tests

```bash
# From the project root directory
pnpm validate
```

### Documentation

```bash
cd www/ && pnpm dev
```

## Project overview

This project is a monorepo of packages with well-defined purposes. It is composed of an app "ghost-blog-buster", and several API Client packages.

- The `ghost-blog-buster` CLI is located in the `apps` directory.
- Client API Packages are located in the `packages` directory.
- `packages/ghost-conformance` is a private test package: the admin-api and content-api clients against a real Ghost in Docker.

### `@ts-ghost/ghost-blog-buster`

TODO: write description and help for this package.

### `@ts-ghost/content-api`

TODO: write description and help for this package.

### `@ts-ghost/admin-api`

TODO: write description and help for this package.

### `@ts-ghost/core-api`

TODO: write description and help for this package.
