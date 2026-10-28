import { describe, expect, test } from "vitest";

import { ghostVersions } from "../ghost/pin.ts";
import { manifestFor } from "./manifests.ts";

describe("manifestFor", () => {
  test("answers whether a pinned Ghost has a route", () => {
    const { v5, "v6.0": v60, pin } = ghostVersions();
    expect(manifestFor(pin).has("POST /members/metafields/:namespace/")).toBe(true);
    expect(manifestFor(v60).has("POST /members/metafields/:namespace/")).toBe(false);
    expect(manifestFor(v5).has("GET /posts/")).toBe(true);
    expect(manifestFor(pin).manifest.ghost).toBe(pin);
  });

  test("refuses a Ghost without a committed manifest, naming the command", () => {
    expect(() => manifestFor("6.30.0")).toThrow(/No manifest for Ghost 6\.30\.0.*pnpm manifest/);
  });
});
