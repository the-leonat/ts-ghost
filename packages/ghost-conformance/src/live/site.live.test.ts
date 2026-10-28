import { describe, expect, test } from "vitest";

import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

describe("site", () => {
  liveResponses();

  test("GET /site/ succeeds and parses with the client's schema", async () => {
    const result = await adminApi().site.fetch();
    expect(result.success).toBe(true);
  });

  test("GET /site/ sends no key the client's schema lacks", async () => {
    expect(undeclaredKeys(await adminApi().site.fetch())).toEqual([]);
  });
});
