// Checks that plain-Node recording matches the tests' and loads the workspace packages from src.

import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

import { recordClientCalls } from "./record-calls.ts";
import { importFromSource, recordSourceClientCalls } from "./record-from-source.ts";

const PACKAGES = fileURLToPath(new URL("../../..", import.meta.url));

test("a plain-Node script records the same calls from the client's source", async () => {
  expect(await recordSourceClientCalls("latest")).toEqual(await recordClientCalls("latest"));
});

test("the workspace packages load from src, even when a (stale) dist exists", async () => {
  const { files } = await importFromSource(new URL("./record-calls.ts", import.meta.url));
  expect(files).toContain(`${PACKAGES}ts-ghost-admin-api/src/index.ts`);
  expect(files).toContain(`${PACKAGES}ts-ghost-core-api/src/index.ts`);
});
