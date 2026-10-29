import { beforeAll, describe, expect, inject } from "vitest";

import { QUERY_LETTERS, seedQueryOptions } from "../seeds/query-options.ts";
import { sessionRequest } from "../seeds/session.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { adminApi, type LiveGhost } from "./ghost.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";
import { PENDING_KEYS } from "./pending-keys.ts";

describe("query options and error paths", () => {
  let seed: Awaited<ReturnType<typeof seedQueryOptions>>;
  beforeAll(async () => {
    seed = await seedQueryOptions();
  });

  const seededPosts = (): `id:[${string}]` => `id:[${seed.posts.map((p) => p.id).join(",")}]`;
  const titles = (letters: readonly string[]) => letters.map((l) => `Query ${seed.suffix} ${l}`);

  describe("posts: query options", () => {
    liveTest("browse with fields returns exactly the selected fields", async ({ api, responses }) => {
      const result = await api.posts
        .browse({ filter: seededPosts() })
        .fields({ id: true, title: true, status: true })
        .fetch();

      assertOk(result);
      expect(result.data).toHaveLength(5);
      for (const post of result.data) expect(Object.keys(post).sort()).toEqual(["id", "status", "title"]);
      const raw = responses.last("/posts/") as { posts: object[] };
      for (const post of raw.posts) expect(Object.keys(post).sort()).toEqual(["id", "status", "title"]);
    });

    liveTest("read with fields returns exactly the selected fields", async ({ api, responses }) => {
      const [post] = seed.posts;
      const result = await api.posts.read({ id: post!.id }).fields({ id: true, title: true }).fetch();

      assertOk(result);
      expect(result.data).toEqual({ id: post!.id, title: post!.title });
      const raw = responses.last("/posts/") as { posts: object[] };
      expect(Object.keys(raw.posts[0]!).sort()).toEqual(["id", "title"]);
    });

    liveTest("order sorts ascending and descending", async ({ api }) => {
      const asc = await api.posts.browse({ filter: seededPosts(), order: "title asc" }).fetch();
      const desc = await api.posts.browse({ filter: seededPosts(), order: "title DESC" }).fetch();

      assertOk(asc);
      assertOk(desc);
      expect(asc.data.map((p) => p.title)).toEqual(titles(QUERY_LETTERS));
      expect(desc.data.map((p) => p.title)).toEqual(titles([...QUERY_LETTERS].reverse()));
    });

    liveTest("filter narrows the seed to its drafts", async ({ api }) => {
      const result = await api.posts
        .browse({ filter: `${seededPosts()}+status:draft`, order: "title asc" })
        .fetch();

      assertOk(result);
      expect(result.data.map((p) => p.title)).toEqual(titles(["b", "d"]));
    });

    liveTest("limit caps the page and meta counts the rest", async ({ api }) => {
      const result = await api.posts.browse({ filter: seededPosts(), limit: 2 }).fetch();

      assertOk(result);
      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination).toMatchObject({ page: 1, limit: 2, pages: 3, total: 5, next: 2 });
    });

    liveTest("paginate walks disjoint pages that together hold the whole seed", async ({ api }) => {
      const pages: string[][] = [];
      let fetcher: ReturnType<LiveContext["api"]["posts"]["browse"]> | undefined = api.posts.browse({
        filter: seededPosts(),
        limit: 2,
        order: "title asc",
      });
      while (fetcher) {
        const { current, next } = await fetcher.paginate();
        assertOk(current);
        pages.push(current.data.map((p) => p.title));
        fetcher = next;
      }

      expect(pages).toEqual([titles(["a", "b"]), titles(["c", "d"]), titles(["e"])]);
    });
  });

  const seededMembers = (): `email:[${string}]` =>
    `email:[${seed.members.map((m) => `'${m.email}'`).join(",")}]`;
  const emails = (letters: readonly string[]) =>
    letters.map((l) => `query-${seed.suffix}-${l}@conformance.test`);

  // Ghost ignores `fields` on members and sends every key; the client narrows the output itself.
  describe("members: query options", () => {
    liveTest("browse with fields returns exactly the selected fields", async ({ api }) => {
      const result = await api.members
        .browse({ filter: seededMembers() })
        .fields({ id: true, email: true, name: true })
        .fetch();

      assertOk(result);
      expect(result.data).toHaveLength(5);
      for (const member of result.data) expect(Object.keys(member).sort()).toEqual(["email", "id", "name"]);
    });

    liveTest("read with fields returns exactly the selected fields", async ({ api }) => {
      const [member] = seed.members;
      const result = await api.members.read({ id: member!.id }).fields({ id: true, email: true }).fetch();

      assertOk(result);
      expect(result.data).toEqual({ id: member!.id, email: member!.email });
    });

    liveTest("order sorts ascending and descending", async ({ api }) => {
      const asc = await api.members.browse({ filter: seededMembers(), order: "email asc" }).fetch();
      const desc = await api.members.browse({ filter: seededMembers(), order: "email DESC" }).fetch();

      assertOk(asc);
      assertOk(desc);
      expect(asc.data.map((m) => m.email)).toEqual(emails(QUERY_LETTERS));
      expect(desc.data.map((m) => m.email)).toEqual(emails([...QUERY_LETTERS].reverse()));
    });

    liveTest("filter narrows the seed by a quoted name after the email set", async ({ api }) => {
      const result = await api.members
        .browse({ filter: `${seededMembers()}+name:'Query ${seed.suffix} c'` })
        .fetch();

      assertOk(result);
      expect(result.data.map((m) => m.email)).toEqual(emails(["c"]));
    });

    liveTest("limit caps the page and meta counts the rest", async ({ api }) => {
      const result = await api.members.browse({ filter: seededMembers(), limit: 2 }).fetch();

      assertOk(result);
      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination).toMatchObject({ page: 1, limit: 2, pages: 3, total: 5, next: 2 });
    });

    liveTest("paginate walks disjoint pages that together hold the whole seed", async ({ api }) => {
      const pages: string[][] = [];
      let fetcher: ReturnType<LiveContext["api"]["members"]["browse"]> | undefined = api.members.browse({
        filter: seededMembers(),
        limit: 2,
        order: "email asc",
      });
      while (fetcher) {
        const { current, next } = await fetcher.paginate();
        assertOk(current);
        pages.push(current.data.map((m) => m.email));
        fetcher = next;
      }

      expect(pages).toEqual([emails(["a", "b"]), emails(["c", "d"]), emails(["e"])]);
    });
  });

  describe("error paths", () => {
    const MISSING_ID = "0123456789abcdef01234567";
    // `body` is Ghost's raw error response.
    const failure = (status: number, type: string) => ({
      success: false,
      status,
      body: expect.stringContaining(`"type":"${type}"`),
      errors: [expect.objectContaining({ type, message: expect.any(String) })],
    });

    /** A strict client on another Admin API key. */
    const apiWithKey = (ghost: LiveGhost, integrationKey: string) =>
      adminApi("integration", { ...ghost, integrationKey }, { ignore: PENDING_KEYS[ghost.leg.target] });

    /** Every fetcher kind with one key, so each error path is covered. */
    async function callEachFetcher(api: LiveContext["api"]) {
      return {
        browse: await api.posts.browse({ filter: seededPosts() }).fetch(),
        read: await api.posts.read({ id: seed.posts[0]!.id }).fetch(),
        add: await api.tags.add({ name: `Error tag ${uniqueSuffix()}` }),
        delete: await api.tags.delete(MISSING_ID),
      };
    }

    liveTest("an unknown key comes back as an UnauthorizedError on every fetcher", async ({ ghost }) => {
      const api = apiWithKey(ghost, `${"a".repeat(24)}:${"b".repeat(64)}`);

      const results = await callEachFetcher(api);
      for (const result of Object.values(results)) expect(result).toEqual(failure(401, "UnauthorizedError"));
    });

    liveTest("a revoked key comes back as an UnauthorizedError", async ({ ghost }) => {
      const session = inject("ghost");
      const created = await sessionRequest<{
        integrations: { id: string; api_keys: { type: string; secret: string }[] }[];
      }>(session, "POST", "/integrations/", { integrations: [{ name: `Revoked ${uniqueSuffix()}` }] });
      const integration = created.integrations[0]!;
      const adminKey = integration.api_keys.find((k) => k.type === "admin")!;
      const api = apiWithKey(ghost, adminKey.secret);
      assertOk(await api.posts.browse({ filter: seededPosts() }).fetch());

      await sessionRequest(session, "DELETE", `/integrations/${integration.id}/`);

      const results = await callEachFetcher(api);
      for (const result of Object.values(results)) expect(result).toEqual(failure(401, "UnauthorizedError"));
    });

    liveTest("a missing post or member comes back as a NotFoundError", async ({ api }) => {
      const results = [
        await api.posts.read({ id: MISSING_ID }).fetch(),
        await api.posts.read({ slug: `missing-${uniqueSuffix()}` }).fetch(),
        await api.posts.delete(MISSING_ID),
        await api.members.read({ id: MISSING_ID }).fetch(),
        await api.members.edit(MISSING_ID, { name: "Nobody" }),
        await api.members.delete(MISSING_ID),
      ];
      for (const result of results) expect(result).toEqual(failure(404, "NotFoundError"));
    });

    liveTest("a member with a taken email comes back as a ValidationError", async ({ api }) => {
      const result = await api.members.add({ email: seed.members[0]!.email });

      expect(result).toEqual(failure(422, "ValidationError"));
    });

    liveTest("a scheduled post without a publish date comes back as a ValidationError", async ({ api }) => {
      const result = await api.posts.add({ title: `Unscheduled ${seed.suffix}`, status: "scheduled" });

      expect(result).toEqual(failure(422, "ValidationError"));
    });
  });
});
