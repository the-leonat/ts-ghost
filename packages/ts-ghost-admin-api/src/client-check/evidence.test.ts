import { describe, expect, test } from "vitest";
import { z } from "zod";
import { baseNewsletterSchema, baseOffersSchema, baseSiteSchema, baseTagsSchema } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "../admin-api";
import { adminLabelsSchema } from "../schemas/labels";
import { adminMembersSchema } from "../schemas/members";
import { adminPagesSchema } from "../schemas/pages";
import { adminPostsSchema } from "../schemas/posts";
import { adminTiersSchema } from "../schemas/tiers";
import { adminUsersSchema } from "../schemas/users";
import { adminWebhookSchema } from "../schemas/webhooks";
import { describeClient } from "./client-claims";
import { emptyReads, keyMismatches, unbackedFields, unfilledIncludes } from "./evidence";
import { loadFixtures, PINNED_GHOST, type Fixture } from "./fixture-server";
import { ADMIN_KEY } from "./harness";

const fixture = (method: string, path: string, status: number, body: unknown): Fixture => ({
  request: { method, path: `/ghost/api/admin/${path}`, query: {} },
  response: { status, headers: {}, body },
});

describe("evidence guards", () => {
  test("an empty collection in a recorded read is flagged; refusals and not-found are not reads", () => {
    const fixtures = [
      fixture("GET", "tags/", 200, { tags: [] }),
      fixture("GET", "posts/", 200, { posts: [{ id: "1" }] }),
      fixture("GET", "posts/0/", 404, { errors: [{ type: "NotFoundError" }] }),
      fixture("PUT", "users/0/", 403, { errors: [{ type: "NoPermissionError" }] }),
      fixture("GET", "labels/", 200, { labels: [] }),
    ];

    expect(emptyReads(fixtures, ["tags", "posts", "users"])).toEqual(["GET /ghost/api/admin/tags/"]);
  });

  test("an included relation no record of a recorded read fills is flagged, dotted ones too", () => {
    const included = (path: string, include: string, body: unknown): Fixture => ({
      ...fixture("GET", path, 200, body),
      request: { method: "GET", path: `/ghost/api/admin/${path}`, query: { include } },
    });
    const fixtures = [
      included("members/", "email_recipients,tiers", {
        members: [
          { email_recipients: [], tiers: [{ id: "1" }] },
          { email_recipients: [{ id: "2" }], tiers: [] },
        ],
      }),
      included("members/", "metafields", { members: [{ metafields: [] }, { metafields: null }] }),
      included("tags/", "count.posts", { tags: [{ count: { posts: 0 } }] }),
      included("labels/", "count.members", { labels: [{ count: {} }] }),
      fixture("GET", "posts/", 200, { posts: [{ tags: [] }] }),
    ];

    expect(unfilledIncludes(fixtures)).toEqual([
      "GET /ghost/api/admin/members/?include=metafields: metafields",
      "GET /ghost/api/admin/labels/?include=count.members: count.members",
    ]);
  });

  test("a modelled field no successful fixture fills is reported, nested and in arrays too", () => {
    const schema = z.object({
      id: z.string(),
      note: z.string().nullish(),
      tags: z.array(z.object({ name: z.string(), color: z.string().nullable() })).optional(),
      meta: z.object({ a: z.string().nullable() }).nullable(),
    });
    const fixtures = [
      fixture("GET", "posts/", 200, {
        posts: [{ id: "1", note: null, tags: [{ name: "n", color: null }] }],
      }),
      fixture("POST", "posts/", 201, { posts: [{ id: "2", meta: { a: null } }] }),
      fixture("GET", "posts/0/", 404, { errors: [], posts: [{ note: "from an error, not evidence" }] }),
    ];

    expect(unbackedFields(fixtures, { posts: schema })).toEqual({
      posts: ["note", "tags[].color", "meta.a"],
    });
  });
});

