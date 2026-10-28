import { describe, expectTypeOf, test } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";

const api = new TSGhostAdminAPI("https://ghost.org", "1:2", "v6.0");

describe("tiers", () => {
  test("Ghost's tiers endpoint always sends benefits, so they are typed as present", async () => {
    const browsed = await api.tiers.browse().fetch();
    if (browsed.success) expectTypeOf(browsed.data[0]!.benefits).toEqualTypeOf<string[]>();
    const read = await api.tiers.read({ id: "x" }).fetch();
    if (read.success) expectTypeOf(read.data.benefits).toEqualTypeOf<string[]>();
  });
});
