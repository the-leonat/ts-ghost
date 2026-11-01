// Live: the integration key and the staff token both authenticate the client.

import { describe } from "vitest";

import { assertOk, liveTest } from "./live-test.ts";

describe("credentials", () => {
  liveTest.for(["integration", "staff"] as const)(
    "the %s key authenticates the client",
    async (key, { apiFor }) => {
      assertOk(await apiFor(key).tags.browse({ limit: 1 }).fetch());
    },
  );
});
