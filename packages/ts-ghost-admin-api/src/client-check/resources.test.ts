import { assert, describe, expect, test } from "vitest";

import { fixtureId } from "./fixture-server";
import { useClientCheck } from "./harness";

const BY_SLUG = { order: "slug asc" } as const;

describe("client check: posts", () => {
  const check = useClientCheck();

  test("browse returns the seeded posts, every status Ghost seeds", async () => {
    const result = await check.api.posts.browse(BY_SLUG).fetch();

    assert(result.success);
    expect(result.data.length).toBeGreaterThan(0);
    expect(new Set(result.data.map((post) => post.status))).toEqual(
      new Set(["published", "draft", "scheduled"]),
    );
    expect(result.data.map((post) => post.visibility)).toContain("paid");
  });

  test("browse with authors and tags included", async () => {
    const result = await check.api.posts.browse(BY_SLUG).include({ authors: true, tags: true }).fetch();

    assert(result.success);
    expect(result.data.some((post) => post.tags.length > 0)).toBe(true);
    expect(result.data.every((post) => post.authors.length > 0)).toBe(true);
  });

  test("browse with html and plaintext formats", async () => {
    const result = await check.api.posts.browse(BY_SLUG).formats({ html: true, plaintext: true }).fetch();

    assert(result.success);
    expect(result.data.some((post) => post.html !== null && post.html !== "")).toBe(true);
  });

  test("read by id and by slug return the same seeded post", async () => {
    const byId = await check.api.posts.read({ id: fixtureId("posts.seeded") }).fetch();
    const bySlug = await check.api.posts.read({ slug: "design" }).fetch();

    assert(byId.success && bySlug.success);
    expect(byId.data.id).toBe(fixtureId("posts.seeded"));
    expect(bySlug.data).toEqual(byId.data);
  });

  test("add, edit, read and delete a post the walk created", async () => {
    const added = await check.api.posts.add({ title: "ts-ghost recorder post" });
    assert(added.success);
    expect(added.data).toMatchObject({ id: fixtureId("posts.created"), status: "draft" });

    const edited = await check.api.posts.edit(added.data.id, {
      title: "ts-ghost recorder post, edited",
      updated_at: new Date(added.data.updated_at ?? ""),
    });
    assert(edited.success);
    expect(edited.data.title).toBe("ts-ghost recorder post, edited");

    const read = await check.api.posts.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data.title).toBe("ts-ghost recorder post, edited");

    expect(await check.api.posts.delete(added.data.id)).toEqual({ success: true });
  });
});

describe("client check: pages", () => {
  const check = useClientCheck();

  test("browse, and read by id and by slug", async () => {
    const browsed = await check.api.pages.browse(BY_SLUG).fetch();
    const byId = await check.api.pages.read({ id: fixtureId("pages.seeded") }).fetch();
    const bySlug = await check.api.pages.read({ slug: "about" }).fetch();

    assert(browsed.success && byId.success && bySlug.success);
    expect(browsed.data.map((page) => page.slug)).toContain("about");
    expect(bySlug.data).toEqual(byId.data);
  });

  test("add, edit, read and delete a page the walk created", async () => {
    const added = await check.api.pages.add({ title: "ts-ghost recorder page" });
    assert(added.success);
    const edited = await check.api.pages.edit(added.data.id, {
      title: "ts-ghost recorder page, edited",
      updated_at: new Date(added.data.updated_at ?? ""),
    });
    const read = await check.api.pages.read({ id: added.data.id }).fetch();

    assert(edited.success && read.success);
    expect(read.data.title).toBe("ts-ghost recorder page, edited");
    expect(await check.api.pages.delete(added.data.id)).toEqual({ success: true });
  });
});

describe("client check: tags", () => {
  const check = useClientCheck();

  test("browse, with the post count included", async () => {
    const plain = await check.api.tags.browse(BY_SLUG).fetch();
    const counted = await check.api.tags.browse(BY_SLUG).include({ "count.posts": true }).fetch();

    assert(plain.success && counted.success);
    expect(counted.data.map((tag) => tag.slug)).toEqual(plain.data.map((tag) => tag.slug));
    expect(counted.data.some((tag) => (tag.count?.posts ?? 0) > 0)).toBe(true);
  });

  test("read by id and by slug", async () => {
    const byId = await check.api.tags.read({ id: "9451f5fca366002ebd5dbea6" }).fetch();
    const bySlug = await check.api.tags.read({ slug: "bacon" }).fetch();

    assert(byId.success && bySlug.success);
    expect(byId.data).toEqual(bySlug.data);
  });

  test("add, edit, read and delete a tag the walk created", async () => {
    const added = await check.api.tags.add({ name: "ts-ghost recorder tag" });
    assert(added.success);
    const edited = await check.api.tags.edit(added.data.id, { name: "ts-ghost recorder tag, edited" });
    const read = await check.api.tags.read({ id: added.data.id }).fetch();

    assert(edited.success && read.success);
    expect(read.data.name).toBe("ts-ghost recorder tag, edited");
    expect(await check.api.tags.delete(added.data.id)).toEqual({ success: true });
  });
});

