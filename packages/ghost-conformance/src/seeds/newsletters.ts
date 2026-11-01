// Seeds a newsletter with every field set and an archived one.

import { adminApi, type LiveGhost } from "../ghost/admin-client.ts";
import { must, uniqueSuffix } from "./helpers.ts";

/** Optional newsletter fields with a value; Ghost's default newsletter leaves the nullable ones null. */
export const fullNewsletterInput = (suffix: string) => ({
  name: `Seeded newsletter ${suffix}`,
  description: "A newsletter with its optional fields set.",
  sender_name: "Seeded Sender",
  sender_reply_to: "newsletter",
  subscribe_on_signup: false,
  header_image: "https://example.com/newsletter-header.png",
  show_header_icon: false,
  show_header_title: false,
  title_font_category: "sans_serif" as const,
  title_alignment: "left",
  show_feature_image: false,
  body_font_category: "sans_serif" as const,
  footer_content: "<p>Seeded footer</p>",
  show_badge: false,
  show_header_name: false,
});

/** Seeds an active newsletter with values and an archived one, next to Ghost's default newsletter. */
export async function seedNewsletters(ghost: LiveGhost) {
  const api = adminApi(ghost, ghost.leg);
  const suffix = uniqueSuffix();
  const full = must(await api.newsletters.add(fullNewsletterInput(suffix)), "full newsletter");
  const toArchive = must(
    await api.newsletters.add({ name: `Archived newsletter ${suffix}`, sender_name: "Archived Sender" }),
    "newsletter to archive",
  );
  const archived = must(
    await api.newsletters.edit(toArchive.id, { status: "archived" }),
    "archived newsletter",
  );
  return { full, archived };
}
