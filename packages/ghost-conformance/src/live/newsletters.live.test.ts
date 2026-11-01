// Live: the newsletters schemas, shape and nullability, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminNewsletterCreateSchema, adminSchemas } from "@ts-ghost/admin-api";

import { uniqueSuffix } from "../seeds/helpers.ts";
import { fullNewsletterInput, seedNewsletters } from "../seeds/newsletters.ts";
import { assertOk, liveTest, onLatest } from "./live-test.ts";
import { nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedNewsletters>>;
beforeAll(async () => {
  seed = await seedNewsletters(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].newsletters;

/** Nullable newsletter fields no input sets, with the reason. */
const NOT_SEEDABLE = {
  sender_email: "Ghost stores it only once the address is verified by email",
  updated_at: "Ghost sets it on every write",
  button_color: "no input sets it",
  divider_color: "no input sets it",
  link_color: "no input sets it",
  post_title_color: "no input sets it",
  section_title_color: "no input sets it",
};

describe("newsletters", () => {
  liveTest("every newsletter parses, each nullable field both null and set", async ({ api }) => {
    const browsed = await api.newsletters.browse({ limit: "all" }).fetch();
    assertOk(browsed);
    // Ghost's default newsletter leaves the nullable fields null; the seed sets them and archives another.
    const variants = await Promise.all(
      browsed.data.map(async ({ id }) => {
        const result = await api.newsletters.read({ id }).fetch();
        assertOk(result);
        return result.data;
      }),
    );
    expect(variants.map((n) => n.id)).toEqual(expect.arrayContaining([seed.full.id, seed.archived.id]));

    expect(nullabilityGaps(schema, variants, NOT_SEEDABLE)).toEqual([]);
  });

  liveTest.runIf(onLatest)("add and edit with every input read back what was sent", async ({ api }) => {
    const add = {
      ...fullNewsletterInput(uniqueSuffix()),
      sender_email: null,
      status: "active" as const,
    };
    const added = await api.newsletters.add(add, { opt_in_existing: false });
    assertOk(added);
    const read = async () => {
      const result = await api.newsletters.read({ id: added.data.id }).fetch();
      assertOk(result);
      return result.data;
    };
    expect(await read()).toMatchObject(readBack(add));

    const edit = {
      ...fullNewsletterInput(uniqueSuffix()),
      status: "archived",
      title_font_category: "serif",
      body_font_category: "serif",
      title_alignment: "center",
      show_badge: true,
      // Ghost puts a new newsletter last, whatever the add says.
      sort_order: 0,
    } as const;
    assertOk(await api.newsletters.edit(added.data.id, edit));
    expect(await read()).toMatchObject(readBack(edit));

    // The client has no newsletter delete; the archived newsletter stays.
    expect(unsentInputs(adminNewsletterCreateSchema, add, edit)).toEqual([]);
  });
});
