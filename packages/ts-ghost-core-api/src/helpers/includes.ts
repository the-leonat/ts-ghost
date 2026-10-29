import { z } from "zod";

/** Meta flag on an include key Ghost leaves out of a record that has none, e.g. `.meta({ omittedWhenEmpty: true })`. */
const OMITTED_WHEN_EMPTY = "omittedWhenEmpty";

type IncludeSchema = z.ZodObject | undefined;

/** The include keys a fetcher sends: those whose parsed value is defined (an input Ghost drops parses to undefined). */
export function sendableIncludes(parsed: Record<string, unknown>): string[] {
  return Object.keys(parsed).filter((key) => parsed[key] !== undefined);
}

/** The included keys an include makes required on the output: those not flagged `omittedWhenEmpty`. */
export function requiredIncludes<M extends Record<string, unknown>>(schema: IncludeSchema, include: M): M {
  const meta = (key: string) => (schema?.shape[key] as z.ZodType | undefined)?.meta();
  return Object.fromEntries(
    Object.entries(include).filter(([key]) => meta(key)?.[OMITTED_WHEN_EMPTY] !== true),
  ) as M;
}
