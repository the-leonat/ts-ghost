// Live: the tags schemas, shape and nullability, the post count include, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminSchemas } from "@ts-ghost/admin-api";

import { uniqueSuffix } from "../seeds/helpers.ts";
import { fullTagInput, seedTags } from "../seeds/tags.ts";
import { assertOk, liveTest, onLatest } from "./live-test.ts";
import { nullabilityGaps, readBack } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedTags>>;
beforeAll(async () => {
  seed = await seedTags(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].tags;

describe("tags", () => {
  liveTest("every seeded tag parses, each nullable field both null and set", async ({ api }) => {
    assertOk(await api.tags.browse({ filter: `slug:[${seed.full.slug},${seed.bare.slug}]` }).fetch());
    const [full, bare] = await Promise.all(
      [seed.full, seed.bare].map(({ id }) => api.tags.read({ id }).fetch()),
    );
    assertOk(full);
    assertOk(bare);
    assertOk(await api.tags.read({ slug: seed.full.slug }).fetch());

    const exceptions = { updated_at: "Ghost sets it on every write" };
    expect(nullabilityGaps(schema, [bare.data, full.data], exceptions)).toEqual([]);
  });

  liveTest("count comes with the count.posts include and not without", async ({ api }) => {
    const counted = await api.tags.read({ id: seed.full.id }).include({ "count.posts": true }).fetch();
    const plain = await api.tags.read({ id: seed.full.id }).fetch();
    assertOk(counted);
    assertOk(plain);
    expect(counted.data.count).toEqual({ posts: seed.postsPerTag });
    expect(plain.data).not.toHaveProperty("count");
  });

  liveTest.runIf(onLatest)("add and edit with every input read back what was sent", async ({ api }) => {
    const add = fullTagInput(uniqueSuffix());
    const added = await api.tags.add(add);
    assertOk(added);
    const read = async () => {
      const result = await api.tags.read({ id: added.data.id }).fetch();
      assertOk(result);
      return result.data;
    };
    expect(await read()).toMatchObject(readBack(add));

    const edit = {
      ...fullTagInput(uniqueSuffix()),
      visibility: "internal" as const,
      accent_color: "#00ff00",
    };
    assertOk(await api.tags.edit(added.data.id, edit));
    expect(await read()).toMatchObject(readBack(edit));
    expect(await api.tags.delete(added.data.id)).toEqual({ success: true });
  });
});
