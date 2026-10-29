import { beforeAll, describe, expect, inject } from "vitest";

import { FULL_HTML, fullScalars, seedPages } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi } from "./ghost.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPages>>;
beforeAll(async () => {
  seed = await seedPages(adminApi());
});

describe("pages", () => {
  liveTest("browse returns the seeded pages", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).fetch();

    assertOk(result);
    const byId = new Map(result.data.map((page) => [page.id, page]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
  });

  liveTest("browse with authors, tags and tiers included populates every relation", async ({ api }) => {
    const result = await api.pages
      .browse({ limit: "all" })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assertOk(result);
    expect(result.data.every((page) => page.authors.length > 0)).toBe(true);
    const full = result.data.find((page) => page.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Page tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Page tag ${seed.suffix}`);
  });

  liveTest("browse with the html format returns content", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).formats({ html: true }).fetch();

    assertOk(result);
    expect(result.data.find((page) => page.id === seed.full.id)?.html).toBe(FULL_HTML);
  });

  liveTest("browse with the plaintext format returns content", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.find((page) => page.id === seed.full.id)?.plaintext).toBe("Hello world");
  });

  liveTest("read with the plaintext format returns content", async ({ api }) => {
    const result = await api.pages.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.plaintext).toBe("Hello world");
  });

  liveTest("read by slug equals read by id", async ({ api }) => {
    const byId = await api.pages.read({ id: seed.full.id }).fetch();
    const bySlug = await api.pages.read({ slug: seed.full.slug }).fetch();

    assertOk(byId);

    assertOk(bySlug);
    expect(byId.data.id).toBe(seed.full.id);
    // A page lists every tier, which the tiers seed adds and renames concurrently; compare all else.
    expect(bySlug.data).toEqual({ ...byId.data, tiers: expect.any(Array) });
  });

  liveTest("nullable fields come back null on a bare page and set on a full page", async ({ api }) => {
    const bare = await api.pages.read({ id: seed.bare.id }).fetch();
    const full = await api.pages.read({ id: seed.full.id }).fetch();

    assertOk(bare);

    assertOk(full);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  liveTest("add reads back every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const owner = inject("ghost").owner.email;
    const added = await api.pages.add(
      {
        ...fullScalars(suffix),
        visibility: "tiers",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added tag ${suffix}` }],
        authors: [{ email: owner }],
        html: FULL_HTML,
      },
      { source: "html" },
    );
    assertOk(added);

    const read = await api.pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "tiers" });
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([owner]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  // locale input is deprecated: pages have no locale in Ghost.
  liveTest("add ignores the deprecated locale", async ({ api }) => {
    const added = await api.pages.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assertOk(added);

    const read = await api.pages.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).not.toHaveProperty("locale");
  });

  liveTest("edit persists every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.pages.add({ title: `To edit ${suffix}` });
    assertOk(added);

    const edited = await api.pages.edit(
      added.data.id,
      {
        ...fullScalars(suffix),
        visibility: "members",
        tags: [{ name: `Edited tag ${suffix}` }],
        html: FULL_HTML,
        updated_at: new Date(added.data.updated_at ?? ""),
      },
      { source: "html" },
    );
    assertOk(edited);

    const read = await api.pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "members" });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  liveTest("delete removes the page", async ({ api }) => {
    const added = await api.pages.add({ title: `To delete ${uniqueSuffix()}` });
    assertOk(added);

    expect(await api.pages.delete(added.data.id)).toEqual({ success: true });
    const read = await api.pages.read({ id: added.data.id }).fetch();
    expect(read).toMatchObject({ success: false, status: 404 });
  });
});

describe("pages: unknown keys", () => {
  const unknownAfterEveryOperation = async (api: LiveContext["api"]) => {
    const browsed = await api.pages
      .browse({ limit: "all" })
      .include({ authors: true, tags: true, tiers: true })
      .formats({ html: true })
      .fetch();
    const read = await api.pages.read({ id: seed.full.id }).fetch();
    const added = await api.pages.add({
      title: `Unknown keys ${uniqueSuffix()}`,
      tags: [{ name: "Unknown keys" }],
    });
    const edited =
      added.success &&
      (await api.pages.edit(added.data.id, {
        title: "Edited",
        updated_at: new Date(added.data.updated_at ?? ""),
      }));
    return undeclaredKeys(browsed, read, added, edited);
  };
  const isAuthorKey = (k: string) => /^pages\[\]\.(authors\[\]|primary_author)\./.test(k);

  liveTest("authors carry no key the client's schema lacks", async ({ api }) => {
    expect((await unknownAfterEveryOperation(api)).filter(isAuthorKey)).toEqual([]);
  });

  liveTest("pages carry no key the client's schema lacks", async ({ api }) => {
    expect((await unknownAfterEveryOperation(api)).filter((k) => !isAuthorKey(k))).toEqual([]);
  });
});

// Every nullable field a page output has that the client's inputs can set.
const NULLABLE = [
  "feature_image",
  "feature_image_alt",
  "feature_image_caption",
  "custom_excerpt",
  "codeinjection_head",
  "codeinjection_foot",
  "og_image",
  "og_title",
  "og_description",
  "twitter_image",
  "twitter_title",
  "twitter_description",
  "meta_title",
  "meta_description",
  "custom_template",
  "canonical_url",
  "published_at",
  "primary_tag",
  "excerpt",
] as const;
