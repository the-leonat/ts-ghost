import { describe, expectTypeOf, test } from "vitest";
import { GHOST_LATEST } from "@ts-ghost/core-api";

import { TSGhostContentAPI } from "./content-api";

const key = "1efedd9db174adee2d23d982";

describe("selection", () => {
  test('{ schema: "latest" } takes exactly the version of GHOST_LATEST', () => {
    expectTypeOf(
      new TSGhostContentAPI("https://ghost.org", key, `v${GHOST_LATEST}`, { schema: "latest" }).target,
    ).toEqualTypeOf<"v6-latest">();
  });

  test('{ schema: "latest" } with another version is a type error naming the expected one', () => {
    // @ts-expect-error Argument of type '"v6.2"' is not assignable to parameter of type '"v6.72"' (GHOST_LATEST)
    new TSGhostContentAPI("https://ghost.org", key, "v6.2", { schema: "latest" });
    // @ts-expect-error Ghost 5 has one schema target
    new TSGhostContentAPI("https://ghost.org", key, "v5.130", { schema: "latest" });
  });

  test("without latest, any Ghost 5 or 6 version is accepted", () => {
    expectTypeOf(
      new TSGhostContentAPI("https://ghost.org", key, "v6.2").target,
    ).toEqualTypeOf<"v6-compat">();
    expectTypeOf(new TSGhostContentAPI("https://ghost.org", key, "v5.130").target).toEqualTypeOf<"v5">();
  });
});
