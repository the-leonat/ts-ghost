# syntax=docker/dockerfile:1
# Recorder image: a shallow Ghost checkout at a pinned release tag plus the
# filtered install of the `ghost` workspace closure, modelled on Ghost's own
# docker/ghost-dev/Dockerfile. Ghost's checkout and node_modules live only inside
# the image; nothing from Ghost is installed or run on the host, and only the
# fixture output directory is bind-mounted at run time (see record.sh).
#
# The build context is this directory. Ghost's source comes from git.
ARG NODE_VERSION=22.23.3
FROM node:${NODE_VERSION}-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential python3 git ca-certificates curl default-mysql-client \
 && rm -rf /var/lib/apt/lists/*

ARG GHOST_REF=v6.72.0
WORKDIR /ghost
# Submodules = Casper + Source themes (relative URLs resolve against github.com/TryGhost).
RUN git -c advice.detachedHead=false clone --depth 1 --branch "${GHOST_REF}" \
      --recurse-submodules --shallow-submodules https://github.com/TryGhost/Ghost.git . \
 && git log -1 --format='%H %d' > /ghost/.pinned-ref

RUN corepack enable
# CI=true makes pnpm non-interactive; HUSKY=0 skips the root `prepare` git-hook install.
# node_modules must be self-contained inside the image (same as Ghost CI / ghost-dev image).
ENV CI=true \
    HUSKY=0 \
    pnpm_config_enable_global_virtual_store=false \
    pnpm_config_store_dir=/pnpm-store \
    DISABLE_V8_COMPILE_CACHE=1 \
    NX_NATIVE_COMMAND_RUNNER=false

# Prefetch pnpm itself through corepack (version from root package.json#packageManager).
RUN corepack install

# Filtered install of ghost + its workspace dependency closure (what Ghost's
# ghost-dev image and the CI archive job do). The store is a BuildKit cache mount
# so rebuilds stay warm without bloating the image.
RUN --mount=type=cache,target=/pnpm-store,id=ghost-pnpm-store \
    pnpm install --filter "ghost..." --frozen-lockfile --prefer-offline

# nx's test:e2e target dependsOn build:assets and ^build; do those once here
# rather than going through nx at run time.
RUN pnpm --filter-prod "ghost^..." -r run build \
 && pnpm --filter ghost run build:assets

WORKDIR /ghost/ghost
# DB tests read these via nconf env (see core/shared/config/env/config.testing-mysql.json).
ENV database__connection__host=mysql \
    database__connection__port=3306 \
    database__connection__user=root \
    database__connection__password=root \
    TZ=UTC

# The recorder is a file in Ghost's own e2e-api suite, so Ghost's database test
# configuration provides the port block, the template database and per-worker
# provisioning. Copied after the install layers so editing it rebuilds in seconds.
COPY ts-ghost-recorder.test.js test/e2e-api/admin/ts-ghost-recorder.test.js
ENV RECORDER_OUT=/out
CMD ["pnpm", "exec", "vitest", "run", "-c", "vitest.config.db.ts", "--project", "e2e-api", "test/e2e-api/admin/ts-ghost-recorder.test.js"]
