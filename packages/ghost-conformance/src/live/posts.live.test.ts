import { beforeAll, describe, expect, inject, onTestFinished } from "vitest";

import { FULL_HTML, fullScalars, seedPosts, seedPostWithInactiveAuthor } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, requireBehaviour } from "./ghost.ts";
import { assertOk, liveTest } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
beforeAll(async () => {
  seed = await seedPosts(adminApi());
});

// Scoped to this file's seed: the SQL email seed adds posts whose email the client can't parse.
const seededOnly = (): `id:[${string}]` =>
  `id:[${[seed.full, seed.bare, seed.scheduled, seed.paid, seed.emailed].map((p) => p.id).join(",")}]`;

describe("posts", () => {
  liveTest("browse returns every status and a paid post", async ({ api }) => {
    const result = await api.posts.browse({ limit: "all", filter: seededOnly() }).fetch();

    assertOk(result);
    const byId = new Map(result.data.map((post) => [post.id, post]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
    expect(byId.get(seed.scheduled.id)?.status).toBe("scheduled");
    expect(byId.get(seed.paid.id)?.visibility).toBe("paid");
  });

  liveTest("browse with authors, tags and tiers included populates every relation", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assertOk(result);
    expect(result.data.every((post) => post.authors.length > 0)).toBe(true);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Post tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Post tag ${seed.suffix}`);
  });

  liveTest("browse with the html format returns content", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .formats({ html: true })
      .fetch();

    assertOk(result);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.html).toBe("<p>Hello <strong>world</strong></p>");
  });

  liveTest("browse with the plaintext format returns content", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .formats({ plaintext: true })
      .fetch();

    assertOk(result);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.plaintext).toBe("Hello world");
  });

  liveTest("read with the plaintext format returns content", async ({ api }) => {
    const result = await api.posts.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.plaintext).toBe("Hello world");
  });

  liveTest("read by slug equals read by id", async ({ api }) => {
    const byId = await api.posts.read({ id: seed.full.id }).fetch();
    const bySlug = await api.posts.read({ slug: seed.full.slug }).fetch();

    assertOk(byId);

    assertOk(bySlug);
    expect(byId.data.id).toBe(seed.full.id);
    // A post lists every tier, which the tiers seed adds and renames concurrently; compare all else.
    expect(bySlug.data).toEqual({ ...byId.data, tiers: expect.any(Array) });
  });

  liveTest("nullable fields come back null on a bare post and set on a full post", async ({ api }) => {
    const bare = await api.posts.read({ id: seed.bare.id }).fetch();
    const full = await api.posts.read({ id: seed.full.id }).fetch();

    assertOk(bare);

    assertOk(full);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  liveTest("a post sent as a newsletter reads back its email and newsletter", async ({ api }) => {
    const result = await api.posts.read({ id: seed.emailed.id }).fetch();

    assertOk(result);
    expect(result.data.newsletter?.slug).toBe("default-newsletter");
    expect(result.data.email?.subject).toBe(`Emailed ${seed.suffix}`);
  });

  liveTest("add reads back every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.posts.add(
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
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), email_subject: "Email subject" });
    expect(read.data.visibility).toBe("tiers");
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([inject("ghost").owner.email]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  liveTest("add reads back a scheduled post's publish date", async ({ api }) => {
    const publishedAt = new Date("2099-01-02T03:04:05.000Z");
    const added = await api.posts.add({
      title: `Scheduled ${uniqueSuffix()}`,
      status: "scheduled",
      published_at: publishedAt,
    });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ status: "scheduled", published_at: publishedAt.toISOString() });
  });

  // mobiledoc input is deprecated: Ghost 6 stores lexical only.
  liveTest("add ignores the deprecated mobiledoc", async ({ api, deprecatedApi }) => {
    const added = await deprecatedApi.posts.add({
      title: `Mobiledoc ${uniqueSuffix()}`,
      mobiledoc: MOBILEDOC,
    });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data.mobiledoc).toBeNull();
  });

  // locale input is deprecated: posts have no locale in Ghost.
  liveTest("add ignores the deprecated locale", async ({ api, deprecatedApi }) => {
    const added = await deprecatedApi.posts.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).not.toHaveProperty("locale");
  });

  liveTest("edit persists every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.posts.add({ title: `To edit ${suffix}` });
    assertOk(added);

    const edited = await api.posts.edit(
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
    assertOk(edited);

    const read = await api.posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({
      ...fullScalars(suffix),
      email_subject: "Edited subject",
      visibility: "members",
    });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  // An email-only post can't be scheduled on add: Ghost reads the newsletter only from edit's option.
  liveTest(
    "add can't schedule an email-only post: Ghost answers that it needs a newsletter",
    async ({ api, skip }) => {
      requireBehaviour({ skip }, "emailOnlyScheduleNeedsNewsletter");
      const added = await api.posts.add({
        title: `Email only ${uniqueSuffix()}`,
        email_only: true,
        status: "scheduled",
        published_at: new Date("2099-01-01T00:00:00.000Z"),
      });
      expect(added).toMatchObject({ success: false, status: 422, errors: [{ type: "ValidationError" }] });
    },
  );

  liveTest("edit's newsletter option schedules an email-only post", async ({ api }) => {
    const draft = await api.posts.add({ title: `Email only ${uniqueSuffix()}`, email_only: true });
    assertOk(draft);

    const scheduled = await api.posts.edit(
      draft.data.id,
      {
        status: "scheduled",
        published_at: new Date("2099-01-01T00:00:00.000Z"),
        updated_at: new Date(draft.data.updated_at ?? ""),
      },
      { newsletter: "default-newsletter" },
    );
    assertOk(scheduled);
    expect(scheduled.data).toMatchObject({ status: "scheduled", email_only: true });
    expect(scheduled.data.newsletter?.slug).toBe("default-newsletter");
  });

  // PhilDL/ts-ghost#320: an explicit include dropped Ghost's default authors, and a sent post's status failed.
  liveTest("read by slug with tags included parses an email-only post Ghost has sent", async ({ api }) => {
    const draft = await api.posts.add({ title: `Email only ${uniqueSuffix()}`, email_only: true });
    assertOk(draft);
    const sent = await api.posts.edit(
      draft.data.id,
      { status: "published", updated_at: new Date(draft.data.updated_at ?? "") },
      // A segment no member matches, so the email reaches no other file's members.
      { newsletter: "default-newsletter", email_segment: "label:ts-ghost-nobody" },
    );
    assertOk(sent);
    expect(sent.data.status).toBe("sent");

    const result = await api.posts.read({ slug: sent.data.slug }).include({ tags: true }).fetch();
    assertOk(result);
    expect(result.data.status).toBe("sent");
    expect(result.data.authors.map((author) => author.email)).toEqual([inject("ghost").owner.email]);
    expect(result.data.primary_author.email).toBe(inject("ghost").owner.email);
  });

  liveTest("delete removes the post", async ({ api }) => {
    const added = await api.posts.add({ title: `To delete ${uniqueSuffix()}` });
    assertOk(added);

    expect(await api.posts.delete(added.data.id)).toEqual({ success: true });
    const read = await api.posts.read({ id: added.data.id }).fetch();
    expect(read).toMatchObject({ success: false, status: 404 });
  });

  liveTest("read reports a post's inactive author", async ({ api }) => {
    const { post, remove } = await seedPostWithInactiveAuthor(adminApi());
    onTestFinished(remove);

    const result = await api.posts.read({ id: post.id }).fetch();
    assertOk(result);
    expect(result.data.primary_author.status).toBe("inactive");
    expect(result.data.authors.map((author) => author.status)).toEqual(["inactive"]);
  });
});

describe("posts: unknown keys", () => {
  liveTest("authors carry no key the client's schema lacks", async ({ api }) => {
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

  liveTest("a sent post's email carries no key the client's schema lacks", async ({ api }) => {
    const unknown = undeclaredKeys(await api.posts.read({ id: seed.emailed.id }).fetch());
    expect(unknown.filter((k) => k.startsWith("posts[].email."))).toEqual([]);
  });

  liveTest("a sent post's newsletter carries no key the client's schema lacks", async ({ api }) => {
    const unknown = undeclaredKeys(await api.posts.read({ id: seed.emailed.id }).fetch());
    expect(unknown.filter((k) => k.startsWith("posts[].newsletter."))).toEqual([]);
  });
});

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
