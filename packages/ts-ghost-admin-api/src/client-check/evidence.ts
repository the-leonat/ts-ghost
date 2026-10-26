/**
 * Evidence guards over the recorded fixtures: whether they hold anything a
 * schema can be checked against. An empty collection validates against any
 * element schema, and a field no fixture ever fills is modelled on faith.
 */
import type { Fixture } from "./fixture-server";

function isSuccess(fixture: Fixture) {
  const { status } = fixture.response;
  return status >= 200 && status < 300;
}

/** A recorded read: a successful GET. Refusals and the not-found read are not reads. */
function isRead(fixture: Fixture) {
  return fixture.request.method === "GET" && isSuccess(fixture);
}

/** Evidence for a field: a value that is there, and not an empty list. */
function isFilled(value: unknown) {
  return value !== null && value !== undefined && !(Array.isArray(value) && value.length === 0);
}

/** The resource a fixture's request addresses: the first path segment below the API root. */
export function resourceOf(fixture: Fixture) {
  return fixture.request.path.replace(/^\/ghost\/api\/admin\//, "").split("/")[0];
}

/**
 * Recorded reads of the given resources whose collection is empty (or missing),
 * as `"GET <path>?<query>"` labels.
 */
export function emptyReads(fixtures: Fixture[], resources: string[]): string[] {
  return fixtures
    .filter((fixture) => isRead(fixture) && resources.includes(resourceOf(fixture)))
    .filter((fixture) => {
      const body = fixture.response.body as Record<string, unknown> | null;
      const collection = body?.[resourceOf(fixture)];
      if (Array.isArray(collection)) return collection.length === 0;
      return collection === undefined || collection === null;
    })
    .map(({ request }) => {
      const query = new URLSearchParams(request.query).toString();
      return `${request.method} ${request.path}${query ? `?${query}` : ""}`;
    });
}

type SchemaNode = { _zod: { def: Record<string, any> } };

/** Field paths of a zod object schema, with `[]` marking array elements: `authors[].name`. */
function fieldPaths(schema: SchemaNode, prefix = ""): string[] {
  if (schema?._zod === undefined) throw new Error(`not a zod schema at ${prefix}: ${String(schema)}`);
  const def = schema._zod.def;
  switch (def.type) {
    case "optional":
    case "nullable":
    case "default":
    case "readonly":
      return fieldPaths(def.innerType, prefix);
    case "pipe":
      return fieldPaths(def.in, prefix);
    case "array":
      return fieldPaths(def.element, `${prefix}[]`);
    case "object":
      return Object.entries(def.shape as Record<string, SchemaNode>).flatMap(([key, child]) => {
        const path = prefix === "" ? key : `${prefix}.${key}`;
        return [path, ...fieldPaths(child, path)];
      });
    default:
      return [];
  }
}

/** Every value at a field path, descending through arrays at `[]`. */
function valuesAt(value: unknown, path: string[]): unknown[] {
  if (path.length === 0) return [value];
  if (value === null || value === undefined) return [];
  const [head, ...rest] = path;
  if (head === "[]") return Array.isArray(value) ? value.flatMap((item) => valuesAt(item, rest)) : [];
  if (typeof value !== "object" || Array.isArray(value)) return [];
  return valuesAt((value as Record<string, unknown>)[head], rest);
}

function splitPath(path: string) {
  return path.split(/\.|(?=\[\])|(?<=\[\])/).filter((part) => part !== "");
}

/**
 * Per resource, the fields its schema models that no successful fixture of
 * that resource (read or write) ever carries with a non-null, non-empty value. Report-only: a gap here is a
 * part of the schema the fixtures cannot vouch for, not a failure.
 */
export function unbackedFields(
  fixtures: Fixture[],
  schemas: Record<string, SchemaNode>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(schemas).map(([resource, schema]) => {
      const records = fixtures
        .filter((fixture) => isSuccess(fixture) && resourceOf(fixture) === resource)
        .flatMap((fixture) => {
          const collection = (fixture.response.body as Record<string, unknown> | null)?.[resource];
          return Array.isArray(collection) ? collection : collection === undefined ? [] : [collection];
        });
      const unbacked = fieldPaths(schema).filter(
        (path) => !records.some((record) => valuesAt(record, splitPath(path)).some(isFilled)),
      );
      return [resource, unbacked];
    }),
  );
}
