import { describe, expect, test } from "vitest";
import type { z } from "zod";

import { adminSchemas } from "./targets";

type Def = { innerType?: z.ZodType; element?: z.ZodType; shape?: Record<string, z.ZodType> };
const def = (schema: z.ZodType) => schema.def as unknown as Def;

/** The description of a field, from its outermost wrapper that has one. */
function description(schema: z.ZodType): string | undefined {
  const inner = def(schema).innerType;
  return schema.description ?? (inner && description(inner));
}

/** The object shape under a field's optional, nullable and array wrappers, if any. */
function shape(schema: z.ZodType): Record<string, z.ZodType> | undefined {
  const { innerType, element, shape: own } = def(schema);
  return own ?? (innerType && shape(innerType)) ?? (element && shape(element));
}

/** Paths, at any depth, where latest describes a field and compat doesn't say the same. */
function lostDescriptions(latest: z.ZodType, compat: z.ZodType, path: string): string[] {
  const [l, c] = [shape(latest), shape(compat)];
  if (!l || !c) return [];
  return Object.entries(l).flatMap(([key, field]) => {
    const other = c[key];
    if (!other) return [];
    const lost = description(field) && description(field) !== description(other) ? [`${path}.${key}`] : [];
    return [...lost, ...lostDescriptions(field, other, `${path}.${key}`)];
  });
}

describe("compat", () => {
  test("keeps every field description latest has, at any depth", () => {
    const lost = Object.entries(adminSchemas.latest).flatMap(([resource, latest]) =>
      lostDescriptions(latest, adminSchemas.compat[resource as keyof typeof adminSchemas.compat], resource),
    );
    expect(lost).toEqual([]);
  });
});
