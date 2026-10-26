import { describe, expect, test } from "vitest";

import { crossCheck, type ResourceClaim, type RouteSpec } from "./cross-check";

const action = (name: string, items: Record<string, unknown>) => ({
  $id: name.replace("-", "."),
  type: "object",
  additionalProperties: false,
  properties: { [name.split("-")[0]!]: { type: "array", minItems: 1, maxItems: 1, items } },
  required: [name.split("-")[0]],
});

const spec: RouteSpec = {
  ghostVersion: "6.72.0",
  routes: [
    {
      method: "POST",
      path: "/tags",
      integrationToken: "allowed",
      controller: { endpoint: "tags", method: "add" },
    },
    {
      method: "PUT",
      path: "/tags/:id",
      integrationToken: "allowed",
      controller: { endpoint: "tags", method: "edit" },
    },
  ],
  controllers: {},
  adminApiSchemas: {
    "tags-add": action("tags-add", {
      type: "object",
      allOf: [{ $ref: "tags#/definitions/tag" }],
      required: ["name"],
    }),
    "tags-edit": action("tags-edit", { $ref: "tags#/definitions/tag" }),
  },
  adminApiSchemaDefinitions: {
    tags: {
      $id: "tags",
      definitions: {
        tag: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string", maxLength: 191 },
            slug: { type: ["string", "null"] },
            accent_color: { type: ["string", "null"] },
          },
        },
      },
    },
  },
};

const tags = (add: Record<string, unknown>, edit?: Record<string, unknown>): ResourceClaim => ({
  resource: "tags",
  operations: edit ? ["add", "edit"] : ["add"],
  identities: [],
  includes: [],
  inputs: { add, ...(edit ? { edit } : {}) },
});

const object = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  required,
});

describe("input cross-check", () => {
  test("fails a key the library sends that Ghost's input schema does not declare", () => {
    const claim = tags(object({ name: { type: "string" }, colour: { type: "string" } }, ["name"]));

    expect(crossCheck([claim], spec).failures).toEqual([
      'tags.add() accepts "colour", which Ghost\'s tags-add schema does not declare (Ghost drops it)',
    ]);
  });

  test("fails a key the library sends as a type Ghost's input schema rejects", () => {
    const claim = tags(object({ name: { type: "string" }, slug: { type: "number" } }, ["name"]));

    expect(crossCheck([claim], spec).failures).toEqual([
      'tags.add() accepts "slug" as number, but Ghost\'s tags-add schema allows only null | string',
    ]);
  });

  test("fails a key Ghost requires that the library lets callers leave out", () => {
    const claim = tags(object({ name: { type: "string" } }));

    expect(crossCheck([claim], spec).failures).toEqual([
      'tags.add() lets callers leave out "name", which Ghost\'s tags-add schema requires',
    ]);
  });

  test("reports, without failing, keys and types Ghost accepts that the library does not model", () => {
    const claim = tags(
      object({ name: { type: "string" }, slug: { type: "string" } }, ["name"]),
      object({ name: { type: "string" } }),
    );

    const result = crossCheck([claim], spec);

    expect(result.failures).toEqual([]);
    expect(result.inputGaps).toEqual([
      'tags.add() does not accept "slug" as null, which Ghost\'s tags-add schema allows',
      'tags.add() does not model "accent_color", which Ghost\'s tags-add schema accepts',
      'tags.edit() does not model "slug", which Ghost\'s tags-edit schema accepts',
      'tags.edit() does not model "accent_color", which Ghost\'s tags-edit schema accepts',
    ]);
  });

  test("reports resources Ghost has no input schema for as not covered", () => {
    const offers: ResourceClaim = {
      resource: "offers",
      operations: ["add", "edit"],
      identities: [],
      includes: [],
      inputs: { add: object({ name: { type: "string" } }) },
    };
    const users: ResourceClaim = { resource: "users", operations: ["browse"], identities: [], includes: [] };

    const result = crossCheck([offers, users, tags(object({ name: { type: "string" } }, ["name"]))], spec);

    expect(result.inputsUncovered).toEqual(["offers", "users"]);
  });
});
