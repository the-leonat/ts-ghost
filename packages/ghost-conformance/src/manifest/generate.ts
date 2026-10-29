import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { adminApiUrl } from "../ghost/admin-api.ts";
import { bootstrapGhost } from "../ghost/bootstrap.ts";
import { startGhost, type GhostInstance } from "../ghost/instance.ts";
import { ghostVersions, type GhostVersions } from "../ghost/pin.ts";
import { OUTPUT_MARKER, type RouteDefinition } from "./ghost-router.ts";
import { buildManifest, serialiseManifest, type Manifest } from "./manifest.ts";
import { manifestFile } from "./manifests.ts";
import { probeRoutes } from "./probe.ts";

const ROUTE_READER = fileURLToPath(new URL("./ghost-router.ts", import.meta.url));

/**
 * Generates the manifest on a throwaway Ghost. Probing with a session reaches the database wipe and the
 * key reset, so it refuses any Ghost that has already been set up (seeded or shared).
 */
export async function generateManifest(ghost: GhostInstance): Promise<Manifest> {
  await assertFresh(ghost.url);
  const definitions = await readRouteDefinitions(ghost);
  const credentials = await bootstrapGhost(ghost.url);
  return buildManifest(ghost.version, await probeRoutes(ghost.url, definitions, credentials, ghost.version));
}

async function assertFresh(url: string) {
  const response = await fetch(`${adminApiUrl(url)}/authentication/setup/`);
  const body = (await response.json()) as { setup?: { status: boolean }[] };
  if (body.setup?.[0]?.status !== false)
    throw new Error(
      `Ghost at ${url} is already set up; the manifest is only generated on a fresh throwaway Ghost`,
    );
}

async function readRouteDefinitions(ghost: GhostInstance): Promise<RouteDefinition[]> {
  // Copied as plain JS: Ghost 5 images run Node 20, which can't strip types.
  const dir = await mkdtemp(join(tmpdir(), "ts-ghost-router-"));
  const reader = join(dir, "ts-ghost-router.mjs");
  const target = "/tmp/ts-ghost-router.mjs";
  try {
    await writeFile(reader, stripTypeScriptTypes(await readFile(ROUTE_READER, "utf8")));
    await ghost.compose("cp", reader, `ghost:${target}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  const { stdout } = await ghost.compose("exec", "-T", "ghost", "node", target);
  const line = stdout.split("\n").find((l) => l.startsWith(OUTPUT_MARKER));
  if (!line) throw new Error(`The route reader printed no routes:\n${stdout}`);
  return JSON.parse(line.slice(OUTPUT_MARKER.length)) as RouteDefinition[];
}

/**
 * CLI `pnpm manifest [v5|v6.0|pin]`: starts a fresh Ghost of that pinned image (default the pin), generates its
 * manifest, writes it to the repo (manifestFile), removes the Ghost.
 */
async function main() {
  const image = (process.argv[2] ?? "pin") as keyof GhostVersions;
  const versions = ghostVersions();
  if (!(image in versions))
    throw new Error(`Unknown image "${image}"; use one of ${Object.keys(versions).join(", ")}`);
  const file = manifestFile(image);
  const ghost = await startGhost({ name: "ts-ghost-manifest", version: versions[image] });
  try {
    const manifest = await generateManifest(ghost);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, serialiseManifest(manifest));
    console.log(`Wrote ${manifest.routes.length} routes for Ghost ${manifest.ghost} to ${file}`);
  } finally {
    await ghost.stop();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
