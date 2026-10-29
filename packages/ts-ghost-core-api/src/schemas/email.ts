import { z } from "zod";

import { ghostObject } from "./targets";
import { perTarget, type SchemaTarget } from "./targets";

/** A post's newsletter email as the Admin API sends it, for a schema target. */
export const baseEmailSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "email", {
    id: z.string(),
    uuid: z.string(),
    status: z.string(),
    recipient_filter: z.string(),
    error: z.string().nullable(),
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
    source: z.string().meta({ description: "(nullable) The email's lexical source" }).nullable(),
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
    csd_email_count: z.number().nullable(),
  }),
);

/** The v6-compat email schema. */
export const baseEmailSchema = baseEmailSchemaFor("v6-compat");
