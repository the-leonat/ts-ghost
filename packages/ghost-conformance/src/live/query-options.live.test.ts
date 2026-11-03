// Live: fields, relations in fields, filter and order syntax, paginate, and a 404, a 422 and a 401 as error results.

import { beforeAll, describe, expect, inject } from "vitest";

import { adminApi } from "../ghost/admin-client.ts";
import { seedPages, seedPosts } from "../seeds/posts-and-pages.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
let pageSeed: Awaited<ReturnType<typeof seedPages>>;
beforeAll(async () => {
  seed = await seedPosts(inject("ghost"));
  pageSeed = await seedPages(inject("ghost"));
});

const seeded = (): `id:[${string}]` =>
  `id:[${[seed.full, seed.bare, seed.emailed].map((p) => p.id).join(",")}]`;

// What the client claims about every query, once: Ghost's own query semantics are Ghost's to test.
describe("query options", () => {
  liveTest("fields narrows a browse and a read to exactly the selected keys", async ({ api }) => {
    const browsed = await api.posts.browse({ filter: seeded() }).fields({ id: true, title: true }).fetch();
    const read = await api.posts.read({ id: seed.full.id }).fields({ id: true, status: true }).fetch();
    assertOk(browsed);
    assertOk(read);
    for (const post of browsed.data) expect(Object.keys(post).sort()).toEqual(["id", "title"]);
    expect(read.data).toEqual({ id: seed.full.id, status: "published" });
  });

  describe.each(["posts", "pages"] as const)("%s: fields naming relations", (resource) => {
    const full = () => (resource === "posts" ? seed : pageSeed).full;
    const reads = (api: any) => [
      api[resource].browse({ filter: `id:${full().id}` }),
      api[resource].read({ id: full().id }),
      api[resource].read({ slug: full().slug }),
    ];

    liveTest("come back filled, and only what was selected", async ({ api }) => {
      const fields = { slug: true, authors: true, tags: true, primary_author: true, primary_tag: true };
      for (const fetcher of reads(api)) {
        const result = await fetcher.fields(fields).fetch();
        assertOk(result);
        const record = Array.isArray(result.data) ? result.data[0] : result.data;
        expect(Object.keys(record).sort()).toEqual(Object.keys(fields).sort());
        expect(record.authors.length).toBeGreaterThan(0);
        expect(record.tags.length).toBeGreaterThan(0);
        expect(record.primary_author.url).toEqual(expect.any(String));
        expect(record.primary_tag.url).toEqual(expect.any(String));
      }
    });

    liveTest("a required primary_author alone brings its relation", async ({ api }) => {
      for (const fetcher of reads(api)) {
        const result = await fetcher.fields({ slug: true, primary_author: true }).fetch();
        assertOk(result);
        const record = Array.isArray(result.data) ? result.data[0] : result.data;
        expect(Object.keys(record).sort()).toEqual(["primary_author", "slug"]);
      }
    });

    liveTest("tiers can be selected on the Admin API", async ({ api }) => {
      const result = await (api as any)[resource].read({ id: full().id }).fields({ tiers: true }).fetch();
      assertOk(result);
      expect(Array.isArray(result.data.tiers)).toBe(true);
    });
  });

  liveTest("Ghost accepts the filter syntax the client's types allow", async ({ api }) => {
    const result = await api.posts
      .browse({ filter: `${seeded()}+tags.slug:tag-${seed.suffix}+title:'${seed.full.title}'` })
      .fetch();
    assertOk(result);
    expect(result.data.map((post) => post.id)).toEqual([seed.full.id]);
  });

  liveTest("Ghost accepts the order syntax the client's types allow", async ({ api }) => {
    const result = await api.posts.browse({ filter: seeded(), order: "created_at ASC" }).fetch();
    assertOk(result);
    expect(result.data).toHaveLength(3);
  });

  liveTest("paginate walks every page to the end", async ({ api }) => {
    const ids: string[] = [];
    let fetcher: ReturnType<LiveContext["api"]["posts"]["browse"]> | undefined = api.posts.browse({
      filter: seeded(),
      limit: 1,
    });
    while (fetcher) {
      const { current, next } = await fetcher.paginate();
      assertOk(current);
      ids.push(...current.data.map((post) => post.id));
      fetcher = next;
    }
    expect(ids.sort()).toEqual([seed.full.id, seed.bare.id, seed.emailed.id].sort());
  });

  liveTest(
    "a missing resource, a malformed id and an unknown key are error results",
    async ({ api, ghost }) => {
      const failure = (status: number, type: string) => ({
        success: false,
        status,
        errors: [expect.objectContaining({ type, message: expect.any(String) })],
      });
      const missing = await api.posts.read({ id: "0123456789abcdef01234567" }).fetch();
      expect(missing).toMatchObject(failure(404, "NotFoundError"));

      expect(await api.posts.read({ id: "not-an-id" }).fetch()).toMatchObject(
        failure(422, "ValidationError"),
      );
      expect(await api.pages.read({ id: "not-an-id" }).fetch()).toMatchObject(
        failure(422, "ValidationError"),
      );

      const unknownKey = `${"a".repeat(24)}:${"b".repeat(64)}`;
      const unauthorized = adminApi({ ...ghost, integrationKey: unknownKey }, ghost.leg, { strict: true });
      expect(await unauthorized.posts.browse().fetch()).toMatchObject(failure(401, "UnauthorizedError"));
    },
  );
});
