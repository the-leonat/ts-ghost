import { describe, expect, test } from "vitest";

import { ghostLeg, type SchemaTarget } from "../ghost/pin.ts";
import { manifestFor } from "../manifest/manifests.ts";
import { recordClientCalls } from "./client-calls.ts";
import { checkCall } from "./route-check.ts";

declare module "vitest" {
  interface TaskMeta {
    /** The client resource a call belongs to; the drift PR body lists them. */
    clientResource?: string;
    /** The request it sends, params erased; the coverage report counts the routes these hit. */
    clientCall?: { method: string; path: string };
  }
}

/** Each target's client against its leg's manifest; v6-latest's against the pin's, which the drift job moves. */
const CHECKS: { target: SchemaTarget; leg: "v5" | "v6.0" | "pin" }[] = [
  { target: "v5", leg: "v5" },
  { target: "v6-compat", leg: "v6.0" },
  { target: "v6-latest", leg: "pin" },
];

/** Client calls known to fail against a target's Ghost, with why. */
const EXPECTED_FAILURES: Record<SchemaTarget, Record<string, string>> = {
  v5: {},
  "v6-compat": {},
  "v6-latest": {},
};

for (const { target, leg } of CHECKS) {
  const { manifest } = manifestFor(ghostLeg(leg).ghost);
  const calls = await recordClientCalls(target);

  describe(`${target} client against the Ghost ${manifest.ghost} manifest`, () => {
    for (const call of calls) {
      const route = `${target}: ${call.method} ${call.path} (${call.name})`;
      const reason = EXPECTED_FAILURES[target][call.name];
      (reason ? test.fails : test)(
        `${route}${reason ? `, expected failure: ${reason}` : ""}`,
        ({ task }) => {
          // Coverage counts the pin's calls once.
          if (leg === "pin") {
            task.meta.clientResource = call.name.split(".")[0];
            task.meta.clientCall = { method: call.method, path: call.path };
          }
          expect(checkCall(manifest.routes, call)).toBeUndefined();
        },
      );
    }
  });
}
