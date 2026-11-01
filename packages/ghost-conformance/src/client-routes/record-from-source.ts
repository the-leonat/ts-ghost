// Records the client's calls from plain Node: Vite loads the client from src, as the tests do, not dist.

import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import type { SchemaTarget } from "../ghost/versions.ts";
import type { ClientCall } from "./route-check.ts";

const PACKAGE_DIR = fileURLToPath(new URL("../..", import.meta.url));

/** Loads a module with Vite, as the tests do; `files` are the source files it ran. */
export async function importFromSource<T>(file: URL): Promise<{ module: T; files: string[] }> {
  const { module, dependencies } = await runnerImport<T>(fileURLToPath(file), {
    configFile: false,
    root: PACKAGE_DIR,
    logLevel: "error",
    plugins: [tsconfigPaths()],
    // runnerImport externalizes bare imports to Node, which picks a package's dist; inline ours so paths map to src.
    environments: { inline: { resolve: { noExternal: [/^@ts-ghost\//] } } },
  });
  return { module, files: dependencies };
}

/** recordClientCalls for plain-Node scripts: Vite loads the client from source, as the tests do, not a stale dist. */
export async function recordSourceClientCalls(target: SchemaTarget): Promise<ClientCall[]> {
  const { module } = await importFromSource<typeof import("./record-calls.ts")>(
    new URL("./record-calls.ts", import.meta.url),
  );
  return module.recordClientCalls(target);
}
