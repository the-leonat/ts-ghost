import { describe, expect, inject } from "vitest";

import { BLOG_TITLE } from "../ghost/bootstrap.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("site", () => {
  liveTest("GET /site/ succeeds and parses with the client's schema", async ({ api }) => {
    const result = await api.site.fetch();
    assertOk(result);
  });

  liveTest("GET /site/ returns the site's title and url", async ({ api }) => {
    const result = await api.site.fetch();
    assertOk(result);

    expect(result.data.title).toBe(BLOG_TITLE);
    expect(result.data.url.replace(/\/$/, "")).toBe(inject("ghost").url);
  });

  liveTest("GET /site/ sends no key the client's schema lacks", async ({ api }) => {
    expect(undeclaredKeys(await api.site.fetch())).toEqual([]);
  });
});
