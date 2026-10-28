import { z } from "zod";

const IGNORED_BY_GHOST = "ignoredByGhost";
const OMITTED_WHEN_EMPTY = "omittedWhenEmpty";

type IncludeSchema = z.ZodObject | undefined;
const metaOf = (schema: IncludeSchema, key: string) =>
  (schema?.shape[key] as z.ZodType | undefined)?.meta() as Record<string, unknown> | undefined;

/** An include key Ghost ignores: still accepted so existing calls compile, never sent. Mark it `@deprecated`. */
export function ignoredInclude() {
  return z
    .literal(true)
    .optional()
    .meta({ deprecated: true, [IGNORED_BY_GHOST]: true });
}

/** An include key Ghost leaves out of a record that has none, so including it doesn't make the key required. */
export function sparseInclude() {
  return z
    .literal(true)
    .optional()
    .meta({ [OMITTED_WHEN_EMPTY]: true });
}

/** The include keys a fetcher sends: those not marked with `ignoredInclude()`. */
export function filterSendableIncludes(schema: IncludeSchema, keys: PropertyKey[]): string[] {
  return keys.map(String).filter((key) => metaOf(schema, key)?.[IGNORED_BY_GHOST] !== true);
}

/** The included keys an include makes required on the output: those not marked with `sparseInclude()`. */
export function requiredIncludes<M extends Record<string, unknown>>(schema: IncludeSchema, include: M): M {
  return Object.fromEntries(
    Object.entries(include).filter(([key]) => metaOf(schema, key)?.[OMITTED_WHEN_EMPTY] !== true),
  ) as M;
}
