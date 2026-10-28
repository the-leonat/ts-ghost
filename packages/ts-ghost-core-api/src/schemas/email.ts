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
  // Null on an email whose sender and source Ghost did not store (e.g. a failed one).
  from: z.string().nullable(),
  reply_to: z.string().nullable(),
  source: z.string().nullable(), // lexical format
  html: z.string().nullable(),
  plaintext: z.string().nullable(),
  track_opens: z.boolean(),
  submitted_at: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  // Sent by Ghost 6; optional for older Ghost versions.
  post_id: z.string().optional(),
  newsletter_id: z.string().nullish(),
  source_type: z.string().nullish(),
  track_clicks: z.boolean().optional(),
  feedback_enabled: z.boolean().optional(),
  csd_email_count: z.number().nullish(),
});
