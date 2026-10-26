import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { describeClient } from "./client-claims";
import { crossCheck, loadRouteSpec } from "./cross-check";

const api = new TSGhostAdminAPI(
  "https://ghost.org",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v6.72",
);
const { failures, uncovered } = crossCheck(describeClient(api), loadRouteSpec("ghost-6.72"));

/**
 * Claims the client makes that Ghost does not back, kept here as assertions
 * that they currently fail. Fixing one deletes its entry and its test.
 */
const KNOWN_DEFECTS = {
  // Ghost's tiers controller takes no `include` option at all and sends prices
  // and benefits unasked; the query parameter is dropped. Removing these keys
  // would stop `.include({ monthly_price: true })` compiling for consumers, so
  // it is left for a decision of its own.
  tiersIncludes: (["browse", "read"] as const).flatMap((method) =>
    ["monthly_price", "yearly_price", "benefits"].map(
      (key) => `tiers.${method}() offers include "${key}", but Ghost's tiers.${method} allows no includes`,
    ),
  ),
};

describe("route-spec cross-check: admin client against Ghost 6.72", () => {
  test("every claim the client makes is registered by Ghost, apart from the known defects", () => {
    const known = Object.values(KNOWN_DEFECTS).flat();
    expect(failures.filter((failure) => !known.includes(failure))).toEqual([]);
  });

  test("known defect: tiers offer includes, but Ghost's tiers endpoint declares none", () => {
    expect(failures).toEqual(expect.arrayContaining(KNOWN_DEFECTS.tiersIncludes));
  });

  test("resources the client does not cover are reported, not failed", () => {
    expect(uncovered).toContain("labels");
    expect(uncovered).not.toContain("posts");
  });
});
