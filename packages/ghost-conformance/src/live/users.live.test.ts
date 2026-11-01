// Live: the users schemas, shape and nullability.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminSchemas } from "@ts-ghost/admin-api";

import { seedUsers } from "../seeds/users.ts";
import { assertOk, liveTest } from "./live-test.ts";
import { nullabilityGaps } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedUsers>>;
beforeAll(async () => {
  seed = await seedUsers(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].users;

// No mutations or includes in the client: one shape test.
describe("users", () => {
  liveTest("every seeded user parses, each nullable field both null and set", async ({ api, ghost }) => {
    assertOk(await api.users.browse({ filter: `slug:[${seed.staff.slug},${seed.suspended.slug}]` }).fetch());
    const owner = await api.users.read({ email: ghost.owner.email }).fetch();
    const staff = await api.users.read({ id: seed.staff.id }).fetch();
    const suspended = await api.users.read({ id: seed.suspended.id }).fetch();
    assertOk(owner);
    assertOk(staff);
    assertOk(suspended);
    assertOk(await api.users.read({ email: seed.staff.email }).fetch());
    assertOk(await api.users.read({ slug: seed.staff.slug }).fetch());
    expect(suspended.data.status).toBe("inactive");

    expect(nullabilityGaps(schema, [owner.data, staff.data, suspended.data])).toEqual([]);
  });
});
