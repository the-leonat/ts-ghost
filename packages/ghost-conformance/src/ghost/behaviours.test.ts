import { describe, expect, test } from "vitest";

import { ghostHas } from "./behaviours.ts";

describe("ghostHas", () => {
  test("is true from the feature's first Ghost version on", () => {
    expect(ghostHas("retentionOffers", "6.72.0")).toBe(true);
    expect(ghostHas("retentionOffers", "6.18.0")).toBe(true);
  });

  test("is false before it, comparing minors numerically", () => {
    expect(ghostHas("retentionOffers", "6.10.0")).toBe(false);
    expect(ghostHas("retentionOffers", "6.9.0")).toBe(false);
    expect(ghostHas("retentionOffers", "5.130.6")).toBe(false);
  });
});
