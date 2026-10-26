import { z } from "zod";

export const adminLabelsSchema = z.object({
  id: z.string().meta({ description: "The ID of the label" }),
  name: z.string().meta({ description: "The name of the label" }),
  slug: z.string().meta({ description: "The slug of the label" }),
  created_at: z.string().meta({ description: "The date and time the label was created" }),
  updated_at: z
    .string()
    .meta({ description: "(nullable) The date and time the label was last updated" })
    .nullish(),
  // Ghost sends the count only when `count.members` is included.
  count: z
    .object({
      members: z.number().meta({ description: "The number of members carrying the label" }),
    })
    .optional(),
});

// Ghost's labels.add input schema requires a name; name and slug are its label properties.
export const adminLabelsCreateSchema = z.object({
  name: z.string().min(1).max(191).meta({ description: "The name of the label" }),
  slug: z.string().max(191).meta({ description: "The slug of the label" }).optional(),
});

export const adminLabelsUpdateSchema = z.object({
  name: z.string().min(1).max(191).meta({ description: "The name of the label" }).optional(),
  slug: z.string().max(191).meta({ description: "The slug of the label" }).optional(),
});
