import { beforeAll, describe, expect, inject, test } from "vitest";

import { seedUsers, STAFF_PROFILE, TOUR } from "../seeds/users.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

describe("users", () => {
  const responses = liveResponses({ ignore: IGNORED });
  let seeded: Awaited<ReturnType<typeof seedUsers>>;
  beforeAll(async () => {
    seeded = await seedUsers();
  });

  test("GET /users/:id/ and /users/email/:email/ return the same user", async () => {
    const api = adminApi();
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    if (!owner.success) throw new Error(JSON.stringify(owner.errors));

    for (const { id, email } of [{ id: owner.data.id, email: owner.data.email! }, seeded.staff]) {
      const byId = await api.users.read({ id }).fetch();
      const byEmail = await api.users.read({ email }).fetch();
      if (!byId.success || !byEmail.success) throw new Error("user read failed");
      expect(byEmail.data).toEqual(byId.data);
    }
  });

  test("GET /users/:id/ returns profile fields both null and set", async () => {
    const api = adminApi();
    const owner = await api.users.read({ email: inject("ghost").owner.email }).fetch();
    const staff = await api.users.read({ id: seeded.staff.id }).fetch();
    if (!owner.success || !staff.success) throw new Error("user read failed");

    expect(owner.data.bio).toBeNull();
    expect(staff.data).toMatchObject({ ...STAFF_PROFILE, status: "active" });
    expect(staff.data.last_seen).toEqual(expect.any(String));
  });

  test("GET /users/:id/ returns a user's tour", async () => {
    const result = await adminApi().users.read({ id: seeded.toured.id }).fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));
    expect(result.data.tour).toBe(TOUR);
  });

  test("GET /users/ lists an inactive user", async () => {
    const filter = `slug:[${seeded.suspended.slug},${seeded.staff.slug}]` as const;
    const result = await adminApi().users.browse({ filter }).fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.find((u) => u.id === seeded.suspended.id)?.status).toBe("inactive");
    expect(result.data.map((u) => u.id)).toEqual(expect.arrayContaining([seeded.staff.id]));
  });

  test("user responses send no key the client's schema lacks", async () => {
    const api = adminApi();
    const read = await api.users.read({ id: seeded.staff.id }).fetch();
    const readRaw = responses.last(`/users/${seeded.staff.id}/`) as { users: unknown[] };
    const byEmail = await api.users.read({ email: seeded.staff.email }).fetch();
    const emailRaw = responses.last(`/users/email/`) as { users: unknown[] };
    if (!read.success || !byEmail.success) throw new Error("user read failed");

    expect([
      ...unknownKeys(readRaw.users[0], read.data, { at: "read.user", ignore: IGNORED }),
      ...unknownKeys(emailRaw.users[0], byEmail.data, { at: "email.user", ignore: IGNORED }),
    ]).toEqual([]);
  });
});
