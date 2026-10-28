import { assert, beforeAll, describe, expect, inject, onTestFinished, test } from "vitest";

import { FULL_HTML, fullScalars, seedPosts, seedPostWithInactiveAuthor } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
beforeAll(async () => {
  seed = await seedPosts(adminApi());
});

// Scoped to this file's seed: the SQL email seed adds posts whose email the client can't parse.
const seededOnly = (): `id:[${string}]` =>
  `id:[${[seed.full, seed.bare, seed.scheduled, seed.paid, seed.emailed].map((p) => p.id).join(",")}]`;

describe("posts", () => {
  liveResponses({ ignore: IGNORED });

  test("browse returns every status and a paid post", async () => {
    const result = await adminApi().posts.browse({ limit: "all", filter: seededOnly() }).fetch();

    assert(result.success);
    const byId = new Map(result.data.map((post) => [post.id, post]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
    expect(byId.get(seed.scheduled.id)?.status).toBe("scheduled");
    expect(byId.get(seed.paid.id)?.visibility).toBe("paid");
  });

  test("browse with authors, tags and tiers included populates every relation", async () => {
    const result = await adminApi()
      .posts.browse({ limit: "all", filter: seededOnly() })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assert(result.success);
    expect(result.data.every((post) => post.authors.length > 0)).toBe(true);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Post tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Post tag ${seed.suffix}`);
  });

  test("browse with the html format returns content", async () => {
    const result = await adminApi()
      .posts.browse({ limit: "all", filter: seededOnly() })
      .formats({ html: true })
      .fetch();

    assert(result.success);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.html).toBe("<p>Hello <strong>world</strong></p>");
  });

  test("browse with the plaintext format returns content", async () => {
    const result = await adminApi()
      .posts.browse({ limit: "all", filter: seededOnly() })
      .formats({ plaintext: true })
      .fetch();

    assert(result.success);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.plaintext).toBe("Hello world");
  });

  test("read with the plaintext format returns content", async () => {
    const result = await adminApi().posts.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assert(result.success);
    expect(result.data.plaintext).toBe("Hello world");
  });

  test("read by slug equals read by id", async () => {
    const byId = await adminApi().posts.read({ id: seed.full.id }).fetch();
    const bySlug = await adminApi().posts.read({ slug: seed.full.slug }).fetch();

    assert(byId.success && bySlug.success);
    expect(byId.data.id).toBe(seed.full.id);
    // A post lists every tier, which the tiers seed adds and renames concurrently; compare all else.
    expect(bySlug.data).toEqual({ ...byId.data, tiers: expect.any(Array) });
  });

  test("nullable fields come back null on a bare post and set on a full post", async () => {
    const bare = await adminApi().posts.read({ id: seed.bare.id }).fetch();
    const full = await adminApi().posts.read({ id: seed.full.id }).fetch();

    assert(bare.success && full.success);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  test("a post sent as a newsletter reads back its email and newsletter", async () => {
    const result = await adminApi().posts.read({ id: seed.emailed.id }).fetch();

    assert(result.success);
    expect(result.data.newsletter?.slug).toBe("default-newsletter");
    expect(result.data.email?.subject).toBe(`Emailed ${seed.suffix}`);
  });

  test("add reads back every value sent", async () => {
    const suffix = uniqueSuffix();
    const added = await adminApi().posts.add(
      {
        ...fullScalars(suffix),
        email_subject: "Email subject",
        visibility: "tiers",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added tag ${suffix}` }],
        authors: [{ email: inject("ghost").owner.email }],
        html: FULL_HTML,
      },
      { source: "html" },
    );
    assert(added.success);

    const read = await adminApi().posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), email_subject: "Email subject" });
    expect(read.data.visibility).toBe("tiers");
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([inject("ghost").owner.email]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  test("add reads back a scheduled post's publish date", async () => {
    const publishedAt = new Date("2099-01-02T03:04:05.000Z");
    const added = await adminApi().posts.add({
      title: `Scheduled ${uniqueSuffix()}`,
      status: "scheduled",
      published_at: publishedAt,
    });
    assert(added.success);

    const read = await adminApi().posts.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ status: "scheduled", published_at: publishedAt.toISOString() });
  });

  // mobiledoc input is deprecated: Ghost 6 stores lexical only.
  test("add ignores the deprecated mobiledoc", async () => {
    const added = await adminApi().posts.add({ title: `Mobiledoc ${uniqueSuffix()}`, mobiledoc: MOBILEDOC });
    assert(added.success);

    const read = await adminApi().posts.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data.mobiledoc).toBeNull();
  });

  // locale input is deprecated: posts have no locale in Ghost.
  test("add ignores the deprecated locale", async () => {
    const added = await adminApi().posts.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assert(added.success);

    const read = await adminApi().posts.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data).not.toHaveProperty("locale");
  });

  test("edit persists every value sent", async () => {
    const suffix = uniqueSuffix();
    const added = await adminApi().posts.add({ title: `To edit ${suffix}` });
    assert(added.success);

    const edited = await adminApi().posts.edit(
      added.data.id,
      {
        ...fullScalars(suffix),
        email_subject: "Edited subject",
        visibility: "members",
        tags: [{ name: `Edited tag ${suffix}` }],
        html: FULL_HTML,
        updated_at: new Date(added.data.updated_at ?? ""),
      },
      { source: "html" },
    );
    assert(edited.success);

    const read = await adminApi().posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({
      ...fullScalars(suffix),
      email_subject: "Edited subject",
      visibility: "members",
    });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  // An email-only post can't be scheduled on add: Ghost reads the newsletter only from edit's option.
  test("add can't schedule an email-only post: Ghost answers that it needs a newsletter", async () => {
    const added = await adminApi().posts.add({
      title: `Email only ${uniqueSuffix()}`,
      email_only: true,
      status: "scheduled",
      published_at: new Date("2099-01-01T00:00:00.000Z"),
    });
    expect(added).toMatchObject({ success: false, status: 422, errors: [{ type: "ValidationError" }] });
  });

  test("edit's newsletter option schedules an email-only post", async () => {
    const draft = await adminApi().posts.add({ title: `Email only ${uniqueSuffix()}`, email_only: true });
    assert(draft.success);

    const scheduled = await adminApi().posts.edit(
      draft.data.id,
      {
        status: "scheduled",
        published_at: new Date("2099-01-01T00:00:00.000Z"),
        updated_at: new Date(draft.data.updated_at ?? ""),
      },
      { newsletter: "default-newsletter" },
    );
    assert(scheduled.success);
    expect(scheduled.data).toMatchObject({ status: "scheduled", email_only: true });
    expect(scheduled.data.newsletter?.slug).toBe("default-newsletter");
  });

  // PhilDL/ts-ghost#320: an explicit include dropped Ghost's default authors, and a sent post's status failed.
  test("read by slug with tags included parses an email-only post Ghost has sent", async () => {
    const draft = await adminApi().posts.add({ title: `Email only ${uniqueSuffix()}`, email_only: true });
    assert(draft.success);
    const sent = await adminApi().posts.edit(
      draft.data.id,
      { status: "published", updated_at: new Date(draft.data.updated_at ?? "") },
      // A segment no member matches, so the email reaches no other file's members.
      { newsletter: "default-newsletter", email_segment: "label:ts-ghost-nobody" },
    );
    assert(sent.success);
    expect(sent.data.status).toBe("sent");

    const result = await adminApi().posts.read({ slug: sent.data.slug }).include({ tags: true }).fetch();
    assert(result.success, JSON.stringify(!result.success && result.errors));
    expect(result.data.status).toBe("sent");
    expect(result.data.authors.map((author) => author.email)).toEqual([inject("ghost").owner.email]);
    expect(result.data.primary_author.email).toBe(inject("ghost").owner.email);
  });

  test("delete removes the post", async () => {
    const added = await adminApi().posts.add({ title: `To delete ${uniqueSuffix()}` });
    assert(added.success);

    expect(await adminApi().posts.delete(added.data.id)).toEqual({ success: true });
    const read = await adminApi().posts.read({ id: added.data.id }).fetch();
    expect(read).toMatchObject({ success: false, status: 404 });
  });

  test("read reports a post's inactive author", async () => {
    const { post, remove } = await seedPostWithInactiveAuthor(adminApi());
    onTestFinished(remove);

    const result = await adminApi().posts.read({ id: post.id }).fetch();
    assert(result.success);
    expect(result.data.primary_author.status).toBe("inactive");
    expect(result.data.authors.map((author) => author.status)).toEqual(["inactive"]);
  });
});

