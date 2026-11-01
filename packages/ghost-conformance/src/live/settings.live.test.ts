// Live: the settings response parses.

import { describe } from "vitest";

import { assertOk, liveTest } from "./live-test.ts";

describe("settings", () => {
  liveTest("GET /settings/ parses", async ({ api }) => {
    assertOk(await api.settings.fetch());
  });
});
