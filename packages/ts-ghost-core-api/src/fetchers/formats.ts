import { z } from "zod";

export type ContentFormats = "html" | "mobiledoc" | "plaintext" | "lexical";
export const contentFormats = ["html", "mobiledoc", "plaintext", "lexical"];

/**
 * `required` (the output with the requested formats required) parsing a format Ghost omits as empty:
 * Ghost omits a format a post has no content for. Empty is the field's own fallback, else null, else "".
 */
export function withEmptyFormats<Required extends z.ZodObject>(
  required: Required,
  output: z.ZodObject,
  formats: string[],
): Required {
  const shape = Object.fromEntries(
    formats.map((key) => {
      const field = output.shape[key] as z.ZodType;
      const inner = field instanceof z.ZodOptional ? (field.unwrap() as z.ZodType) : field;
      if (inner.safeParse(undefined).success) return [key, inner];
      return [key, inner.safeParse(null).success ? inner.default(null) : inner.default("")];
    }),
  );
  // extend() widens the shape type; the parsed output type is unchanged.
  return required.extend(shape) as Required;
}