describe("posts: unknown keys", () => {
  liveResponses({ ignore: IGNORED });

  test("authors carry no key the client's schema lacks", async () => {
    const api = adminApi();
    const browsed = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .include({ authors: true, tags: true, tiers: true })
      .formats({ html: true })
      .fetch();
    const read = await api.posts.read({ id: seed.full.id }).fetch();
    const added = await api.posts.add({ title: `Unknown keys ${uniqueSuffix()}` });
    const edited =
      added.success &&
      (await api.posts.edit(added.data.id, {
        title: "Edited",
        updated_at: new Date(added.data.updated_at ?? ""),
      }));

    const unknown = undeclaredKeys(browsed, read, added, edited);
    expect(unknown.filter((k) => /^posts\[\]\.(authors\[\]|primary_author)\./.test(k))).toEqual([]);
  });

  test("a sent post's email carries no key the client's schema lacks", async () => {
    const unknown = undeclaredKeys(await adminApi().posts.read({ id: seed.emailed.id }).fetch());
    expect(unknown.filter((k) => k.startsWith("posts[].email."))).toEqual([]);
  });

  test("a sent post's newsletter carries no key the client's schema lacks", async () => {
    const unknown = undeclaredKeys(await adminApi().posts.read({ id: seed.emailed.id }).fetch());
    expect(unknown.filter((k) => k.startsWith("posts[].newsletter."))).toEqual([]);
  });
});

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

const MOBILEDOC = JSON.stringify({
  version: "0.3.1",
  atoms: [],
  cards: [],
  markups: [],
  sections: [[1, "p", [[0, [], 0, "Hello mobiledoc"]]]],
});

// Every nullable field a post output has that the client's inputs can set.
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
  "email_subject",
  "primary_tag",
  "excerpt",
] as const;
