import { z, type ZodOptional, type ZodRawShape, type ZodType } from "zod";

import type { IsAny } from "../utils";

/**
 * The response shape a client parses against:
 * - `v5`: exactly what the last Ghost 5.x sends;
 * - `v6-compat`: any Ghost 6.x, fields added after 6.0 (or removed since) optional;
 * - `v6-latest`: exactly what the pinned Ghost 6.x sends.
 */
export type SchemaTarget = "v5" | "v6-compat" | "v6-latest";

/** The client option picking a Ghost 6 target; `compat` is the default. */
export type SchemaOption = { schema?: "compat" | "latest" };

/** When a field appeared (`since`) or disappeared (`until`) in Ghost 6; `until: "6.0"` is a Ghost 5-only field. */
export type GhostFieldRange = { readonly since?: `6.${number}`; readonly until?: `6.${number}` };
export type GhostFieldTable = Readonly<Record<string, GhostFieldRange>>;

/** The target a client version literal and its options select; a non-literal version is v6-compat. */
export type SchemaTargetOf<Version, Options> =
  IsAny<Version> extends true
    ? "v6-compat"
    : [Version] extends [`v5.${string}`]
      ? "v5"
      : [Version] extends [`v6.${string}`]
        ? Options extends { schema: "latest" }
          ? "v6-latest"
          : "v6-compat"
        : "v6-compat";

export function schemaTarget(version: string, options?: SchemaOption): SchemaTarget {
  if (version.startsWith("v5.")) {
    if (options?.schema === "latest")
      throw new Error(`schema: "latest" needs a Ghost 6 version, got "${version}"`);
    return "v5";
  }
  return options?.schema === "latest" ? "v6-latest" : "v6-compat";
}

type Presence<T extends SchemaTarget, R> = T extends "v5"
  ? R extends { since: string }
    ? "absent"
    : "required"
  : T extends "v6-compat"
    ? R extends { until: "6.0" }
      ? "absent"
      : R extends { until: string }
        ? "optional"
        : R extends { since: infer S }
          ? S extends "6.0"
            ? "required"
            : "optional"
          : "required"
    : R extends { until: string }
      ? "absent"
      : "required";

type RangeOf<Table, Name extends string, Key> = `${Name}.${Key & string}` extends keyof Table
  ? Table[`${Name}.${Key & string}`]
  : {};

/** `Shape` with each field present, optional or absent as `Table` says for target `T`. */
export type TargetShape<T extends SchemaTarget, Table, Name extends string, Shape extends ZodRawShape> = {
  [K in keyof Shape as Presence<T, RangeOf<Table, Name, K>> extends "absent" ? never : K]: Presence<
    T,
    RangeOf<Table, Name, K>
  > extends "optional"
    ? ZodOptional<Shape[K]>
    : Shape[K];
};

function presence(target: SchemaTarget, range: GhostFieldRange | undefined) {
  if (target === "v5") return range?.since ? "absent" : "required";
  if (target === "v6-latest") return range?.until ? "absent" : "required";
  if (range?.until === "6.0") return "absent";
  return range?.until || (range?.since && range.since !== "6.0") ? "optional" : "required";
}

/** Caches a schema factory per target, so a client builds each target's schemas once. */
export function perTarget<Build extends (target: SchemaTarget) => unknown>(build: Build): Build {
  const cache = new Map<SchemaTarget, unknown>();
  return ((target: SchemaTarget) => {
    if (!cache.has(target)) cache.set(target, build(target));
    return cache.get(target);
  }) as Build;
}

/**
 * Binds a since/until table, keyed `"<name>.<field>"`, into a builder of objects per target.
 * Fields missing from the table are sent by Ghost 5.last and every Ghost 6.x.
 */
export function defineGhostObject<const Table extends GhostFieldTable>(table: Table) {
  return function ghostObject<T extends SchemaTarget, const Name extends string, Shape extends ZodRawShape>(
    target: T,
    name: Name,
    shape: Shape,
  ): z.ZodObject<TargetShape<T, Table, Name, Shape>> {
    const out: Record<string, ZodType> = {};
    for (const [key, field] of Object.entries(shape)) {
      const state = presence(target, table[`${name}.${key}`]);
      if (state === "absent") continue;
      out[key] = state === "optional" ? (field as ZodType).optional() : (field as ZodType);
    }
    // The name lets tools map a response path back to its table key.
    return z.object(out).meta({ ghostFields: name }) as any;
  };
}
