import { beforeAll, describe, expect, test } from "vitest";

import { fullNewsletterInput, seedNewsletters } from "../seeds/newsletters.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

describe("newsletters", () => {
  liveResponses({ ignore: IGNORED });
  let seeded: Awaited<ReturnType<typeof seedNewsletters>>;
  beforeAll(async () => {
    seeded = await seedNewsletters();
  });

  test("GET /newsletters/ lists active and archived newsletters, with null and set fields", async () => {
    const result = await adminApi().newsletters.browse({ limit: "all" }).fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(new Set(result.data.map((n) => n.status))).toEqual(new Set(["active", "archived"]));
    expect(result.data.some((n) => n.description === null && n.header_image === null)).toBe(true);
    expect(result.data.find((n) => n.id === seeded.full.id)).toMatchObject({
      description: seeded.full.description,
      header_image: seeded.full.header_image,
    });
  });

  test("GET /newsletters/:id/ returns the newsletter", async () => {
    const result = await adminApi().newsletters.read({ id: seeded.archived.id }).fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data).toEqual(seeded.archived);
  });

  // Deprecated: Ghost has no /newsletters/slug/:slug/ route, so a read by slug always fails.
  test("the deprecated read by slug fails", async () => {
    const result = await adminApi().newsletters.read({ slug: seeded.full.slug }).fetch();
    expect(result).toMatchObject({ success: false, status: 404 });
  });

  test("POST /newsletters/ stores every field it was sent", async () => {
    const api = adminApi();
    const input = fullNewsletterInput(uniqueSuffix());
    const added = await api.newsletters.add(input, { opt_in_existing: false });
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    if (!read.success) throw new Error(JSON.stringify(read.errors));
    expect(read.data).toMatchObject(input);
  });

  test("POST /newsletters/ accepts a newsletter with a name only", async () => {
    const api = adminApi();
    const name = `Name only ${uniqueSuffix()}`;
    const added = await api.newsletters.add({ name });
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    if (!read.success) throw new Error(JSON.stringify(read.errors));
    expect(read.data.name).toBe(name);
  });

  test("PUT /newsletters/:id/ persists the edit", async () => {
    const api = adminApi();
    const added = await api.newsletters.add({
      name: `Edit me ${uniqueSuffix()}`,
      sender_name: "Before",
    });
    if (!added.success) throw new Error(JSON.stringify(added.errors));

    const edit = { name: `${added.data.name} edited`, sender_name: "After", description: "Edited" };
    const edited = await api.newsletters.edit(added.data.id, edit);
    if (!edited.success) throw new Error(JSON.stringify(edited.errors));

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    if (!read.success) throw new Error(JSON.stringify(read.errors));
    expect(read.data).toMatchObject(edit);
  });

  test("newsletter responses send no key the client's schema lacks", async () => {
    const api = adminApi();
    const id = seeded.full.id;
    const browsed = await api.newsletters.browse({ limit: "all" }).fetch();
    const read = await api.newsletters.read({ id }).fetch();
    const edited = await api.newsletters.edit(id, { description: "Edited for the key check" });
    const name = `Key check ${uniqueSuffix()}`;
    const added = await api.newsletters.add({ name, sender_name: "Key check" });

    expect(undeclaredKeys(browsed, read, edited, added)).toEqual([]);
    expect([browsed, read, edited, added].map((r) => r.success)).toEqual([true, true, true, true]);
  });
});
