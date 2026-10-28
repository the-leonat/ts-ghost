import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { MANIFEST_FILE, parseManifest } from "../manifest/manifest.ts";
import { recordClientCalls } from "./client-calls.ts";
import { checkCall } from "./route-check.ts";

const manifest = parseManifest(readFileSync(MANIFEST_FILE, "utf8"));
const calls = await recordClientCalls();

/** Client calls known to fail against the pinned Ghost, with why; fixed in #25. */
const EXPECTED_FAILURES: Record<string, string> = {
  "newsletters.read({slug})": "Ghost has no read-newsletter-by-slug route",
};

/** Deprecated client calls kept callable although Ghost lacks their route, with why. */
const DEPRECATED: Record<string, string> = {
  "offers.read({slug})": "Ghost has no read-offer-by-slug route",
  "tiers.read({slug})": "Ghost has no read-tier-by-slug route",
};

describe(`admin-api client against the Ghost ${manifest.ghost} manifest`, () => {
  for (const call of calls) {
    if (DEPRECATED[call.name]) {
      test(`${call.name}: ${call.method} ${call.path} (deprecated: ${DEPRECATED[call.name]})`, () => {
        expect(checkCall(manifest.routes, call)).toBeDefined();
      });
      continue;
    }
    const reason = EXPECTED_FAILURES[call.name];
    const title = `${call.name}: ${call.method} ${call.path}${reason ? ` (expected failure: ${reason})` : ""}`;
    (reason ? test.fails : test)(title, () => {
      expect(checkCall(manifest.routes, call)).toBeUndefined();
    });
  }
});
