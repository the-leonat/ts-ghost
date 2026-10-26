#!/usr/bin/env bash
# Records the admin-api fixtures from a real, seeded Ghost. Needs only Docker.
#
#   recorder/record.sh                  # pinned release
#   GHOST_REF=v6.73.0 recorder/record.sh
#
# 1. Builds the recorder image: Ghost's checkout at GHOST_REF plus its install,
#    all inside the image. Nothing from Ghost is installed or run on the host.
# 2. Starts MySQL 8 from Ghost's own compose definition (its development file
#    plus its e2e tmpfs overlay), taken from that same checkout in the image.
# 3. Runs the recorder on the MySQL compose network. Only the fixture output
#    directory, packages/ts-ghost-admin-api/fixtures/ghost-<minor>, is mounted.
# 4. Tears MySQL down again, also on failure.
#
# Ghost's compose file names its MySQL container `ghost-dev-mysql` and publishes
# host port 3306, so a running Ghost dev database (or any MySQL on 3306) must be
# stopped first.
set -euo pipefail

GHOST_REF="${GHOST_REF:-v6.72.0}"
minor="$(printf '%s' "$GHOST_REF" | sed -E 's/^v([0-9]+\.[0-9]+)\..*$/\1/')"
if ! printf '%s' "$minor" | grep -Eq '^[0-9]+\.[0-9]+$'; then
  echo "GHOST_REF must be a release tag like v6.72.0, got: $GHOST_REF" >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(dirname "$here")"
out="$repo/packages/ts-ghost-admin-api/fixtures/ghost-$minor"
image="ts-ghost-recorder:$GHOST_REF"

docker build -t "$image" --build-arg GHOST_REF="$GHOST_REF" "$here"

compose_dir="$(mktemp -d)"
mkdir -p "$compose_dir/e2e"
cid="$(docker create "$image")"
docker cp "$cid:/ghost/compose.dev.yaml" "$compose_dir/compose.dev.yaml"
docker cp "$cid:/ghost/e2e/compose.e2e.tmpfs.yaml" "$compose_dir/e2e/compose.e2e.tmpfs.yaml"
docker rm "$cid" >/dev/null

compose=(docker compose -p ts-ghost-recorder --project-directory "$compose_dir"
  -f "$compose_dir/compose.dev.yaml" -f "$compose_dir/e2e/compose.e2e.tmpfs.yaml")
cleanup() {
  "${compose[@]}" down --volumes || true
  rm -rf "$compose_dir"
}
trap cleanup EXIT

"${compose[@]}" up --detach --wait mysql
network="$(docker inspect ghost-dev-mysql --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{end}}')"

mkdir -p "$out"
docker run --rm --network "$network" -e GHOST_MINOR="$minor" -v "$out:/out" "$image"
echo "Fixtures written to $out"
