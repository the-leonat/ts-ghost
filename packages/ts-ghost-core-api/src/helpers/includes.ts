import { z } from "zod";

const IGNORED_BY_GHOST = "ignoredByGhost";
const OMITTED_WHEN_EMPTY = "omittedWhenEmpty";

/**
 * An include key kept only so existing `.include({ key: true })` calls still
 * compile: Ghost ignores it, so the fetchers accept it but never send it.
 * Mark the key `@deprecated` in its include schema.
 */
export function ignoredInclude() {
  return z
    .literal(true)
    .optional()
    .meta({ deprecated: true, [IGNORED_BY_GHOST]: true });
}

/** The include keys a fetcher sends: those not marked with `ignoredInclude()`. */
export function filterSendableIncludes(includeSchema: z.ZodObject | undefined, keys: PropertyKey[]): string[] {
  return keys.map(String).filter((key) => includeSchema?.shape[key]?.meta()?.[IGNORED_BY_GHOST] !== true);
}

/**
 * An include key Ghost sends, but whose relation it leaves out of a record
 * that has none, so including it does not make the key required.
 */
export function sparseInclude() {
  return z
    .literal(true)
    .optional()
    .meta({ [OMITTED_WHEN_EMPTY]: true });
}

/** The included keys an include makes required on the output: those not marked with `sparseInclude()`. */
export function requiredIncludes<Mask extends Record<string, unknown>>(
  includeSchema: z.ZodObject | undefined,
  include: Mask,
): Mask {
  return Object.fromEntries(
    Object.entries(include).filter(([key]) => includeSchema?.shape[key]?.meta()?.[OMITTED_WHEN_EMPTY] !== true),
  ) as Mask;
}
