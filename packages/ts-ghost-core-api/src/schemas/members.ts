import { z } from "zod";

import { ghostObject } from "./targets";
import { baseNewsletterSchema } from "./newsletter";
import { baseSubscriptionsSchemaFor } from "./subscriptions";
import { perTarget, type SchemaTarget } from "./targets";

/** A member's fields common to every Admin API response, as a raw shape for a schema target. */
export const baseMembersShape = <T extends SchemaTarget>(target: T) => ({
  id: z.string(),
  email: z.string().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).nullable(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).nullable(),
  geolocation: z.string().meta({ description: "(nullable) The geolocation of the member" }).nullable(),
  created_at: z.string().meta({ description: "The date and time the member was created" }),
  updated_at: z.string().meta({ description: "The date and time the member was last updated" }).nullable(),
  labels: z.array(
    z
      .object({
        id: z.string().meta({ description: "The ID of the label" }),
        name: z.string().meta({ description: "The name of the label" }),
        slug: z.string().meta({ description: "The slug of the label" }),
        created_at: z.string().meta({ description: "The date and time the label was created" }),
        updated_at: z.string().meta({ description: "The date and time the label was last updated" }).nullable(),
      })
      .meta({ description: "The labels associated with the member" }),
  ),
  subscriptions: z
    .array(baseSubscriptionsSchemaFor(target))
    .meta({ description: "The subscriptions associated with the member" }),
  avatar_image: z
    .string()
    .meta({ description: "(nullable) The URL of the member's avatar image, null when Gravatar is off" })
    .nullable(),
  email_count: z.number().meta({ description: "The number of emails sent to the member" }),
  email_opened_count: z.number().meta({ description: "The number of emails opened by the member" }),
  email_open_rate: z.number().meta({ description: "(nullable) The open rate of the member" }).nullable(),
  status: z.string().meta({ description: "The status of the member" }),
  last_seen_at: z
    .string()
    .meta({ description: "(nullable) The date and time the member was last seen" })
    .nullable(),
  newsletters: z.array(baseNewsletterSchema),
});

/** A member's common fields for a schema target. */
export const baseMembersSchemaFor = perTarget(<T extends SchemaTarget>(target: T) =>
  ghostObject(target, "members", baseMembersShape(target)),
);

/** The v6-compat member schema. */
export const baseMembersSchema = baseMembersSchemaFor("v6-compat");
