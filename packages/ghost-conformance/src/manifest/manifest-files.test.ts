// Checks manifestFor: route lookup on a pinned Ghost, and the error for a Ghost without a manifest.

import { describe, expect, test } from "vitest";

import { ghostVersions } from "../ghost/versions.ts";
import { manifestFor } from "./manifest-files.ts";

describe("manifestFor", () => {
  test("answers whether a pinned Ghost has a route", () => {
    const { v5, "v6.0": v60, pin } = ghostVersions();
    expect(manifestFor(pin).has("POST /members/metafields/:namespace/")).toBe(true);
    expect(manifestFor(v60).has("POST /members/metafields/:namespace/")).toBe(false);
    expect(manifestFor(v5).has("GET /posts/")).toBe(true);
    expect(manifestFor(pin).manifest.ghost).toBe(pin);
  });

  test("refuses a Ghost without a manifest, naming the command that generates it", () => {
    expect(() => manifestFor("6.30.0")).toThrow(/No manifest for Ghost 6\.30\.0.*pnpm manifest 6\.30\.0/);
  });
});
