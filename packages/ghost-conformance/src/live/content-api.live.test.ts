// Live: the content-api client's schemas on the seeds the admin tests use. Its one schema serves every leg.

import { beforeAll, describe, expect, inject } from "vitest";
import { authorsSchema, pagesSchema, postsSchema, tagsSchema, tiersSchema } from "@ts-ghost/content-api";

import { adminApi } from "../ghost/admin-client.ts";
import { must } from "../seeds/helpers.ts";
import { seedPages, seedPosts } from "../seeds/posts-and-pages.ts";
import { seedTags } from "../seeds/tags.ts";
import { seedTiers } from "../seeds/tiers.ts";
import { seedUsers } from "../seeds/users.ts";
import { fetched } from "./content-cases.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";
import { nullabilityGaps } from "./schema-keys.ts";

let posts: Awaited<ReturnType<typeof seedPosts>>;
let pages: Awaited<ReturnType<typeof seedPages>>;
let tags: Awaited<ReturnType<typeof seedTags>>;
let tiers: Awaited<ReturnType<typeof seedTiers>>;
let users: Awaited<ReturnType<typeof seedUsers>>;
let ownerSlug: string;
beforeAll(async () => {
  const ghost = inject("ghost");
  const admin = adminApi(ghost, ghost.leg);
  [posts, pages, tags, tiers, users] = await Promise.all([
    seedPosts(ghost),
    seedPages(ghost),
    seedTags(ghost),
    seedTiers(ghost),
    seedUsers(ghost),
  ]);
  ownerSlug = must(await admin.users.read({ email: ghost.owner.email }).fetch(), "Owner").slug;
  // The Content API lists only authors with a published post.
  must(
    await admin.posts.add({
      title: `By ${users.staff.slug}`,
      status: "published",
      authors: [{ email: users.staff.email }],
    }),
    "post by the staff user",
  );
});

type Fetch = { fetch(): Promise<{ success: boolean; data?: unknown }> };
type Read = Fetch & {
  include(include: { authors?: true; tags?: true }): Read;
  formats(formats: { html?: true; plaintext?: true }): Read;
};
type Posts = { read(identity: { id: string } | { slug: string }): Read };

/** The Content API sees only published content: the full seed is tier-gated, the bare one public and empty. */
const CONTENT = {
  posts: { schema: postsSchema, seed: () => ({ full: posts.full, bare: posts.emailed }) },
  pages: { schema: pagesSchema, seed: () => ({ full: pages.full, bare: pages.published }) },
} as const;

/** Nullable fields no published seed nulls or sets, with the reason. */
const NOT_SEEDABLE = {
  comment_id: "Ghost sets it to the id on every new post or page",
  updated_at: "Ghost sets it on every write",
  published_at: "the Content API sends only published content",
  frontmatter: "no input sets it",
  primary_author: "every post or page has an author",
  url: "Ghost always sends it",
};

const MODIFIERS: { key: string; with: (read: Read) => Read; without: (read: Read) => Read }[] = [
  ...["authors", "primary_author"].map((key) => ({
    key,
    with: (read: Read) => read.include({ authors: true }),
    without: (read: Read) => read.include({ tags: true }),
  })),
  ...["tags", "primary_tag"].map((key) => ({
    key,
    with: (read: Read) => read.include({ tags: true }),
    without: (read: Read) => read.include({ authors: true }),
  })),
  {
    key: "html",
    with: (read) => read.formats({ html: true }),
    without: (read) => read.formats({ plaintext: true }),
  },
  {
    key: "plaintext",
    with: (read) => read.formats({ plaintext: true }),
    without: (read) => read.formats({ html: true }),
  },
];

const contentOf = (content: LiveContext["content"], name: keyof typeof CONTENT) =>
  content[name] as unknown as Posts;

