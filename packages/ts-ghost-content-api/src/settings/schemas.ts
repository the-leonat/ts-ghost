import { z } from "zod";

export const settingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  icon: z.string().nullable(),
  accent_color: z.string().nullable(),
  cover_image: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  threads: z.string().nullable().optional(), // since 6.36
  bluesky: z.string().nullable().optional(), // since 6.36
  mastodon: z.string().nullable().optional(), // since 6.36
  tiktok: z.string().nullable().optional(), // since 6.36
  youtube: z.string().nullable().optional(), // since 6.36
  instagram: z.string().nullable().optional(), // since 6.36
  linkedin: z.string().nullable().optional(), // since 6.36
  lang: z.string(),
  locale: z.string(),
  timezone: z.string(),
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable(),
  navigation: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ),
  secondary_navigation: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable(),
  members_support_address: z.string(),
  members_enabled: z.boolean(),
  donations_enabled: z.boolean(),
  allow_self_signup: z.boolean(),
  members_invite_only: z.boolean(),
  members_signup_access: z.string(),
  paid_members_enabled: z.boolean(),
  firstpromoter_account: z.string().nullable(),
  portal_button_style: z.string(),
  portal_button_signup_text: z.string(),
  portal_button_icon: z.string().nullable(),
  portal_signup_terms_html: z.string().nullable(),
  portal_signup_checkbox_required: z.boolean(),
  portal_signup_gift_promotion: z.boolean().optional(), // since 6.60
  portal_account_gift_promotion: z.boolean().optional(), // since 6.60
  portal_plans: z.array(z.string()),
  portal_default_plan: z.string(),
  portal_name: z.boolean(),
  portal_button: z.boolean(),
  comments_enabled: z.string(),
  recommendations_enabled: z.boolean(),
  outbound_link_tagging: z.boolean(),
  default_email_address: z.string(),
  support_email_address: z.string(),
  editor_default_email_recipients: z.string(),
  labs: z.record(z.string(), z.unknown()),
  transistor_portal_enabled: z.boolean().optional(), // since 6.19
  transistor_portal_heading: z.string().nullable().optional(), // since 6.19
  transistor_portal_description: z.string().nullable().optional(), // since 6.19
  transistor_portal_button_text: z.string().nullable().optional(), // since 6.19
  transistor_portal_url_template: z.string().nullable().optional(), // since 6.19
  site_uuid: z.string(),
  version: z.string(),
  url: z.string(),
});

export type Settings = z.infer<typeof settingsSchema>;
