import { z } from "zod";

const IGNORED_BY_GHOST = "ignoredByGhost";

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
export function sentIncludes(includeSchema: z.ZodObject | undefined, keys: PropertyKey[]): string[] {
  return keys.map(String).filter((key) => includeSchema?.shape[key]?.meta()?.[IGNORED_BY_GHOST] !== true);
}
