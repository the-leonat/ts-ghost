// Live: the pages schemas, shape and nullability, includes and formats, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminPagesCreateSchema, adminSchemas } from "@ts-ghost/admin-api";

import { uniqueSuffix } from "../seeds/helpers.ts";
import { FULL_HTML, fullScalars, seedPages } from "../seeds/posts-and-pages.ts";
import { assertOk, liveTest, onLatest } from "./live-test.ts";
import { CONTENT, fetched, MODIFIERS, NOT_SEEDABLE, NOT_SENT_BACK } from "./posts-and-pages.ts";
import { nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedPages>>;
beforeAll(async () => {
  seed = await seedPages(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].pages;

describe("pages", () => {
  liveTest("every seeded page parses, each nullable field both null and set", async ({ api }) => {
    const ids = [seed.full.id, seed.bare.id];
    assertOk(await api.pages.browse({ filter: `id:[${ids.join(",")}]` }).fetch());
    const [full, bare] = await Promise.all(ids.map((id) => api.pages.read({ id }).fetch()));
    assertOk(full);
    assertOk(bare);
    assertOk(await api.pages.read({ slug: full.data.slug }).fetch());

    expect(nullabilityGaps(schema, [bare.data, full.data], NOT_SEEDABLE)).toEqual([]);
  });

  liveTest.for(MODIFIERS)("$key comes with its include or format and not without", async (row, { api }) => {
    const read = () => api.pages.read({ id: seed.full.id });
    expect((await fetched(row.with(read())))[row.key]).not.toHaveLength(0);
    expect(await fetched(row.without(read()))).not.toHaveProperty(row.key);
  });

  liveTest.runIf(onLatest)(
    "add and edit with every input read back what was sent",
    async ({ api, ghost }) => {
      const suffix = uniqueSuffix();
      const omit = [...Object.keys(NOT_SENT_BACK), ...CONTENT.keys];
      const readPage = async (id: string) => {
        const result = await api.pages.read({ id }).formats({ html: true, plaintext: true }).fetch();
        assertOk(result);
        return result.data;
      };

      const add = {
        ...fullScalars(suffix),
        published_at: new Date("2026-01-02T03:04:05.000Z"),
        visibility: "tiers" as const,
        visibility_filter: "status:-free",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added ${suffix}` }],
        authors: [{ email: ghost.owner.email }],
        locale: "de",
        html: FULL_HTML,
      };
      const added = await api.pages.add(add, { source: "html" });
      assertOk(added);
      const id = added.data.id;
      expect(await readPage(id)).toMatchObject({ ...readBack(add, omit), html: FULL_HTML });

      const edit = {
        title: `Edited ${suffix}`,
        slug: `edited-${suffix}`,
        status: "draft",
        featured: false,
        visibility: "members",
        lexical: CONTENT.lexical,
        updated_at: new Date(added.data.updated_at!),
      } as const;
      const edited = await api.pages.edit(id, edit);
      assertOk(edited);
      expect(await readPage(id)).toMatchObject({ ...readBack(edit, omit), plaintext: CONTENT.lexicalText });

      const fromMobiledoc = { mobiledoc: CONTENT.mobiledoc, updated_at: new Date(edited.data.updated_at!) };
      assertOk(await api.pages.edit(id, fromMobiledoc));
      expect(await readPage(id)).toMatchObject({ plaintext: CONTENT.mobiledocText });

      expect(unsentInputs(adminPagesCreateSchema, add, edit, fromMobiledoc)).toEqual([]);
      expect(await api.pages.delete(id)).toEqual({ success: true });
    },
  );
});
