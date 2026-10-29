import { z } from "zod";

/** An input or include key Ghost drops: still accepted so existing calls compile, never sent. Mark it `@deprecated`. */
export const droppedByGhost = <T extends z.ZodType>(schema: T) =>
  schema
    .transform(() => undefined)
    .meta({ deprecated: true })
    .optional();
