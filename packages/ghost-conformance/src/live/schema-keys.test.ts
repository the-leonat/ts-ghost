// Checks the schema helpers: nullable and deprecated keys, nullability gaps, read-back and unsent inputs.

import { describe, expect, test } from "vitest";
import {
  adminMembersCreateSchema,
  adminMembersUpdateSchema,
  adminPostsCreateSchema,
  adminSchemas,
} from "@ts-ghost/admin-api";

import { deprecatedKeys, nullabilityGaps, nullableKeys, readBack, unsentInputs } from "./schema-keys.ts";

describe("nullableKeys", () => {
  test("lists the top-level keys that may be null, under optional and meta", () => {
    const keys = nullableKeys(adminSchemas.latest.tags);
    expect(keys).toEqual(expect.arrayContaining(["description", "feature_image", "accent_color"]));
    expect(keys).not.toContain("name");
    expect(keys).not.toContain("url");
  });

  test("counts a nullish key, but not one whose catch turns null into a default", () => {
    const keys = nullableKeys(adminSchemas.latest.posts);
    expect(keys).toContain("email");
    expect(keys).not.toContain("html");
  });
});

describe("deprecatedKeys", () => {
  test("lists the inputs marked deprecated, which Ghost drops", () => {
    expect(deprecatedKeys(adminPostsCreateSchema)).toEqual(["newsletter"]);
    expect(deprecatedKeys(adminMembersCreateSchema)).toEqual(["geolocation"]);
    expect(deprecatedKeys(adminMembersUpdateSchema)).toEqual(["geolocation", "stripe_customer_id"]);
  });
});

describe("nullabilityGaps", () => {
  const schema = adminSchemas.latest.tags;
  const every = (value: unknown) => Object.fromEntries(nullableKeys(schema).map((k) => [k, value]));

  test("is empty when every nullable key is null on one variant and set on another", () => {
    expect(nullabilityGaps(schema, [every(null), every("x")])).toEqual([]);
  });

  test("names a key never null and a key never set", () => {
    const variants = [
      { ...every(null), description: "d" },
      { ...every("x"), accent_color: null },
    ];
    expect(nullabilityGaps(schema, variants)).toEqual([
      "description is never null",
      "accent_color is never set",
    ]);
  });

  test("skips a key this Ghost doesn't send and a key listed as an exception", () => {
    const bare: Record<string, unknown> = { ...every(null), accent_color: "x" };
    const full: Record<string, unknown> = every("x");
    delete bare.feature_image;
    delete full.feature_image;
    expect(nullabilityGaps(schema, [bare, full], { accent_color: "no input nulls it" })).toEqual([]);
  });
});

describe("readBack", () => {
  test("expects every value sent, with dates as ISO strings and relations by the keys sent", () => {
    const at = new Date("2026-01-02T03:04:05.000Z");
    const sent = { title: "T", published_at: at, tags: [{ name: "a" }], newsletter: { id: "n" } };
    const expected = readBack(sent, ["newsletter"]);
    const read = { title: "T", published_at: at.toISOString(), tags: [{ id: "1", name: "a" }] };
    expect(read).toMatchObject(expected);
    expect({ ...read, tags: [] }).not.toMatchObject(expected);
  });
});

describe("unsentInputs", () => {
  test("lists the inputs no request of a round trip sent", () => {
    expect(unsentInputs(adminMembersCreateSchema, { email: "e", name: "n" }, { note: "x" })).toEqual([
      "geolocation",
      "labels",
      "products",
      "newsletters",
      "subscribed",
      "comped",
      "stripe_customer_id",
    ]);
  });
});
