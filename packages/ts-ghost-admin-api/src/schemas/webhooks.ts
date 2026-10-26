import { z } from "zod";

export const ghostEventTypes = z.union([
  z.literal("site.changed").meta({
    description: "Triggered whenever any content changes in your site data or settings",
  }),
  z.literal("post.added").meta({ description: "Triggered whenever a post is added to Ghost" }),
  z.literal("post.deleted").meta({ description: "Triggered whenever a post is deleted from Ghost" }),
  z.literal("post.edited").meta({ description: "Triggered whenever a post is edited in Ghost" }),
  z.literal("post.published").meta({ description: "Triggered whenever a post is published to Ghost" }),
  z.literal("post.published.edited").meta({
    description: "Triggered whenever a published post is edited in Ghost",
  }),
  z.literal("post.unpublished").meta({ description: "Triggered whenever a post is unpublished from Ghost" }),
  z.literal("post.scheduled").meta({
    description: "Triggered whenever a post is scheduled to be published in Ghost",
  }),
  z.literal("post.unscheduled").meta({
    description: "Triggered whenever a post is unscheduled from publishing in Ghost",
  }),
  z.literal("post.rescheduled").meta({
    description: "Triggered whenever a post is rescheduled to publish in Ghost",
  }),
  z.literal("page.added").meta({ description: "Triggered whenever a page is added to Ghost" }),
  z.literal("page.deleted").meta({ description: "Triggered whenever a page is deleted from Ghost" }),
  z.literal("page.edited").meta({ description: "Triggered whenever a page is edited in Ghost" }),
  z.literal("page.published").meta({ description: "Triggered whenever a page is published to Ghost" }),
  z.literal("page.published.edited").meta({
    description: "Triggered whenever a published page is edited in Ghost",
  }),
  z.literal("page.unpublished").meta({ description: "Triggered whenever a page is unpublished from Ghost" }),
  z.literal("page.scheduled").meta({
    description: "Triggered whenever a page is scheduled to be published in Ghost",
  }),
  z.literal("page.unscheduled").meta({
    description: "Triggered whenever a page is unscheduled from publishing in Ghost",
  }),
  z.literal("page.rescheduled").meta({
    description: "Triggered whenever a page is rescheduled to publish in Ghost",
  }),
  z.literal("tag.added").meta({ description: "Triggered whenever a tag is added to Ghost" }),
  z.literal("tag.edited").meta({ description: "Triggered whenever a tag is edited in Ghost" }),
  z.literal("tag.deleted").meta({ description: "Triggered whenever a tag is deleted from Ghost" }),
  z
    .literal("post.tag.attached")
    .meta({ description: "Triggered whenever a tag is attached to a post in Ghost" }),
  z.literal("post.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a post in Ghost",
  }),
  z
    .literal("page.tag.attached")
    .meta({ description: "Triggered whenever a tag is attached to a page in Ghost" }),
  z.literal("page.tag.detached").meta({
    description: "Triggered whenever a tag is detached from a page in Ghost",
  }),
  z.literal("member.added").meta({ description: "Triggered whenever a member is added to Ghost" }),
  z.literal("member.edited").meta({ description: "Triggered whenever a member is edited in Ghost" }),
  z.literal("member.deleted").meta({ description: "Triggered whenever a member is deleted from Ghost" }),
]);

/** The events Ghost dispatches today; kept as a type so editors can autocomplete them. */
export type GhostWebhookEventTypes = z.infer<typeof ghostEventTypes>;

/**
 * A webhook event: one of the known events, or any other string. Ghost stores
 * any lowercase event of up to 50 characters (admin-api-schema `webhooks.json`)
 * and does not check it against the events it dispatches.
 */
export type GhostWebhookEvent = GhostWebhookEventTypes | (string & {});

/** A stored webhook's event, as Ghost returns it. */
const webhookEventSchema: z.ZodType<GhostWebhookEvent, GhostWebhookEvent> = z
  .string()
  .meta({ description: "The event that triggers the webhook" });

/** A webhook event as Ghost's webhooks input schema accepts it: lowercase, at most 50 characters. */
const webhookEventInputSchema: z.ZodType<GhostWebhookEvent, GhostWebhookEvent> = z
  .string()
  .max(50)
  .refine((event) => event === event.toLowerCase(), { message: "The event must be lowercase" })
  .meta({ description: "The event that triggers the webhook" });

/** Ghost accepts any URI reference as the target, relative ones included, of up to 2000 characters. */
const webhookTargetUrlInputSchema = z.string().max(2000).meta({ description: "The URL of the webhook" });

export const adminWebhookSchema = z.object({
  id: z.string().meta({ description: "The ID of the webhook" }),
  event: webhookEventSchema,
  target_url: z.string().meta({ description: "The URL of the webhook" }),
  name: z.string().meta({ description: "The name of the webhook" }).nullish(),
  secret: z.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: z.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: z.string().meta({ description: "The ID of the integration" }).nullish(),
  status: z.string().meta({ description: "The status of the webhook" }).nullish(),
  last_triggered_at: z
    .string()
    .meta({ description: "The date and time of the last webhook trigger" })
    .nullish(),
  last_triggered_status: z
    .string()
    .meta({ description: "The status of the last webhook trigger" })
    .nullish(),
  last_triggered_error: z.string().meta({ description: "The error of the last webhook trigger" }).nullish(),
  created_at: z.string().meta({ description: "The date and time of the webhook creation" }),
  updated_at: z.string().meta({ description: "The date and time of the webhook update" }).nullish(),
});

export type Webhook = z.infer<typeof adminWebhookSchema>;

export const adminWebhookCreateSchema = z.object({
  event: webhookEventInputSchema,
  target_url: webhookTargetUrlInputSchema,
  name: z.string().meta({ description: "The name of the webhook" }).optional(),
  secret: z.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: z.string().meta({ description: "The API version of the webhook" }).nullish(),
  integration_id: z.string().meta({ description: "The ID of the integration" }).nullish(),
});

export const adminWebhookUpdateSchema = z.object({
  event: webhookEventInputSchema.optional(),
  target_url: webhookTargetUrlInputSchema.optional(),
  name: z.string().meta({ description: "The name of the webhook" }).optional(),
  secret: z.string().meta({ description: "The secret of the webhook" }).nullish(),
  api_version: z.string().meta({ description: "The API version of the webhook" }).nullish(),
});
