import { z } from "zod";
import { baseNewsletterSchema } from "@ts-ghost/core-api";

const design = z.string().nullish();
const flag = z.boolean().optional();

/** A newsletter as the Admin API sends it, with Ghost 6's design and feedback settings (optional for older Ghost). */
export const adminNewsletterSchema = baseNewsletterSchema.extend({
  background_color: design,
  button_color: design,
  button_corners: design,
  button_style: design,
  divider_color: design,
  header_background_color: design,
  image_corners: design,
  link_color: design,
  link_style: design,
  post_title_color: design,
  section_title_color: design,
  title_font_weight: design,
  feedback_enabled: flag,
  show_comment_cta: flag,
  show_excerpt: flag,
  show_latest_posts: flag,
  show_post_title_section: flag,
  show_share_button: flag,
  show_subscription_details: flag,
});

export type Newsletter = z.infer<typeof adminNewsletterSchema>;

export const adminNewsletterCreateSchema = z.object({
  name: z.string(),
  description: z.string().max(3000).optional(),
  sender_name: z.string().nullish(),
  sender_email: z.email().nullish(),
  sender_reply_to: z.string().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
  subscribe_on_signup: z.boolean().optional(),
  sort_order: z.number().optional(),
  header_image: z.string().url().nullish(),
  show_header_icon: z.boolean().optional(),
  show_header_title: z.boolean().optional(),
  title_font_category: z.union([z.literal("sans_serif"), z.literal("serif")]).optional(),
  title_alignment: z.string().optional(),
  show_feature_image: z.boolean().optional(),
  body_font_category: z.union([z.literal("sans_serif"), z.literal("serif")]).optional(),
  footer_content: z.string().nullish(),
  show_badge: z.boolean().optional(),
  show_header_name: z.boolean().optional(),
});
