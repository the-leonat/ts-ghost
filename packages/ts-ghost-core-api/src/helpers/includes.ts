import { z } from "zod";

/** Meta flag on an include key Ghost leaves out of a record that has none, e.g. `.meta({ omittedWhenEmpty: true })`. */
const OMITTED_WHEN_EMPTY = "omittedWhenEmpty";

/** The output key Ghost sends only with a relation's include. */
export const PRIMARY_KEYS = { authors: "primary_author", tags: "primary_tag" } as const;
type PrimaryKeys = typeof PRIMARY_KEYS;

/** An include mask plus the primary keys of its relations. */
export type WithPrimaryKeys<Includes> = Includes & {
  [Relation in keyof Includes & keyof PrimaryKeys as PrimaryKeys[Relation]]: true;
};

type IncludeSchema = z.ZodObject | undefined;

/** The keys an include makes required on the output: those not flagged `omittedWhenEmpty`, and relations' primary keys. */
export function requiredIncludes<M extends Record<string, unknown>>(
  schema: IncludeSchema,
  include: M,
): WithPrimaryKeys<M> {
  const meta = (key: string) => (schema?.shape[key] as z.ZodType | undefined)?.meta();
  const required = Object.entries(include).filter(([key]) => meta(key)?.[OMITTED_WHEN_EMPTY] !== true);
  const primaries = required.flatMap(([key, value]) =>
    key in PRIMARY_KEYS ? [[PRIMARY_KEYS[key as keyof PrimaryKeys], value]] : [],
  );
  return Object.fromEntries([...required, ...primaries]) as WithPrimaryKeys<M>;
}
