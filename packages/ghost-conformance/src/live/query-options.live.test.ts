// Live: fields, filter syntax, paginate, and a 404 and a 401 as error results.

import { beforeAll, describe, expect, inject } from "vitest";

import { adminApi } from "../ghost/admin-client.ts";
import { seedPosts } from "../seeds/posts-and-pages.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
beforeAll(async () => {
  seed = await seedPosts(inject("ghost"));
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

  liveTest("Ghost accepts the filter syntax the client's types allow", async ({ api }) => {
    const result = await api.posts
      .browse({ filter: `${seeded()}+tags.slug:tag-${seed.suffix}+title:'${seed.full.title}'` })
      .fetch();
    assertOk(result);
    expect(result.data.map((post) => post.id)).toEqual([seed.full.id]);
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

  liveTest("a missing resource and an unknown key come back as error results", async ({ api, ghost }) => {
    const failure = (status: number, type: string) => ({
      success: false,
      status,
      errors: [expect.objectContaining({ type, message: expect.any(String) })],
    });
    const missing = await api.posts.read({ id: "0123456789abcdef01234567" }).fetch();
    expect(missing).toMatchObject(failure(404, "NotFoundError"));

    const unknownKey = `${"a".repeat(24)}:${"b".repeat(64)}`;
    const unauthorized = adminApi({ ...ghost, integrationKey: unknownKey }, ghost.leg, { strict: true });
    expect(await unauthorized.posts.browse().fetch()).toMatchObject(failure(401, "UnauthorizedError"));
  });
});
