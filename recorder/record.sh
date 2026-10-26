#!/usr/bin/env bash
# Records the admin-api fixtures from a real, seeded Ghost. Needs only Docker.
#
#   recorder/record.sh                  # pinned release (packages/ts-ghost-admin-api/fixtures/ghost-ref)
#   GHOST_REF=v6.73.0 recorder/record.sh
#   RECORDER_OUT_DIR=/tmp/recorded recorder/record.sh   # record elsewhere (the drift job)
#
# 1. Builds the recorder image: Ghost's checkout at GHOST_REF plus its install,
#    all inside the image. Nothing from Ghost is installed or run on the host.
# 2. Starts MySQL 8 from Ghost's own compose definition (its development file
#    plus its e2e tmpfs overlay), taken from that same checkout in the image.
# 3. Runs the recorder on the MySQL compose network into an empty staging
#    directory, the only host path mounted, then hands its files to the host
#    user (the container writes as root, which matters on Linux).
# 4. On success replaces the output directory with the staging directory, so a
#    fixture the recorder no longer writes is deleted rather than left stale.
#    The output defaults to packages/ts-ghost-admin-api/fixtures/ghost-<minor>.
# 5. Tears MySQL down again, also on failure.
#
# Ghost's compose file names its MySQL container `ghost-dev-mysql` and publishes
# host port 3306, so a running Ghost dev database (or any MySQL on 3306) must be
# stopped first.
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
repo="$(dirname "$here")"
fixtures="$repo/packages/ts-ghost-admin-api/fixtures"

GHOST_REF="${GHOST_REF:-$(tr -d '[:space:]' < "$fixtures/ghost-ref")}"
minor="$(printf '%s' "$GHOST_REF" | sed -E 's/^v([0-9]+\.[0-9]+)\..*$/\1/')"
if ! printf '%s' "$minor" | grep -Eq '^[0-9]+\.[0-9]+$'; then
  echo "GHOST_REF must be a release tag like v6.72.0, got: $GHOST_REF" >&2
  exit 1
fi

out="${RECORDER_OUT_DIR:-$fixtures/ghost-$minor}"
image="ts-ghost-recorder:$GHOST_REF"

docker build -t "$image" --build-arg GHOST_REF="$GHOST_REF" "$here"

# Ghost's compose file fixes the MySQL container name, so only one recording can
# run per Docker host. Refuse before installing the teardown trap: joining a
# MySQL someone else started would let either run's teardown kill the other's.
if [ -n "$(docker ps -a --quiet --filter name='^ghost-dev-mysql$')" ]; then
  echo "A ghost-dev-mysql container already exists (another recording or a Ghost dev database); stop it first" >&2
  exit 1
fi

compose_dir="$(mktemp -d)"
staging="$(mktemp -d)"
mkdir -p "$compose_dir/e2e"
cid="$(docker create "$image")"
docker cp "$cid:/ghost/compose.dev.yaml" "$compose_dir/compose.dev.yaml"
docker cp "$cid:/ghost/e2e/compose.e2e.tmpfs.yaml" "$compose_dir/e2e/compose.e2e.tmpfs.yaml"
docker rm "$cid" >/dev/null

compose=(docker compose -p ts-ghost-recorder --project-directory "$compose_dir"
  -f "$compose_dir/compose.dev.yaml" -f "$compose_dir/e2e/compose.e2e.tmpfs.yaml")
cleanup() {
  "${compose[@]}" down --volumes || true
  rm -rf "$compose_dir" "$staging"
}
trap cleanup EXIT

"${compose[@]}" up --detach --wait mysql
network="$(docker inspect ghost-dev-mysql --format '{{range $name, $_ := .NetworkSettings.Networks}}{{$name}}{{end}}')"

status=0
docker run --rm --network "$network" -e GHOST_MINOR="$minor" -v "$staging:/out" "$image" || status=$?
docker run --rm -v "$staging:/out" --entrypoint chown "$image" -R "$(id -u):$(id -g)" /out
if [ "$status" -ne 0 ]; then
  echo "Recording failed; $out left unchanged" >&2
  exit "$status"
fi

rm -rf "$out"
mkdir -p "$out"
cp -R "$staging/." "$out/"
echo "Fixtures written to $out"
