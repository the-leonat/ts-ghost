import type { RecordedResponse } from "../unknown-keys.ts";

/** A Zod schema as far as the walk needs it; no import of zod, which only the client packages depend on. */
type Schema = {
  def?: { type: string; [key: string]: unknown };
  meta?: () => Record<string, unknown> | undefined;
  safeParse(value: unknown): { success: boolean };
};

/** Keys a pin starts sending (`added`) or stops sending (`removed`), as since/until table keys. */
export type FieldDrift = { added: string[]; removed: string[]; untracked: string[] };

/**
 * Compares recorded responses with the client's v6-latest schemas: a key no schema object declares is added, and
 * a required key absent from every response object of its schema is removed. Objects outside the since/until
 * table (no `ghostFields` name) are reported as `untracked` paths.
 */
export function fieldDrift(schemas: Record<string, unknown>, responses: RecordedResponse[]): FieldDrift {
  const added = new Set<string>();
  const untracked = new Set<string>();
  const seen = new Map<string, { schema: Schema; keys: Set<string>[] }>();

  const walk = (value: unknown, schema: Schema | undefined, path: string) => {
    const inner = schema && unwrap(schema);
    if (!inner) return;
    const def = inner.def!;
    if (Array.isArray(value) && def.type === "array") {
      for (const item of value) walk(item, def.element as Schema, `${path}[]`);
    } else if (isObject(value) && def.type === "object") {
      const shape = def.shape as Record<string, Schema>;
      const name = inner.meta?.()?.ghostFields as string | undefined;
      if (name) {
        const entry = seen.get(name) ?? { schema: inner, keys: [] };
        entry.keys.push(new Set(Object.keys(value)));
        seen.set(name, entry);
      }
      for (const [key, child] of Object.entries(value)) {
        if (key in shape) walk(child, shape[key], `${path}.${key}`);
        else if (name) added.add(`${name}.${key}`);
        else untracked.add(`${path}.${key}`);
      }
    }
  };

  for (const { url, status, body } of responses) {
    if (status >= 300 || !isObject(body) || new URL(url).searchParams.has("fields")) continue;
    for (const [resource, value] of Object.entries(body)) {
      const schema = schemas[resource] as Schema | undefined;
      if (schema) walk(Array.isArray(value) ? value : [value], arrayOf(schema), resource);
    }
  }

  const removed = new Set<string>();
  for (const [name, { schema, keys }] of seen) {
    const shape = schema.def!.shape as Record<string, Schema>;
    for (const [key, field] of Object.entries(shape)) {
      if (!field.safeParse(undefined).success && keys.every((sent) => !sent.has(key)))
        removed.add(`${name}.${key}`);
    }
  }
  return { added: [...added].sort(), removed: [...removed].sort(), untracked: [...untracked].sort() };
}

/** Rewrites the since/until table source for a pin bump to `minor` (e.g. "6.74"): new entries and GHOST_LATEST. */
export function updateFieldTable(source: string, drift: FieldDrift, minor: string): string {
  const body = /export const GHOST_FIELDS = \{\n([\s\S]*?)\n\} as const/.exec(source);
  if (!body) throw new Error("GHOST_FIELDS not found in the since/until table");
  const entries = new Map<string, Record<string, string>>();
  for (const line of body[1]!.split("\n")) {
    const match = /^\s+"([^"]+)": \{ (.*) \},$/.exec(line);
    if (!match) throw new Error(`Unexpected GHOST_FIELDS line: ${line}`);
    entries.set(
      match[1]!,
      Object.fromEntries([...match[2]!.matchAll(/(\w+): "([^"]+)"/g)].map((m) => [m[1]!, m[2]!])),
    );
  }
  for (const key of drift.added) entries.set(key, { ...entries.get(key), since: minor });
  for (const key of drift.removed) entries.set(key, { ...entries.get(key), until: minor });
  const lines = [...entries.keys()].sort().map((key) => {
    const { since, until } = entries.get(key)!;
    const range = [since && `since: "${since}"`, until && `until: "${until}"`].filter(Boolean).join(", ");
    return `  "${key}": { ${range} },`;
  });
  return source
    .replace(body[0], `export const GHOST_FIELDS = {\n${lines.join("\n")}\n} as const`)
    .replace(/export const GHOST_LATEST = "[^"]+";/, `export const GHOST_LATEST = "${minor}";`);
}

const arrayOf = (element: Schema) => ({ def: { type: "array", element } }) as unknown as Schema;

function unwrap(schema: Schema): Schema | undefined {
  let current: Schema | undefined = schema;
  for (let i = 0; current?.def && i < 10; i++) {
    const def: Record<string, unknown> = current.def;
    if (["optional", "nullable", "default", "catch", "readonly", "nonoptional"].includes(def.type as string))
      current = def.innerType as Schema;
    else if (def.type === "pipe") current = def.in as Schema;
    else return current;
  }
  return current;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** A major changeset for fields Ghost `version` stopped sending: v6-latest drops them, v6-compat makes them optional. */
export function removalChangeset(version: string, removed: string[]): string {
  return [
    "---",
    `"@ts-ghost/core-api": major`,
    `"@ts-ghost/admin-api": major`,
    "---",
    "",
    `Ghost ${version} no longer sends ${removed.map((k) => `\`${k}\``).join(", ")}: the v6-latest schema drops them and v6-compat makes them optional.`,
    "",
  ].join("\n");
}

/** Route groups (first path segments) a new Ghost added or removed, as `resource.<group>` table keys. */
export function routeGroupDrift(
  before: { routes: { path: string }[] },
  after: { routes: { path: string }[] },
): { added: string[]; removed: string[] } {
  const groups = (m: { routes: { path: string }[] }) => new Set(m.routes.map((r) => r.path.split("/")[1]!));
  const [was, now] = [groups(before), groups(after)];
  const key = (group: string) => `resource.${group}`;
  return {
    added: [...now]
      .filter((g) => !was.has(g))
      .sort()
      .map(key),
    removed: [...was]
      .filter((g) => !now.has(g))
      .sort()
      .map(key),
  };
}