describe("client check: labels", () => {
  const check = useClientCheck();

  test("browse returns the seeded labels", async () => {
    const result = await check.api.labels.browse(BY_SLUG).fetch();

    assert(result.success);
    expect(result.data.map((label) => label.slug)).toEqual(["label-1", "vip"]);
  });

  test("browse with the member count included", async () => {
    const result = await check.api.labels.browse(BY_SLUG).include({ "count.members": true }).fetch();

    assert(result.success);
    expect(result.data.map((label) => label.slug)).toEqual(["label-1", "vip"]);
    expect(result.data.every((label) => typeof label.count?.members === "number")).toBe(true);
    expect(result.data.some((label) => (label.count?.members ?? 0) > 0)).toBe(true);
  });

  test("read by id and by slug return the same seeded label", async () => {
    const byId = await check.api.labels.read({ id: fixtureId("labels.seeded") }).fetch();
    const bySlug = await check.api.labels.read({ slug: "label-1" }).fetch();

    assert(byId.success && bySlug.success);
    expect(byId.data).toMatchObject({ id: fixtureId("labels.seeded"), name: "Label 1" });
    expect(bySlug.data).toEqual(byId.data);
  });

  test("add, edit, read and delete a label the walk created", async () => {
    const added = await check.api.labels.add({ name: "ts-ghost recorder label" });
    assert(added.success);
    expect(added.data).toMatchObject({ id: fixtureId("labels.created"), slug: "ts-ghost-recorder-label" });

    const edited = await check.api.labels.edit(added.data.id, { name: "ts-ghost recorder label, edited" });
    assert(edited.success);
    expect(edited.data.name).toBe("ts-ghost recorder label, edited");

    const read = await check.api.labels.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data.name).toBe("ts-ghost recorder label, edited");

    // Ghost answers the delete with 204 and no body.
    expect(await check.api.labels.delete(added.data.id)).toEqual({ success: true });
  });
});

describe("client check: newsletters", () => {
  const check = useClientCheck();

  test("browse returns active and archived newsletters, and read by id", async () => {
    const browsed = await check.api.newsletters.browse(BY_SLUG).fetch();
    const read = await check.api.newsletters.read({ id: fixtureId("newsletters.seeded") }).fetch();

    assert(browsed.success && read.success);
    expect(new Set(browsed.data.map((newsletter) => newsletter.status))).toEqual(
      new Set(["active", "archived"]),
    );
    expect(read.data.slug).toBe("daily-newsletter");
  });

  test("add, edit and read a newsletter the walk created", async () => {
    const added = await check.api.newsletters.add({ name: "ts-ghost recorder newsletter" });
    assert(added.success);
    const edited = await check.api.newsletters.edit(added.data.id, {
      name: "ts-ghost recorder newsletter, edited",
    });
    const read = await check.api.newsletters.read({ id: added.data.id }).fetch();

    assert(edited.success && read.success);
    expect(read.data.name).toBe("ts-ghost recorder newsletter, edited");
  });
});

describe("client check: users", () => {
  const check = useClientCheck();

  test("browse returns the seeded staff, including one who is not active", async () => {
    const result = await check.api.users.browse(BY_SLUG).fetch();

    assert(result.success);
    expect(result.data.map((user) => user.status)).toContain("inactive");
  });

  // Ghost also registers GET /users/slug/:slug (recorded); the client offers id and email only.
  test("read by id and by email return the same user", async () => {
    const byId = await check.api.users.read({ id: "6193c6bae792de832cd08146" }).fetch();
    const byEmail = await check.api.users.read({ email: "contributor@ghost.org" }).fetch();

    assert(byId.success && byEmail.success);
    expect(byEmail.data).toEqual(byId.data);
  });
});

describe("client check: settings and site", () => {
  const check = useClientCheck();

  test("settings returns every setting as a key and value", async () => {
    const result = await check.api.settings.fetch();

    assert(result.success);
    expect(result.data.find((setting) => setting.key === "title")).toEqual({ key: "title", value: "Ghost" });
  });
});
