import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { describeClient } from "./client-claims";
import { crossCheck, loadRouteSpec } from "./cross-check";
import { PINNED_GHOST } from "./fixture-server";

const api = new TSGhostAdminAPI(
  "https://ghost.org",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v6.72",
);
const { failures, uncovered, inputGaps, inputsUncovered, legacyClaims } = crossCheck(
  describeClient(api),
  loadRouteSpec(PINNED_GHOST.fixtureDir),
);

/**
 * Include keys the client accepts only so legacy calls keep compiling, and
 * never sends. Each is a deliberate, documented decision; any other include
 * Ghost does not allow is sent, and fails the cross-check.
 */
const LEGACY_CLAIMS = [
  // Ghost's tiers controller takes no `include` option at all and sends prices
  // and benefits unasked (#12). The keys are deprecated: removing them would
  // stop `.include({ monthly_price: true })` compiling for consumers.
  ...(["browse", "read"] as const).flatMap((method) =>
    ["monthly_price", "yearly_price", "benefits"].map(
      (key) => `tiers.${method}() accepts include "${key}" but does not send it`,
    ),
  ),
];

/**
 * Claims the client makes that Ghost does not back, kept here as assertions
 * that they currently fail. Fixing one deletes its entry and its test.
 */
const KNOWN_DEFECTS = {
  // Ghost takes the newsletter as the `newsletter` query option (which `edit()`
  // also offers), not as a body key: its posts schemas do not declare it, and
  // Ghost's validator strips undeclared keys. The body key also backs the
  // email-only refinement; removing it would stop `{ newsletter: { id } }`
  // compiling for consumers.
  postsBodyNewsletter: (["add", "edit"] as const).map(
    (op) =>
      `posts.${op}() accepts "newsletter", which Ghost's posts-${op} schema does not declare (Ghost drops it)`,
  ),
  // Ghost's members schemas do not declare `geolocation` (Ghost derives it from
  // the sign-up IP itself), and members-edit does not declare
  // `stripe_customer_id`, so neither ever reaches Ghost. Removing them from the
  // body types would stop existing calls that pass them compiling.
  membersBodyKeys: [
    `members.add() accepts "geolocation", which Ghost's members-add schema does not declare (Ghost drops it)`,
    `members.edit() accepts "geolocation", which Ghost's members-edit schema does not declare (Ghost drops it)`,
    `members.edit() accepts "stripe_customer_id", which Ghost's members-edit schema does not declare (Ghost drops it)`,
  ],
};

describe(`route-spec cross-check: admin client against pinned Ghost ${PINNED_GHOST.ref}`, () => {
  test("every claim the client makes is registered by Ghost, apart from the known defects", () => {
    const known = Object.values(KNOWN_DEFECTS).flat();
    expect(failures.filter((failure) => !known.includes(failure))).toEqual([]);
  });

  test("the only includes the client accepts without sending are the documented legacy claims", () => {
    expect(legacyClaims).toEqual(LEGACY_CLAIMS);
  });

  test("tiers send no include, so no tiers include fails", () => {
    expect(failures.filter((failure) => failure.startsWith("tiers."))).toEqual([]);
  });

  test("known defect: posts send the newsletter in the body, where Ghost's posts schemas do not declare it", () => {
    expect(failures).toEqual(expect.arrayContaining(KNOWN_DEFECTS.postsBodyNewsletter));
  });

  test("known defect: members bodies carry keys Ghost's members schemas do not declare", () => {
    expect(failures).toEqual(expect.arrayContaining(KNOWN_DEFECTS.membersBodyKeys));
  });

  test("webhook bodies model every key Ghost's webhooks input schemas accept", () => {
    expect(inputGaps.filter((gap) => gap.startsWith("webhooks.") && gap.includes("does not model"))).toEqual(
      [],
    );
  });

  test("keys Ghost's input schemas accept that the client does not model are reported, not failed", () => {
    expect(inputGaps).toContain(
      'members.add() does not model "can_comment", which Ghost\'s members-add schema accepts',
    );
  });

  test("resources Ghost has no input schema for are reported as not covered", () => {
    expect(inputsUncovered).toEqual(["newsletters", "offers", "settings", "site", "users"]);
  });

  test("resources the client does not cover are reported, not failed", () => {
    expect(uncovered).toContain("actions");
    expect(uncovered).not.toContain("posts");
  });

  test("labels are covered, and their member-count include is one Ghost's labels endpoint allows", () => {
    expect(uncovered).not.toContain("labels");
    expect(describeClient(api).find((claim) => claim.resource === "labels")).toMatchObject({
      resource: "labels",
      operations: ["browse", "read", "add", "edit", "delete"],
      identities: ["id", "slug"],
      includes: ["count.members"],
    });
    expect(failures.filter((failure) => failure.startsWith("labels."))).toEqual([]);
  });

  test("label bodies are checked against Ghost's labels input schemas and model every key they accept", () => {
    expect(inputsUncovered).not.toContain("labels");
    expect(inputGaps.filter((gap) => gap.startsWith("labels.") && gap.includes("does not model"))).toEqual(
      [],
    );
  });
});
