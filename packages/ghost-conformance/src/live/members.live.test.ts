// Live: the members schemas, shape and nullability, includes, and the round trip on latest.

import { beforeAll, describe, expect, inject } from "vitest";
import { adminMembersCreateSchema, adminMembersUpdateSchema, adminSchemas } from "@ts-ghost/admin-api";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { must, uniqueSuffix } from "../seeds/helpers.ts";
import { MEMBER_SEED, seedMembers } from "../seeds/members.ts";
import { STRIPE_SEED } from "../seeds/stripe.ts";
import { assertOk, liveTest, onLatest, type LiveContext } from "./live-test.ts";
import { requireRoute } from "./require-route.ts";
import { deprecatedKeys, nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

let seed: Awaited<ReturnType<typeof seedMembers>>;
beforeAll(async () => {
  seed = await seedMembers(inject("ghost"));
});

const schema = adminSchemas[inject("ghost").leg.target].members;

/** Nullable member fields no seed nulls or sets, with the reason. */
const NOT_SEEDABLE = {
  geolocation: "Ghost sets it from the signup request's IP; the Admin API drops the input",
  email_open_rate: "Ghost computes it only after several tracked emails",
  last_seen_at: "Ghost sets it when the member visits the site",
  avatar_image:
    "Gravatar, on by default, gives every member one; patching the config would affect every file",
  attribution: "Ghost records the Admin API as the source of every member the suite adds",
  updated_at: "Ghost sets it on every write",
  enable_updates_and_announcements: "only the member sets it, in Portal",
  uuid: "nullable on compat for members from before 6.0; Ghost gives every new member one",
};

/** Every seeded variant; the SQL seeds add suppressed, emailed and Stripe-paid members. */
const VARIANTS = [
  MEMBER_SEED.full,
  MEMBER_SEED.comped,
  MEMBER_SEED.metafields,
  ...Object.values(EMAIL_SEED.members),
  ...Object.values(STRIPE_SEED.members),
];

async function readByEmail(api: LiveContext["api"], email: string) {
  const browsed = must(await api.members.browse({ filter: `email:'${email}'` }).fetch(), email);
  const read = await api.members.read({ id: browsed[0]!.id }).fetch();
  assertOk(read);
  return read.data;
}

describe("members", () => {
  liveTest("every seeded member parses, each nullable field both null and set", async ({ api }) => {
    assertOk(
      await api.members.browse({ filter: `email:[${VARIANTS.map((e) => `'${e}'`).join(",")}]` }).fetch(),
    );
    const bare = await readByEmail(api, MEMBER_SEED.bare);
    const full = await Promise.all(VARIANTS.map((email) => readByEmail(api, email)));

    expect(nullabilityGaps(schema, [bare, ...full], NOT_SEEDABLE)).toEqual([]);
  });

  liveTest.for([
    { key: "tiers", email: MEMBER_SEED.comped, include: { tiers: true }, browse: true },
    { key: "email_recipients", email: EMAIL_SEED.members.recipient, include: { email_recipients: true } },
    { key: "metafields", email: MEMBER_SEED.metafields, include: { metafields: true }, browse: true },
  ] as const)("$key comes with its include and not without", async (row, { api, skip }) => {
    if (row.key === "metafields") requireRoute({ skip }, "GET /members/metafields/:namespace/");
    const filter = `email:'${row.email}'` as const;
    const id = must(await api.members.browse({ filter }).fetch(), row.email)[0]!.id;
    // A read always sends tiers, so tiers are checked on a browse.
    const fetch = async (include: object) => {
      const result =
        "browse" in row
          ? await api.members.browse({ filter }).include(include).fetch()
          : await api.members.read({ id }).include(include).fetch();
      assertOk(result);
      return (Array.isArray(result.data) ? result.data[0] : result.data) as Record<string, unknown>;
    };
    expect(Object.keys((await fetch(row.include))[row.key] ?? {})).not.toHaveLength(0);
    expect(await fetch({})).not.toHaveProperty(row.key);
  });

  liveTest.runIf(onLatest)("add and edit with every input read back what was sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const newsletter = must(
      await api.newsletters.browse({ filter: "slug:default-newsletter" }).fetch(),
      "nl",
    )[0]!;
    const add = {
      email: `member-trip-${suffix}@conformance.test`,
      name: "Round Trip",
      note: "added",
      geolocation: '{"country":"Germany"}',
      labels: [{ name: `Round trip ${suffix}` }],
      newsletters: [{ id: newsletter.id }],
      products: [{ id: seed.paidTier.id }],
    };
    const added = await api.members.add(add);
    assertOk(added);
    const id = added.data.id;
    const read = async () => {
      const result = await api.members.read({ id }).fetch();
      assertOk(result);
      return result.data;
    };
    // `products` reads back as the member's tiers.
    const omitOnAdd = [...deprecatedKeys(adminMembersCreateSchema), "products"];
    expect(await read()).toMatchObject({
      ...readBack(add, omitOnAdd),
      tiers: [expect.objectContaining({ id: seed.paidTier.id })],
    });

    // Ghost acts on `comped` only with Stripe connected, which the suite lacks.
    const edit = {
      email: `member-edited-${suffix}@conformance.test`,
      name: "Edited Trip",
      note: "edited",
      labels: [{ name: `Edited trip ${suffix}` }],
      subscribed: false,
      products: [],
      comped: false,
      stripe_customer_id: "cus_dropped",
    };
    assertOk(await api.members.edit(id, edit));
    const omitOnEdit = [...deprecatedKeys(adminMembersUpdateSchema), "products", "comped"];
    expect(await read()).toMatchObject({
      ...readBack(edit, omitOnEdit),
      newsletters: [],
      tiers: [],
    });

    // stripe_customer_id is sent on edit only: an add with it needs a Stripe connection the suite lacks.
    expect(unsentInputs(adminMembersCreateSchema, add, edit)).toEqual([]);
    expect(await api.members.delete(id)).toEqual({ success: true });
  });
});
