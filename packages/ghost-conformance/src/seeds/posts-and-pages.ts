// Seeds full and bare posts and pages, and a post sent as a newsletter.

import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { adminApi, type LiveGhost } from "../ghost/admin-client.ts";
import { must, uniqueSuffix } from "./helpers.ts";

/** Every scalar a post and a page share, set, so each nullable output field comes back non-null. */
export function fullScalars(suffix: string) {
  return {
    title: `Full ${suffix}`,
    slug: `full-${suffix}`,
    feature_image: "https://example.com/feature.png",
    feature_image_alt: "Feature alt",
    feature_image_caption: "Feature caption",
    featured: true,
    status: "published",
    meta_title: "Meta title",
    meta_description: "Meta description",
    custom_excerpt: "Custom excerpt",
    codeinjection_head: "<style>.head{}</style>",
    codeinjection_foot: "<script>void 0</script>",
    og_image: "https://example.com/og.png",
    og_title: "OG title",
    og_description: "OG description",
    twitter_image: "https://example.com/twitter.png",
    twitter_title: "Twitter title",
    twitter_description: "Twitter description",
    custom_template: "custom-full",
    canonical_url: "https://example.com/canonical",
  } as const;
}

/** Body that lexical's html source turns into the content the formats checks look for. */
export const FULL_HTML = "<p>Hello <strong>world</strong></p>";

/** The paid tier every fresh Ghost has; it fills `tiers` on tier-gated content. */
export async function paidTierId(api: TSGhostAdminAPI<any, "latest">): Promise<string> {
  const tiers = await api.tiers.browse({ filter: "slug:default-product" }).fetch();
  const paid = tiers.success ? tiers.data[0] : undefined;
  if (!paid) throw new Error("Fresh Ghost has no paid tier");
  return paid.id;
}

/** A full post or page: every nullable field set, with tags, tiers and content. */
const fullContent = (suffix: string, tierId: string) => ({
  ...fullScalars(suffix),
  visibility: "tiers" as const,
  tiers: [{ id: tierId }],
  tags: [{ name: `Tag ${suffix}` }],
  html: FULL_HTML,
});

/** Posts through the client: a full one, a bare draft (every nullable field null) and one sent as a newsletter. */
export async function seedPosts(ghost: LiveGhost) {
  const api = adminApi(ghost, ghost.leg);
  const suffix = uniqueSuffix();
  const tierId = await paidTierId(api);
  const full = must(
    await api.posts.add(
      { ...fullContent(suffix, tierId), email_subject: "Email subject" },
      { source: "html" },
    ),
    "full post",
  );
  const bare = must(await api.posts.add({ title: `Bare ${suffix}` }), "bare post");
  const draft = must(await api.posts.add({ title: `Emailed ${suffix}` }), "emailed post");
  // Publishing with a newsletter creates the post's email; with no member in the segment it is never sent.
  const emailed = must(
    await api.posts.edit(
      draft.id,
      { status: "published", updated_at: new Date(draft.updated_at ?? "") },
      { newsletter: "default-newsletter", email_segment: "label:ts-ghost-nobody" },
    ),
    "emailed post",
  );
  return { suffix, tierId, full, bare, emailed };
}

/** Pages through the client: a full one, a bare draft and a bare published one, which the Content API sees. */
export async function seedPages(ghost: LiveGhost) {
  const api = adminApi(ghost, ghost.leg);
  const suffix = uniqueSuffix();
  const tierId = await paidTierId(api);
  const full = must(await api.pages.add(fullContent(suffix, tierId), { source: "html" }), "full page");
  const bare = must(await api.pages.add({ title: `Bare ${suffix}` }), "bare page");
  const published = must(
    await api.pages.add({ title: `Published ${suffix}`, status: "published" }),
    "published bare page",
  );
  return { suffix, tierId, full, bare, published };
}
