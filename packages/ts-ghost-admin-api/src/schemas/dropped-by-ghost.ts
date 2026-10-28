import { z } from "zod";
import type { SchemaTarget } from "@ts-ghost/core-api";

/** An input or include key Ghost drops: still accepted so existing calls compile, never sent. Mark it `@deprecated`. */
export const droppedByGhost = <T extends z.ZodType>(schema: T) =>
  schema
    .transform(() => undefined)
    .meta({ deprecated: true })
    .optional();

const isDropped = (field: z.ZodType) => {
  let inner: z.ZodType = field;
  while (inner instanceof z.ZodOptional) inner = inner.unwrap() as z.ZodType;
  return inner.meta()?.deprecated === true;
};

/** `Shape` for target `T`: on v6-latest without the keys Ghost drops. */
export type TargetInput<T extends SchemaTarget, Shape extends z.ZodRawShape> = {
  [K in keyof Shape as T extends "v6-latest"
    ? [z.output<Shape[K]>] extends [undefined]
      ? never
      : K
    : K]: Shape[K];
};

/** The v6-latest form of an input or include schema: deprecated keys Ghost drops are gone, not accepted. */
export function forTarget<T extends SchemaTarget, Shape extends z.ZodRawShape>(
  target: T,
  schema: z.ZodObject<Shape>,
): z.ZodObject<TargetInput<T, Shape>> {
  if (target !== "v6-latest") return schema as any;
  const kept = Object.entries(schema.shape).filter(([, field]) => !isDropped(field as z.ZodType));
  return z.object(Object.fromEntries(kept)) as any;
}
