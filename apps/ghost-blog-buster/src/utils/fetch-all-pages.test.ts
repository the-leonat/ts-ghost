import { describe, expect, test } from "vitest";

import { fetchAllPages } from "./fetch-all-pages";

type Page = Parameters<typeof fetchAllPages<number>>[0] extends Promise<infer P> ? P : never;

const ok = (data: number[], next?: Page): Page => ({
  current: { success: true, data },
  next: next && { paginate: async () => next },
});

describe("fetchAllPages", () => {
  test("collects every page in order", async () => {
    expect(await fetchAllPages(Promise.resolve(ok([1, 2], ok([3], ok([4])))))).toEqual([1, 2, 3, 4]);
  });

  test("throws with the failed page's errors instead of returning a partial export", async () => {
    const failed: Page = {
      current: { success: false, errors: [{ type: "ResponseSchemaError", message: "bad post" }] },
    };
    await expect(fetchAllPages(Promise.resolve(ok([1], failed)))).rejects.toThrow(
      "ResponseSchemaError: bad post",
    );
  });
});
