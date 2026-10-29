import { describe, expect, inject } from "vitest";

import { adminApiUrl } from "../ghost/admin-api.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("bootstrap credentials", () => {
  liveTest.for(["integration", "staff"] as const)(
    "the %s key authenticates the public client",
    async (key, { apiFor }) => {
      const result = await apiFor(key).tags.browse({ limit: 1 }).fetch();
      assertOk(result);
    },
  );

  liveTest("the session cookie authenticates as the Owner", async () => {
    const ghost = inject("ghost");
    const response = await fetch(`${adminApiUrl(ghost.url)}/users/me/`, {
      headers: { cookie: ghost.sessionCookie },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { users: { email: string }[] };
    expect(body.users[0]?.email).toBe(ghost.owner.email);
  });
});
