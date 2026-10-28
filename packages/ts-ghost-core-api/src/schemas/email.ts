import { z } from "zod";

export const baseEmailSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  status: z.string(),
  recipient_filter: z.string(),
  error: z.string().nullish(),
  error_data: z.any().nullable(),
  email_count: z.number(),
  delivered_count: z.number(),
  opened_count: z.number(),
  failed_count: z.number(),
  subject: z.string(),
  from: z
    .string()
    .meta({ description: "(nullable) Null when Ghost stored no sender, e.g. a failed email" })
    .nullable(),
  reply_to: z.string().nullable(),
  source: z.string().nullable(), // lexical format
  html: z.string().nullable(),
  plaintext: z.string().nullable(),
  track_opens: z.boolean(),
  submitted_at: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  post_id: z.string(),
  newsletter_id: z.string().nullable(),
  source_type: z.string(),
  track_clicks: z.boolean(),
  feedback_enabled: z.boolean(),
  csd_email_count: z.number().meta({ description: "(nullable) Sent by Ghost 6.x after 6.0" }).nullish(),
});