describe("key check", () => {
  const schema = z.object({
    id: z.string(),
    note: z.string().nullish(),
    tags: z.array(z.object({ name: z.string(), color: z.string().nullable() })).optional(),
    meta: z.object({ a: z.string() }).nullable(),
    data: z.unknown().optional(),
  });

  test("a key a fixture sends that the schema does not model fails, at any depth", () => {
    const fixtures = [
      fixture("GET", "posts/", 200, {
        posts: [{ id: "1", meta: null, extra: 1, tags: [{ name: "n", color: null, hue: 2 }] }],
      }),
      fixture("POST", "posts/", 201, { posts: [{ id: "2", meta: { a: "x", b: 3 }, data: { free: 1 } }] }),
      fixture("GET", "posts/0/", 404, { errors: [{ type: "NotFoundError", context: 1 }] }),
    ];

    expect(keyMismatches(fixtures, { posts: schema })).toEqual([
      'posts: "extra" is sent but not modelled',
      'posts: "tags[].hue" is sent but not modelled',
      'posts: "meta.b" is sent but not modelled',
    ]);
  });

  test("a required key a fixture omits fails, unless the request selected fields", () => {
    const fixtures = [
      fixture("GET", "posts/", 200, { posts: [{ meta: { a: "x" }, tags: [{ name: "n" }] }] }),
      {
        ...fixture("GET", "posts/", 200, { posts: [{ id: "1" }] }),
        request: { method: "GET", path: "/ghost/api/admin/posts/", query: { fields: "id" } },
      },
    ];

    expect(keyMismatches(fixtures, { posts: schema })).toEqual([
      'posts: "id" is required but not sent',
      'posts: "tags[].color" is required but not sent',
    ]);
  });

  test("a union value is checked against the option it parses as", () => {
    const union = z.object({
      offer: z.union([z.object({ type: z.literal("a"), x: z.string() }), z.object({ type: z.literal("b") })]),
    });
    const fixtures = [fixture("GET", "x/", 200, { x: [{ offer: { type: "b" } }, { offer: { type: "a", x: "s", y: 1 } }] })];

    expect(keyMismatches(fixtures, { x: union })).toEqual(['x: "offer.y" is sent but not modelled']);
  });
});

describe(`evidence in the fixtures recorded from pinned Ghost ${PINNED_GHOST.ref}`, () => {
  const fixtures = loadFixtures(PINNED_GHOST.fixtureDir);
  const modelled = describeClient(new TSGhostAdminAPI("https://ghost.org", ADMIN_KEY, "v6.72")).map(
    (claim) => claim.resource,
  );

  test("every recorded read of a resource the client models has at least one record", () => {
    expect(emptyReads(fixtures, modelled)).toEqual([]);
  });

  // Known gaps, each a relation Ghost sends empty for every seeded record: no
  // seed gives a member metafields, and tiers.browse has no include option, so
  // `benefits` comes back only as the tiers have them (none of the seeded do).
  test("every included relation is filled by some record, apart from the known gaps", () => {
    expect(unfilledIncludes(fixtures)).toEqual([
      "GET /ghost/api/admin/members/?include=metafields&order=email+asc: metafields",
      "GET /ghost/api/admin/tiers/?include=monthly_price%2Cyearly_price%2Cbenefits&order=slug+asc: benefits",
    ]);
  });

  // The schema each resource's records are parsed with, as `TSGhostAdminAPI` builds it.
  const RESPONSE_SCHEMAS = {
    posts: adminPostsSchema,
    pages: adminPagesSchema,
    tags: baseTagsSchema,
    labels: adminLabelsSchema,
    newsletters: baseNewsletterSchema,
    users: adminUsersSchema,
    webhooks: adminWebhookSchema,
    site: baseSiteSchema,
    members: adminMembersSchema,
    tiers: adminTiersSchema.required({ benefits: true }),
    offers: baseOffersSchema,
    settings: z.object({ key: z.string(), value: z.unknown() }),
  };

  test("every key a fixture sends is modelled, and every required key is sent", () => {
    expect(keyMismatches(fixtures, RESPONSE_SCHEMAS)).toEqual([]);
  });

  test("modelled fields no fixture fills are reported, never failed", () => {
    const report = unbackedFields(fixtures, { ...RESPONSE_SCHEMAS, tiers: adminTiersSchema });

    const lines = Object.entries(report)
      .filter(([, fields]) => fields.length > 0)
      .map(([resource, fields]) => `  ${resource}: ${fields.join(", ")}`);
    console.info(
      lines.length === 0
        ? "Every modelled field is filled by some fixture."
        : `Modelled fields no fixture fills (report only):\n${lines.join("\n")}`,
    );
    expect(Object.keys(report)).toContain("posts");
  });
});
