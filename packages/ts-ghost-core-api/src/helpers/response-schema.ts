import type { z, ZodObject, ZodType } from "zod";

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

/**
 * Strict mode: a key Ghost sends that the schema doesn't declare fails the result instead of passing through.
 * `ignore` lists paths it still passes through, with `[]` for any index, e.g. `posts[].new_key`.
 */
export type StrictOption = boolean | { ignore?: readonly string[] };

type Context = { dataPath: string; status: number; body?: string; strict?: StrictOption };

/**
 * Parses a fetcher result without throwing: a mismatch becomes an error result of ResponseSchemaErrors.
 * Keys the schema doesn't declare pass through to a successful result, or fail it in strict mode.
 */
export function parseResponse<S extends ZodType>(schema: S, result: unknown, context: Context): z.infer<S> {
  const parsed = schema.safeParse(result);
  if (!parsed.success)
    return errorResult(
      parsed.error.issues.map((issue) =>
        responseSchemaError(responsePath(issue.path, context.dataPath), issue.message),
      ),
      context,
    );
  if (!isPlainObject(parsed.data) || parsed.data.success !== true) return parsed.data;

  const extras: Extra[] = [];
  collectExtras(result, parsed.data, [], extras);
  const strict = context.strict;
  const ignored = new Set(typeof strict === "object" ? strict.ignore : []);
  const errors = [];
  for (const extra of extras) {
    const path = responsePath(extra.path, context.dataPath);
    if (strict && !ignored.has(path.replace(/\[\d+\]/g, "[]")))
      errors.push(responseSchemaError(path, "key not declared by the schema"));
  }
  if (errors.length) return errorResult(errors, context);
  for (const { target, key, value } of extras) target[key] = value;
  return parsed.data;
}

function errorResult(errors: ResponseSchemaError[], context: Context): any {
  return {
    success: false,
    errors,
    status: context.status,
    ...(context.body !== undefined && { body: context.body }),
  };
}

type Extra = { path: PropertyKey[]; target: Record<string, unknown>; key: string; value: unknown };

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (typeof v !== "object" || v === null) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

/** Keys of `raw` missing from its parse `parsed` (the schema stripped them), walking both in step. */
function collectExtras(raw: unknown, parsed: unknown, path: PropertyKey[], out: Extra[]) {
  if (Array.isArray(raw) && Array.isArray(parsed)) {
    parsed.forEach((item, i) => collectExtras(raw[i], item, [...path, i], out));
  } else if (isPlainObject(raw) && isPlainObject(parsed)) {
    for (const [key, value] of Object.entries(raw)) {
      if (key in parsed) collectExtras(value, parsed[key], [...path, key], out);
      else out.push({ path: [...path, key], target: parsed, key, value });
    }
  }
}

/** Drops the keys a `.fields()` selection left out, which Ghost may send anyway, from a resource or list of them. */
export function dropUnselected(value: unknown, declared: ZodObject, selected: ZodObject): unknown {
  const unselected = Object.keys(declared.shape).filter((key) => !(key in selected.shape));
  if (!unselected.length) return value;
  const drop = (item: unknown) =>
    isPlainObject(item)
      ? Object.fromEntries(Object.entries(item).filter(([key]) => !unselected.includes(key)))
      : item;
  return Array.isArray(value) ? value.map(drop) : drop(value);
}