describe("content api", () => {
  describe.for(["posts", "pages"] as const)("%s", (name) => {
    liveTest("every seeded variant parses, each nullable field both null and set", async ({ content }) => {
      const { full, bare } = CONTENT[name].seed();
      const read = (identity: { id: string } | { slug: string }) =>
        fetched(
          contentOf(content, name)
            .read(identity)
            .include({ authors: true, tags: true })
            .formats({ html: true, plaintext: true }),
        );
      const [fullRead, bareRead] = await Promise.all([read({ id: full.id }), read({ id: bare.id })]);
      await read({ slug: full.slug });
      assertOk(await content[name].browse({ filter: `id:[${full.id},${bare.id}]` }).fetch());

      expect(nullabilityGaps(CONTENT[name].schema, [bareRead, fullRead], NOT_SEEDABLE)).toEqual([]);
      expect(bareRead).toMatchObject({ html: null, excerpt: null });
    });

    liveTest.for(MODIFIERS)(
      "$key comes with its include or format and not without",
      async (row, { content }) => {
        const read = () => contentOf(content, name).read({ id: CONTENT[name].seed().full.id });
        expect((await fetched(row.with(read())))[row.key] ?? null).not.toBeNull();
        expect(await fetched(row.without(read()))).not.toHaveProperty(row.key);
      },
    );
  });

  liveTest(
    "authors parse, each nullable field both null and set, count with its include",
    async ({ content }) => {
      const owner = await content.authors.read({ slug: ownerSlug }).fetch();
      const staff = await content.authors.read({ id: users.staff.id }).fetch();
      const counted = await content.authors
        .read({ slug: users.staff.slug })
        .include({ "count.posts": true })
        .fetch();
      assertOk(owner);
      assertOk(staff);
      assertOk(counted);
      assertOk(await content.authors.browse({ filter: `slug:[${ownerSlug},${users.staff.slug}]` }).fetch());

      const except = { url: "Ghost always sends it" };
      expect(nullabilityGaps(authorsSchema, [owner.data, staff.data], except)).toEqual([]);
      expect(counted.data.count).toEqual({ posts: 1 });
      expect(staff.data).not.toHaveProperty("count");
    },
  );

  liveTest(
    "tags parse, each nullable field both null and set, count with its include",
    async ({ content }) => {
      const full = await content.tags.read({ id: tags.full.id }).fetch();
      const bare = await content.tags.read({ slug: tags.bare.slug }).fetch();
      const counted = await content.tags.read({ id: tags.full.id }).include({ "count.posts": true }).fetch();
      assertOk(full);
      assertOk(bare);
      assertOk(counted);
      assertOk(await content.tags.browse({ filter: `slug:[${tags.full.slug},${tags.bare.slug}]` }).fetch());

      expect(nullabilityGaps(tagsSchema, [bare.data, full.data])).toEqual([]);
      expect(counted.data.count).toEqual({ posts: tags.postsPerTag });
      expect(full.data).not.toHaveProperty("count");
    },
  );

  liveTest(
    "every tier parses, each nullable field both null and set, and none reads",
    async ({ content }) => {
      const browsed = await content.tiers.browse({ limit: "all" }).fetch();
      assertOk(browsed);
      const free = browsed.data.find((tier) => tier.type === "free")!;
      const full = browsed.data.find((tier) => tier.id === tiers.full.id)!;
      const bare = browsed.data.find((tier) => tier.id === tiers.bare.id)!;

      const except = {
        updated_at: "Ghost sets it on every write",
        currency: "no tier under /tiers/ sends null: the free tier leaves it out",
      };
      expect(nullabilityGaps(tiersSchema, [free, full, bare], except)).toEqual([]);
      // Ghost sends prices and benefits without an include, and accepts the deprecated includes.
      expect(full).toMatchObject({ monthly_price: 700, yearly_price: 7000, benefits: expect.any(Array) });
      assertOk(
        await content.tiers
          .browse()
          .include({ monthly_price: true, yearly_price: true, benefits: true })
          .fetch(),
      );
      // No Content API route reads one tier, so the method is deprecated.
      expect(await content.tiers.read({ id: full.id }).fetch()).toMatchObject({ success: false });
    },
  );

  liveTest("the settings parse", async ({ content }) => {
    assertOk(await content.settings.fetch());
  });

  liveTest("fields narrows a browse and a read to exactly the selected keys", async ({ content }) => {
    const browsed = await content.posts
      .browse({ filter: `id:${posts.full.id}` })
      .fields({ id: true, title: true })
      .fetch();
    const read = await content.tags.read({ id: tags.full.id }).fields({ id: true, name: true }).fetch();
    assertOk(browsed);
    assertOk(read);
    expect(browsed.data.map((post) => Object.keys(post).sort())).toEqual([["id", "title"]]);
    expect(Object.keys(read.data).sort()).toEqual(["id", "name"]);
  });

  liveTest("Ghost accepts the tag and author aliases the filter type allows", async ({ content }) => {
    const result = await content.posts
      .browse({ filter: `tag:tag-${posts.suffix}+author:${ownerSlug}` })
      .fetch();
    assertOk(result);
    expect(result.data.map((post) => post.id)).toEqual([posts.full.id]);
  });

  liveTest("a missing slug and a malformed id come back as error results", async ({ content }) => {
    const failure = (status: number, type: string) => ({
      success: false,
      status,
      errors: [expect.objectContaining({ type, message: expect.any(String) })],
    });
    expect(await content.posts.read({ slug: "no-such-slug" }).fetch()).toMatchObject(
      failure(404, "NotFoundError"),
    );
    expect(await content.posts.read({ id: "not-an-id" }).fetch()).toMatchObject(
      failure(422, "ValidationError"),
    );
  });
});
