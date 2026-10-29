import { beforeAll, describe, expect, inject } from "vitest";

import { seedUsers, STAFF_PROFILE, TOUR } from "../seeds/users.ts";
import { undeclaredKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("users", () => {
  let seeded: Awaited<ReturnType<typeof seedUsers>>;
  beforeAll(async () => {
    seeded = await seedUsers();
  });

  liveTest("GET /users/:id/ and /users/email/:email/ return the same user", async ({ api }) => {
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    assertOk(owner);

    for (const { id, email } of [{ id: owner.data.id, email: owner.data.email! }, seeded.staff]) {
      const byId = await api.users.read({ id }).fetch();
      const byEmail = await api.users.read({ email }).fetch();
      assertOk(byId);
      assertOk(byEmail);
      expect(byEmail.data).toEqual(byId.data);
    }
  });

  liveTest("GET /users/:id/ returns profile fields both null and set", async ({ api }) => {
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    const staff = await api.users.read({ id: seeded.staff.id }).fetch();
    assertOk(owner);
    assertOk(staff);

    expect(owner.data.bio).toBeNull();
    expect(staff.data).toMatchObject({ ...STAFF_PROFILE, status: "active" });
    expect(staff.data.last_seen).toEqual(expect.any(String));
  });

  liveTest("GET /users/:id/ returns a user's tour", async ({ api }) => {
    const result = await api.users.read({ id: seeded.toured.id }).fetch();
    assertOk(result);
    expect(result.data.tour).toBe(TOUR);
  });

  liveTest("GET /users/ lists an inactive user", async ({ api }) => {
    const filter = `slug:[${seeded.suspended.slug},${seeded.staff.slug}]` as const;
    const result = await api.users.browse({ filter }).fetch();
    assertOk(result);

    expect(result.data.find((u) => u.id === seeded.suspended.id)?.status).toBe("inactive");
    expect(result.data.map((u) => u.id)).toEqual(expect.arrayContaining([seeded.staff.id]));
  });

  liveTest("user responses send no key the client's schema lacks", async ({ api }) => {
    const read = await api.users.read({ id: seeded.staff.id }).fetch();
    const byEmail = await api.users.read({ email: seeded.staff.email }).fetch();
    expect(undeclaredKeys(read, byEmail)).toEqual([]);
    assertOk(read);
    assertOk(byEmail);
  });
});
