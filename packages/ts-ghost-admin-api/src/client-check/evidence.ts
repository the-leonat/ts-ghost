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
    .map(label);
}

/** A fixture's request as `"GET <path>?<query>"`. */
function label({ request }: Fixture) {
  const query = new URLSearchParams(request.query).toString();
  return `${request.method} ${request.path}${query ? `?${query}` : ""}`;
}

/** The records a fixture's body holds under its resource's key. */
function recordsOf(fixture: Fixture): unknown[] {
  const collection = (fixture.response.body as Record<string, unknown> | null)?.[resourceOf(fixture)];
  return Array.isArray(collection) ? collection : collection === undefined ? [] : [collection];
}

/**
 * Recorded reads with an `include` whose included relation no record fills,
 * as `"GET <path>?<query>: <relation>"`. A relation sent empty on every record
 * validates against any element schema, so the include is modelled on faith.
 */
export function unfilledIncludes(fixtures: Fixture[]): string[] {
  return fixtures
    .filter((fixture) => isRead(fixture) && fixture.request.query.include !== undefined)
    .flatMap((fixture) =>
      fixture.request.query.include
        .split(",")
        .filter(
          (relation) =>
            !recordsOf(fixture).some((record) => valuesAt(record, relation.split(".")).some(isFilled)),
        )
        .map((relation) => `${label(fixture)}: ${relation}`),
    );
}

type SchemaNode = { _zod: { def: Record<string, any> }; safeParse?: (value: unknown) => { success: boolean } };

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
        .flatMap(recordsOf);
      const unbacked = fieldPaths(schema).filter(
        (path) => !records.some((record) => valuesAt(record, splitPath(path)).some(isFilled)),
      );
      return [resource, unbacked];
    }),
  );
}

const WRAPPERS = ["optional", "nullable", "default", "prefault", "readonly", "catch", "nonoptional"];

/** The schema under its wrappers, and whether a wrapper lets the key be left out. */
function unwrap(schema: SchemaNode): { inner: SchemaNode; optional: boolean } {
  let inner = schema;
  let optional = false;
  for (;;) {
    const def = inner._zod.def;
    if (def.type === "optional" || def.type === "default" || def.type === "prefault") optional = true;
    if (WRAPPERS.includes(def.type)) inner = def.innerType;
    else if (def.type === "pipe") inner = def.in;
    else if (def.type === "lazy") inner = def.getter();
    else return { inner, optional };
  }
}

type KeyIssue = { path: string; kind: "unmodelled" | "missing" };

/** Keys `value` sends that `schema` does not model, and, with `required`, required keys it omits. */
function keyIssues(schema: SchemaNode, value: unknown, prefix: string, required: boolean): KeyIssue[] {
  if (value === null || value === undefined) return [];
  const { inner } = unwrap(schema);
  const def = inner._zod.def;
  switch (def.type) {
    case "array":
      return Array.isArray(value)
        ? value.flatMap((item) => keyIssues(def.element, item, `${prefix}[]`, required))
        : [];
    case "union": {
      const fits = (def.options as SchemaNode[]).filter((option) => option.safeParse?.(value).success);
      const checked = (fits.length > 0 ? fits : (def.options as SchemaNode[])).map((option) =>
        keyIssues(option, value, prefix, required),
      );
      return checked.reduce((best, issues) => (issues.length < best.length ? issues : best));
    }
    case "object": {
      if (typeof value !== "object" || Array.isArray(value)) return [];
      const shape = def.shape as Record<string, SchemaNode>;
      const record = value as Record<string, unknown>;
      const at = (key: string) => (prefix === "" ? key : `${prefix}.${key}`);
      const open = def.catchall !== undefined && def.catchall._zod.def.type !== "never";
      const unmodelled = open
        ? []
        : Object.keys(record)
            .filter((key) => !(key in shape))
            .map((key): KeyIssue => ({ path: at(key), kind: "unmodelled" }));
      const missing = required
        ? Object.entries(shape)
            .filter(([key, child]) => !(key in record) && !unwrap(child).optional)
            .map(([key]): KeyIssue => ({ path: at(key), kind: "missing" }))
        : [];
      const nested = Object.entries(shape).flatMap(([key, child]) =>
        keyIssues(child, record[key], at(key), required),
      );
      return [...unmodelled, ...missing, ...nested];
    }
    default:
      return [];
  }
}

/**
 * The two-way key check: per resource, every key a successful fixture's
 * records send that its schema does not model, and every required key they
 * omit (skipped for a request that selects `fields`), each listed once. At
 * runtime unknown keys are stripped; here they fail, so a key Ghost adds is
 * noticed.
 */
export function keyMismatches(fixtures: Fixture[], schemas: Record<string, SchemaNode>): string[] {
  const found = new Set<string>();
  for (const fixture of fixtures) {
    const resource = resourceOf(fixture);
    const schema = schemas[resource];
    if (schema === undefined || !isSuccess(fixture)) continue;
    const required = fixture.request.query.fields === undefined;
    for (const record of recordsOf(fixture)) {
      for (const { path, kind } of keyIssues(schema, record, "", required)) {
        found.add(
          `${resource}: "${path}" ${kind === "unmodelled" ? "is sent but not modelled" : "is required but not sent"}`,
        );
      }
    }
  }
  return [...found];
}
