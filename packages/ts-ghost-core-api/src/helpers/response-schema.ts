import type { z, ZodType } from "zod";

/** An error item for a response value the client's schema rejects; `path` is in Ghost's terms, e.g. `posts[0].title`. */
export type ResponseSchemaError = { type: "ResponseSchemaError"; message: string };

export function responseSchemaError(path: string, problem: string): ResponseSchemaError {
  return {
    type: "ResponseSchemaError",
    message: `Response does not match the schema at ${path}: ${problem}`,
  };
}

/** Formats a parse path, swapping the result's `data` key for where the data sits in Ghost's body (`dataPath`). */
export function responsePath(path: readonly PropertyKey[], dataPath: string): string {
  const [head, ...rest] = path;
  let out = head === "data" ? dataPath : head === undefined ? "" : String(head);
  for (const key of rest) out += typeof key === "number" ? `[${key}]` : `.${String(key)}`;
  return out || "(root)";
}

/** Parses a fetcher result without throwing: a mismatch becomes an error result of ResponseSchemaErrors. */
export function parseResponse<S extends ZodType>(
  schema: S,
  result: unknown,
  context: { dataPath: string; status: number; body?: string },
): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (parsed.success) return parsed.data;
  return {
    success: false,
    errors: parsed.error.issues.map((issue) =>
      responseSchemaError(responsePath(issue.path, context.dataPath), issue.message),
    ),
    status: context.status,
    ...(context.body !== undefined && { body: context.body }),
  } as z.infer<S>;
}
