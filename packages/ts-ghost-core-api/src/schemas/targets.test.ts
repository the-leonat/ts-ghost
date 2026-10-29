import { describe, expect, test } from "vitest";
import { z } from "zod";

import { defineGhostObject, schemaTarget } from "./targets";

const fields = {
  "thing.from_6_0": { since: "6.0" },
  "thing.from_6_13": { since: "6.13" },
  "thing.until_6_40": { until: "6.40" },
  "thing.v5_only": { until: "6.0" },
  "thing.between": { since: "6.28", until: "6.39" },
} as const;
const ghostObject = defineGhostObject(fields);
const thing = (target: Parameters<typeof ghostObject>[0]) =>
  ghostObject(target, "thing", {
    always: z.string(),
    nullable: z.string().nullable(),
    from_6_0: z.boolean(),
    from_6_13: z.boolean(),
    until_6_40: z.boolean(),
    v5_only: z.boolean(),
    between: z.boolean(),
  });
const keys = (schema: z.ZodObject) => Object.keys(schema.shape).sort();
const optional = (schema: z.ZodObject) =>
  Object.entries(schema.shape)
    .filter(([, field]) => (field as z.ZodType).safeParse(undefined).success)
    .map(([key]) => key)
    .sort();

describe("a Ghost object per schema target", () => {
  test("v5 has exactly the fields Ghost 5 sends, all as sent", () => {
    expect(keys(thing("v5"))).toEqual(["always", "nullable", "until_6_40", "v5_only"]);
    expect(optional(thing("v5"))).toEqual([]);
  });

  test("v6-compat requires fields every 6.x sends and makes later or removed ones optional", () => {
    expect(keys(thing("v6-compat"))).toEqual([
      "always",
      "between",
      "from_6_0",
      "from_6_13",
      "nullable",
      "until_6_40",
    ]);
    expect(optional(thing("v6-compat"))).toEqual(["between", "from_6_13", "until_6_40"]);
  });

  test("v6-latest requires every field the pin sends and drops removed ones", () => {
    expect(keys(thing("v6-latest"))).toEqual(["always", "from_6_0", "from_6_13", "nullable"]);
    expect(optional(thing("v6-latest"))).toEqual([]);
  });

  test("nullability stays as declared in every target", () => {
    for (const target of ["v5", "v6-compat", "v6-latest"] as const)
      expect(thing(target).shape.nullable.safeParse(null).success).toBe(true);
  });
});

describe("schemaTarget", () => {
  test("follows the version's major, and the schema option on Ghost 6", () => {
    expect(schemaTarget("v5.130")).toBe("v5");
    expect(schemaTarget("v6.0")).toBe("v6-compat");
    expect(schemaTarget("v6.72", { schema: "compat" })).toBe("v6-compat");
    expect(schemaTarget("v6.72", { schema: "latest" })).toBe("v6-latest");
  });

  test("refuses latest on Ghost 5, which has one target", () => {
    expect(() => schemaTarget("v5.130", { schema: "latest" as never })).toThrow(
      /schema: "latest" needs a Ghost 6 version/,
    );
  });
});
