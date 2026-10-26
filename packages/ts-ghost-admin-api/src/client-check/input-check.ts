/**
 * The input half of the route-spec cross-check: compares the request bodies
 * the client's `add`/`edit` accept with the JSON Schemas Ghost validates them
 * against (`@tryghost/admin-api-schema`, captured in the route spec). Keys,
 * requiredness and basic JSON types only; lengths, patterns and formats are
 * not compared.
 */

/** A JSON Schema document or fragment, as plain data. */
export type JsonSchema = { [key: string]: unknown };

export type InputOperation = "add" | "edit";

export type InputCheckResult = {
  /** Claims the client makes that Ghost's input schema does not back. */
  failures: string[];
  /** What Ghost's input schema accepts and the client does not model: reported, never failed. */
  gaps: string[];
};

/** A JSON type set; `undefined` means unconstrained (any type). */
type Types = Set<string> | undefined;

type Property = { types: Types };
type ObjectShape = { properties: Map<string, Property>; required: Set<string>; closed: boolean };

const isSchema = (value: unknown): value is JsonSchema =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/** `number` covers `integer`: an integer the library sends is a number Ghost accepts, and vice versa. */
const normalise = (type: string) => (type === "integer" ? "number" : type);

function union(sets: Types[]): Types {
  if (sets.some((set) => set === undefined)) return undefined;
  return new Set(sets.flatMap((set) => [...set!]));
}

function typeOfValue(value: unknown) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return normalise(typeof value);
}

/** Resolves `$ref`s against Ghost's definition documents (`posts#/definitions/post`, `#/definitions/x`). */
class Resolver {
  constructor(private readonly definitions: Record<string, unknown>) {}

  resolve(schema: JsonSchema, base: string | undefined): { schema: JsonSchema; base: string | undefined } {
    const ref = schema.$ref;
    if (typeof ref !== "string") return { schema, base };
    const [document, pointer = ""] = ref.split("#");
    const docName = document === "" ? base : document;
    let target: unknown = docName === undefined ? undefined : this.definitions[docName];
    for (const segment of pointer.split("/").filter(Boolean)) {
      target = isSchema(target) ? target[segment] : undefined;
    }
    if (!isSchema(target))
      throw new Error(`Ghost input schema references ${ref}, which the route spec lacks`);
    return this.resolve(target, docName);
  }

  /** The JSON types a schema admits. */
  types(raw: JsonSchema, rawBase: string | undefined): Types {
    const { schema, base } = this.resolve(raw, rawBase);
    const constraints: Types[] = [];
    if (typeof schema.type === "string") constraints.push(new Set([normalise(schema.type)]));
    if (Array.isArray(schema.type)) constraints.push(new Set(schema.type.map(String).map(normalise)));
    if (Array.isArray(schema.enum)) constraints.push(new Set(schema.enum.map(typeOfValue)));
    if ("const" in schema) constraints.push(new Set([typeOfValue(schema.const)]));
    for (const key of ["anyOf", "oneOf"] as const) {
      const options = schema[key];
      if (Array.isArray(options))
        constraints.push(union(options.filter(isSchema).map((o) => this.types(o, base))));
    }
    // Every constraint applies; intersect the constrained ones.
    return constraints.reduce<Types>((acc, set) => {
      if (set === undefined) return acc;
      if (acc === undefined) return set;
      return new Set([...acc].filter((type) => set.has(type)));
    }, undefined);
  }

  /** The object shape a schema describes, folding `allOf` parts and `$ref`s into one. */
  objectShape(raw: JsonSchema, rawBase: string | undefined): ObjectShape {
    const { schema, base } = this.resolve(raw, rawBase);
    const shape: ObjectShape = {
      properties: new Map(),
      required: new Set(Array.isArray(schema.required) ? schema.required.map(String) : []),
      closed: schema.additionalProperties === false,
    };
    if (isSchema(schema.properties)) {
      for (const [key, value] of Object.entries(schema.properties)) {
        shape.properties.set(key, { types: isSchema(value) ? this.types(value, base) : undefined });
      }
    }
    for (const part of Array.isArray(schema.allOf) ? schema.allOf.filter(isSchema) : []) {
      const inner = this.objectShape(part, base);
      inner.properties.forEach((value, key) => shape.properties.set(key, value));
      inner.required.forEach((key) => shape.required.add(key));
      shape.closed ||= inner.closed;
    }
    return shape;
  }
}

/** The body item Ghost validates for an action: `{ <resource>: [ item ] }` -> item. */
function ghostItemShape(resolver: Resolver, action: JsonSchema, resource: string): ObjectShape {
  const wrapper = isSchema(action.properties) ? action.properties[resource] : undefined;
  const items = isSchema(wrapper) ? wrapper.items : undefined;
  if (!isSchema(items)) throw new Error(`Ghost's ${resource} input schema has no ${resource}[] item`);
  return resolver.objectShape(items, undefined);
}

const describeTypes = (types: Set<string>) => [...types].sort().join(" | ");

/**
 * Compares one client operation's body schema (JSON Schema of what the client
 * accepts and sends) with Ghost's schema for that action.
 */
export function checkInput(
  call: string,
  resource: string,
  library: JsonSchema,
  actionName: string,
  action: JsonSchema,
  definitions: Record<string, unknown>,
): InputCheckResult {
  const failures: string[] = [];
  const gaps: string[] = [];
  const resolver = new Resolver({});
  const ghostResolver = new Resolver(definitions);
  const ghost = ghostItemShape(ghostResolver, action, resource);
  const ours = resolver.objectShape(library, undefined);
  const schemaName = `Ghost's ${actionName} schema`;

  for (const [key, property] of ours.properties) {
    const theirs = ghost.properties.get(key);
    if (theirs === undefined) {
      if (ghost.closed)
        failures.push(`${call} accepts "${key}", which ${schemaName} does not declare (Ghost drops it)`);
      continue;
    }
    if (property.types !== undefined && theirs.types !== undefined) {
      const rejected = [...property.types].filter((type) => !theirs.types!.has(type));
      if (rejected.length > 0) {
        failures.push(
          `${call} accepts "${key}" as ${describeTypes(new Set(rejected))}, but ${schemaName} allows only ${describeTypes(theirs.types)}`,
        );
      }
    }
  }

  for (const [key, theirs] of ghost.properties) {
    const property = ours.properties.get(key);
    if (property === undefined) {
      gaps.push(`${call} does not model "${key}", which ${schemaName} accepts`);
      continue;
    }
    if (property.types === undefined || theirs.types === undefined) continue;
    const unmodelled = [...theirs.types].filter((type) => !property.types!.has(type));
    if (unmodelled.length > 0) {
      gaps.push(
        `${call} does not accept "${key}" as ${describeTypes(new Set(unmodelled))}, which ${schemaName} allows`,
      );
    }
  }

  for (const key of ghost.required) {
    if (ours.required.has(key)) continue;
    failures.push(
      ours.properties.has(key)
        ? `${call} lets callers leave out "${key}", which ${schemaName} requires`
        : `${call} never sends "${key}", which ${schemaName} requires`,
    );
  }

  return { failures, gaps };
}
