import { describe, expect } from "vitest";

import { BLOG_TITLE } from "../ghost/bootstrap.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("settings", () => {
  liveTest("GET /settings/ returns every setting as key and value", async ({ api }) => {
    const result = await api.settings.fetch();
    assertOk(result);

    expect(result.data.find((s) => s.key === "title")?.value).toBe(BLOG_TITLE);
    expect(result.data.some((s) => s.value === null)).toBe(true);
  });
});
