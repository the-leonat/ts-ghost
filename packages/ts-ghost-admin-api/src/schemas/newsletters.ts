import { z } from "zod";
import { baseNewsletterSchema, ghostObject, perTarget, type SchemaTarget } from "@ts-ghost/core-api";

/** A newsletter as the Admin API sends it, with its design and feedback settings, for a schema target. */
export const adminNewsletterSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "admin.newsletters", {
    ...baseNewsletterSchema.shape,
    background_color: z.string(),
    button_color: z.string().nullable(),
    button_corners: z.string(),
    button_style: z.string(),
    divider_color: z.string().nullable(),
    header_background_color: z.string(),
    image_corners: z.string(),
    link_color: z.string().nullable(),
    link_style: z.string(),
    post_title_color: z.string().nullable(),
    section_title_color: z.string().nullable(),
    title_font_weight: z.string(),
    feedback_enabled: z.boolean(),
    show_comment_cta: z.boolean(),
    show_excerpt: z.boolean(),
    show_latest_posts: z.boolean(),
    show_post_title_section: z.boolean(),
    show_share_button: z.boolean(),
    show_subscription_details: z.boolean(),
  }),
);

/** The v6-compat newsletter schema. */
export const adminNewsletterSchema = adminNewsletterSchemaFor("v6-compat");

export type Newsletter<T extends SchemaTarget = "v6-compat"> = z.infer<
  ReturnType<typeof adminNewsletterSchemaFor<T>>
>;

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
