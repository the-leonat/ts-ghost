// Reads a schema's nullable, deprecated and unsent keys, and finds nullability gaps and read-back values.

import { expect } from "vitest";

/** The zod internals these helpers read: a field's wrapper type, what it wraps, and its metadata. */
type Field = { def: unknown; meta(): Record<string, unknown> | undefined };
type ObjectSchema = { shape: Record<string, Field> };

const inner = (field: Field) => (field.def as { innerType?: Field }).innerType;

/** Whether a field lets null through: nullable under any optional, default or meta wrapper (a catch doesn't count). */
function acceptsNull(field: Field): boolean {
  const { type } = field.def as { type: string };
  if (type === "nullable") return true;
  if (type === "catch") return false;
  const wrapped = inner(field);
  return !!wrapped && acceptsNull(wrapped);
}

/** Whether a field, or a schema it wraps, is marked `.meta({ deprecated: true })`. */
function isDeprecated(field: Field): boolean {
  const wrapped = inner(field);
  return field.meta()?.deprecated === true || (!!wrapped && isDeprecated(wrapped));
}

/** Top-level keys of a response schema whose value may be null. */
export const nullableKeys = (schema: ObjectSchema) =>
  Object.keys(schema.shape).filter((key) => acceptsNull(schema.shape[key]!));

/** Top-level keys of an input schema that are deprecated: Ghost drops them, so they never read back. */
export const deprecatedKeys = (schema: ObjectSchema) =>
  Object.keys(schema.shape).filter((key) => isDeprecated(schema.shape[key]!));

/**
 * Each nullable key of `schema` must be null on one seeded variant and set on another. Skipped: a key no variant
 * carries (an optional field this Ghost doesn't send) and `except`'s keys, each with its reason.
 */
export function nullabilityGaps(
  schema: ObjectSchema,
  variants: object[],
  except: Record<string, string> = {},
): string[] {
  return nullableKeys(schema).flatMap((key) => {
    const values = variants.filter((row) => key in row).map((row) => (row as Record<string, unknown>)[key]);
    if (key in except || values.length === 0) return [];
    return [
      ...(values.includes(null) ? [] : [`${key} is never null`]),
      ...(values.some((value) => value != null) ? [] : [`${key} is never set`]),
    ];
  });
}

/** What a read shows of `sent`, `omit`'s keys aside: dates as ISO strings, relations matched by the keys sent. */
export function readBack(sent: object, omit: readonly string[] = []): Record<string, unknown> {
  const expected = (value: unknown): unknown => {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((item) => expect.objectContaining(item as object));
    return value;
  };
  const kept = Object.entries(sent).filter(([key]) => !omit.includes(key));
  return Object.fromEntries(kept.map(([key, value]) => [key, expected(value)]));
}

/** Inputs of `schema` that none of a round trip's requests sent: it must send every one. */
export const unsentInputs = (schema: ObjectSchema, ...sent: object[]) =>
  Object.keys(schema.shape).filter((key) => !sent.some((body) => key in body));
