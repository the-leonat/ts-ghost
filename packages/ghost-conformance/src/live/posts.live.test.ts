// Live: the posts schemas, shape and nullability, includes and formats, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminPostsCreateSchema, adminSchemas } from "@ts-ghost/admin-api";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { uniqueSuffix } from "../seeds/helpers.ts";
import { FULL_HTML, fullScalars, seedPosts } from "../seeds/posts-and-pages.ts";
import { assertOk, liveTest, onLatest } from "./live-test.ts";
import { CONTENT, fetched, MODIFIERS, NOT_SEEDABLE, NOT_SENT_BACK } from "./content-cases.ts";
import { deprecatedKeys, nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
beforeAll(async () => {
  seed = await seedPosts(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].posts;

describe("posts", () => {
  liveTest("every seeded post parses, each nullable field both null and set", async ({ api }) => {
    const ids = [seed.full.id, seed.bare.id, seed.emailed.id];
    const slugs = Object.values(EMAIL_SEED.posts);
    assertOk(await api.posts.browse({ filter: `id:[${ids.join(",")}]`, limit: "all" }).fetch());
    assertOk(await api.posts.browse({ filter: `slug:[${slugs.join(",")}]`, limit: "all" }).fetch());
    const [full, bare, emailed] = await Promise.all(
      ids.map(async (id) => {
        const result = await api.posts.read({ id }).fetch();
        assertOk(result);
        return result.data;
      }),
    );
    // The SQL seed's emails: a failed one with nulls and a submitted one with every field set.
    const [failed, submitted] = await Promise.all(slugs.map((slug) => api.posts.read({ slug }).fetch()));
    assertOk(failed);
    assertOk(submitted);

    expect(
      nullabilityGaps(schema, [bare!, full!, emailed!, failed.data, submitted.data], NOT_SEEDABLE),
    ).toEqual([]);
  });

  liveTest.for(MODIFIERS)("$key comes with its include or format and not without", async (row, { api }) => {
    const read = () => api.posts.read({ id: seed.full.id });
    expect((await fetched(row.with(read())))[row.key]).not.toHaveLength(0);
    expect(await fetched(row.without(read()))).not.toHaveProperty(row.key);
  });

  liveTest.runIf(onLatest)(
    "add and edit with every input read back what was sent",
    async ({ api, ghost }) => {
      const suffix = uniqueSuffix();
      const omit = [
        ...deprecatedKeys(adminPostsCreateSchema),
        ...Object.keys(NOT_SENT_BACK),
        ...CONTENT.keys,
      ];
      const readPost = async (id: string) => {
        const result = await api.posts.read({ id }).formats({ html: true, plaintext: true }).fetch();
        assertOk(result);
        return result.data;
      };

      const add = {
        ...fullScalars(suffix),
        published_at: new Date("2026-01-02T03:04:05.000Z"),
        email_subject: "Email subject",
        visibility: "tiers" as const,
        visibility_filter: "status:-free",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added ${suffix}` }],
        authors: [{ email: ghost.owner.email }],
        locale: "de",
        newsletter: { slug: "default-newsletter" },
        html: FULL_HTML,
      };
      const added = await api.posts.add(add, { source: "html" });
      assertOk(added);
      const id = added.data.id;
      expect(await readPost(id)).toMatchObject({ ...readBack(add, omit), html: FULL_HTML });

      const edit = {
        title: `Edited ${suffix}`,
        slug: `edited-${suffix}`,
        status: "draft",
        email_only: true,
        featured: false,
        visibility: "members",
        lexical: CONTENT.lexical,
        updated_at: new Date(added.data.updated_at!),
      } as const;
      const edited = await api.posts.edit(id, edit);
      assertOk(edited);
      expect(await readPost(id)).toMatchObject({ ...readBack(edit, omit), plaintext: CONTENT.lexicalText });

      const fromMobiledoc = { mobiledoc: CONTENT.mobiledoc, updated_at: new Date(edited.data.updated_at!) };
      assertOk(await api.posts.edit(id, fromMobiledoc));
      expect(await readPost(id)).toMatchObject({ plaintext: CONTENT.mobiledocText });

      expect(unsentInputs(adminPostsCreateSchema, add, edit, fromMobiledoc)).toEqual([]);
      expect(await api.posts.delete(id)).toEqual({ success: true });
    },
  );
});
