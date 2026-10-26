import { describe, expect, test } from "vitest";
import { z } from "zod";
import { baseNewsletterSchema, baseSiteSchema, baseTagsSchema } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "../admin-api";
import { adminPagesSchema } from "../schemas/pages";
import { adminPostsSchema } from "../schemas/posts";
import { adminUsersSchema } from "../schemas/users";
import { adminWebhookSchema } from "../schemas/webhooks";
import { describeClient } from "./client-claims";
import { emptyReads, unbackedFields } from "./evidence";
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

describe(`evidence in the fixtures recorded from pinned Ghost ${PINNED_GHOST.ref}`, () => {
  const fixtures = loadFixtures(PINNED_GHOST.fixtureDir);
  const modelled = describeClient(new TSGhostAdminAPI("https://ghost.org", ADMIN_KEY, "v6.72")).map(
    (claim) => claim.resource,
  );

  test("every recorded read of a resource the client models has at least one record", () => {
    expect(emptyReads(fixtures, modelled)).toEqual([]);
  });

  test("modelled fields no fixture fills are reported, never failed", () => {
    const report = unbackedFields(fixtures, {
      posts: adminPostsSchema,
      pages: adminPagesSchema,
      tags: baseTagsSchema,
      newsletters: baseNewsletterSchema,
      users: adminUsersSchema,
      webhooks: adminWebhookSchema,
      site: baseSiteSchema,
    });

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
