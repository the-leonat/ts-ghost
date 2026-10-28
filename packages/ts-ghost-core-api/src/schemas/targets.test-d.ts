import { describe, expectTypeOf, test } from "vitest";
import { z } from "zod";

import {
  defineGhostObject,
  type ResourcesAbsentIn,
  type SchemaTarget,
  type SchemaTargetOf,
} from "./targets";

const fields = {
  "thing.from_6_0": { since: "6.0" },
  "thing.from_6_13": { since: "6.13" },
  "thing.until_6_40": { until: "6.40" },
  "thing.v5_only": { until: "6.0" },
} as const;
const ghostObject = defineGhostObject(fields);
const thing = <T extends SchemaTarget>(target: T) =>
  ghostObject(target, "thing", {
    always: z.string(),
    nullable: z.string().nullable(),
    from_6_0: z.boolean(),
    from_6_13: z.boolean(),
    until_6_40: z.boolean(),
    v5_only: z.boolean(),
  });

void thing;

describe("Ghost object types per target", () => {
  test("v5", () => {
    expectTypeOf<z.output<ReturnType<typeof thing<"v5">>>>().toEqualTypeOf<{
      always: string;
      nullable: string | null;
      until_6_40: boolean;
      v5_only: boolean;
    }>();
  });

  test("v6-compat", () => {
    expectTypeOf<z.output<ReturnType<typeof thing<"v6-compat">>>>().toEqualTypeOf<{
      always: string;
      nullable: string | null;
      from_6_0: boolean;
      from_6_13?: boolean | undefined;
      until_6_40?: boolean | undefined;
    }>();
  });

  test("v6-latest", () => {
    expectTypeOf<z.output<ReturnType<typeof thing<"v6-latest">>>>().toEqualTypeOf<{
      always: string;
      nullable: string | null;
      from_6_0: boolean;
      from_6_13: boolean;
    }>();
  });
});

describe("ResourcesAbsentIn", () => {
  type Table = {
    "resource.automations": { since: "6.10" };
    "resource.labs_only": { since: "6.0" };
    "resource.retired": { until: "6.40" };
    "posts.title": { since: "6.2" };
  };
  type Absent<T extends SchemaTarget> = ResourcesAbsentIn<Table, T>;

  test("v5 lacks every resource Ghost 6 added; v6-latest lacks removed ones; v6-compat keeps all", () => {
    expectTypeOf<Absent<"v5">>().toEqualTypeOf<"automations" | "labs_only">();
    expectTypeOf<Absent<"v6-compat">>().toEqualTypeOf<never>();
    expectTypeOf<Absent<"v6-latest">>().toEqualTypeOf<"retired">();
  });

  test("hides them from a client type, so using one is a type error", () => {
    type Client = { posts: 1; automations: 2; retired: 3 };
    const v5 = {} as Omit<Client, Absent<"v5">>;
    // @ts-expect-error v5 has no automations resource
    void v5.automations;
    expectTypeOf<Omit<Client, Absent<"v6-compat">>>().toEqualTypeOf<Client>();
  });
});

describe("SchemaTargetOf", () => {
  test("follows the version literal and the schema option", () => {
    expectTypeOf<SchemaTargetOf<"v5.130", {}>>().toEqualTypeOf<"v5">();
    expectTypeOf<SchemaTargetOf<"v6.x", {}>>().toEqualTypeOf<"v6-compat">();
    expectTypeOf<SchemaTargetOf<"v6.72", { schema: "latest" }>>().toEqualTypeOf<"v6-latest">();
    expectTypeOf<SchemaTargetOf<"v6.72", { schema: "compat" }>>().toEqualTypeOf<"v6-compat">();
  });

  test("is v6-compat when the version is any or not a literal", () => {
    expectTypeOf<SchemaTargetOf<any, undefined>>().toEqualTypeOf<"v6-compat">();
    expectTypeOf<SchemaTargetOf<`v5.${string}` | `v6.${string}`, undefined>>().toEqualTypeOf<"v6-compat">();
  });
});
