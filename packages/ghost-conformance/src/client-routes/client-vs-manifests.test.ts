// The client → manifest check: each target's calls must be routes of its legs' manifests that take an
// integration key.

import { describe, expect, test } from "vitest";

import { ghostLeg, type SchemaTarget } from "../ghost/versions.ts";
import { manifestFor } from "../manifest/manifest-files.ts";
import { recordClientCalls } from "./record-calls.ts";
import { checkCall } from "./route-check.ts";

/** Each target's client against its leg's manifest; latest's against the pin's, which the drift job moves. */
const CHECKS: { target: SchemaTarget; leg: "v5" | "v6.0" | "pin" }[] = [
  { target: "compat", leg: "v5" },
  { target: "compat", leg: "v6.0" },
  { target: "latest", leg: "pin" },
];

for (const { target, leg } of CHECKS) {
  const { manifest } = manifestFor(ghostLeg(leg).ghost);
  const calls = await recordClientCalls(target);
  // [title, call] pairs, so the title reads unquoted.
  const cases = calls.map((c) => [`${target}: ${c.method} ${c.path} (${c.name})`, c] as const);

  describe(`${target} client against the Ghost ${manifest.ghost} manifest`, () => {
    test.for(cases)("%s", ([, call]) => {
      expect(checkCall(manifest.routes, call)).toBeUndefined();
    });
  });
}
