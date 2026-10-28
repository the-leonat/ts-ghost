import { describe, expect, test } from "vitest";

import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

describe("site", () => {
  const responses = liveResponses({ ignore: IGNORED });

  test("GET /site/ succeeds and parses with the client's schema", async () => {
    const result = await adminApi().site.fetch();
    expect(result.success).toBe(true);
  });

  test("GET /site/ sends no key the client's schema lacks", async () => {
    const result = await adminApi().site.fetch();
    if (!result.success) throw new Error("site fetch failed");

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site", ignore: IGNORED })).toEqual([]);
  });
});
