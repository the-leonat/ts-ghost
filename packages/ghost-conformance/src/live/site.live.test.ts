// Live: the site response parses.

import { describe } from "vitest";

import { assertOk, liveTest } from "./live-test.ts";

describe("site", () => {
  liveTest("GET /site/ parses", async ({ api }) => {
    assertOk(await api.site.fetch());
  });
});
