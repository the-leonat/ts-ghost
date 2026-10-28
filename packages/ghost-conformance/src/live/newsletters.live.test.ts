import { beforeAll, describe, expect } from "vitest";

import { fullNewsletterInput, seedNewsletters } from "../seeds/newsletters.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("newsletters", () => {
  let seeded: Awaited<ReturnType<typeof seedNewsletters>>;
  beforeAll(async () => {
    seeded = await seedNewsletters();
  });

  liveTest(
    "GET /newsletters/ lists active and archived newsletters, with null and set fields",
    async ({ api }) => {
      const result = await api.newsletters.browse({ limit: "all" }).fetch();
      assertOk(result);

      expect(new Set(result.data.map((n) => n.status))).toEqual(new Set(["active", "archived"]));
      expect(result.data.some((n) => n.description === null && n.header_image === null)).toBe(true);
      expect(result.data.find((n) => n.id === seeded.full.id)).toMatchObject({
        description: seeded.full.description,
        header_image: seeded.full.header_image,
      });
    },
  );

  liveTest("GET /newsletters/:id/ returns the newsletter", async ({ api }) => {
    const result = await api.newsletters.read({ id: seeded.archived.id }).fetch();
    assertOk(result);

    expect(result.data).toEqual(seeded.archived);
  });

  // Deprecated: Ghost has no /newsletters/slug/:slug/ route, so a read by slug always fails.
  liveTest("the deprecated read by slug fails", async ({ deprecatedApi }) => {
    const result = await deprecatedApi.newsletters.read({ slug: seeded.full.slug }).fetch();
    expect(result).toMatchObject({ success: false, status: 404 });
  });

  liveTest("POST /newsletters/ stores every field it was sent", async ({ api }) => {
    const input = fullNewsletterInput(uniqueSuffix());
    const added = await api.newsletters.add(input, { opt_in_existing: false });
    assertOk(added);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(input);
  });

  liveTest("POST /newsletters/ accepts a newsletter with a name only", async ({ api }) => {
    const name = `Name only ${uniqueSuffix()}`;
    const added = await api.newsletters.add({ name });
    assertOk(added);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data.name).toBe(name);
  });

  liveTest("PUT /newsletters/:id/ persists the edit", async ({ api }) => {
    const added = await api.newsletters.add({
      name: `Edit me ${uniqueSuffix()}`,
      sender_name: "Before",
    });
    assertOk(added);

    const edit = { name: `${added.data.name} edited`, sender_name: "After", description: "Edited" };
    const edited = await api.newsletters.edit(added.data.id, edit);
    assertOk(edited);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(edit);
  });

  liveTest("newsletter responses send no key the client's schema lacks", async ({ api }) => {
    const browsed = await api.newsletters.browse({ limit: "all" }).fetch();
    const read = await api.newsletters.read({ id: seeded.full.id }).fetch();
    const name = `Key check ${uniqueSuffix()}`;
    const added = await api.newsletters.add({ name, sender_name: "Key check" });
    assertOk(added);
    // Edits the newsletter added here: the seed's values are asserted by other tests.
    const edited = await api.newsletters.edit(added.data.id, { description: "Edited for the key check" });

    expect(undeclaredKeys(browsed, read, added, edited)).toEqual([]);
  });
});
