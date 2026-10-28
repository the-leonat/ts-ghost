import { describe, expect, inject, test } from "vitest";

import { undeclaredKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Title the bootstrap gives the site at first-run setup.
const BLOG_TITLE = "ts-ghost conformance";

describe("settings", () => {
  liveResponses();

  test("GET /settings/ returns every setting as key and value", async () => {
    const result = await adminApi().settings.fetch();
    expect(undeclaredKeys(result)).toEqual([]);
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.find((s) => s.key === "title")?.value).toBe(BLOG_TITLE);
    expect(result.data.some((s) => s.value === null)).toBe(true);
  });
});

describe("site", () => {
  test("GET /site/ returns the site's title and url", async () => {
    const result = await adminApi().site.fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.title).toBe(BLOG_TITLE);
    expect(result.data.url.replace(/\/$/, "")).toBe(inject("ghost").url);
  });
});
