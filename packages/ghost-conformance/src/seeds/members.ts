// Seeds the members tests' members: bare, full, comped and with a metafield.

import { adminApi, type LiveGhost } from "../ghost/admin-client.ts";
import { manifestFor } from "../manifest/manifest-files.ts";
import { must, sessionRequest } from "./helpers.ts";

/** Members the member suite seeds; looked up by email. */
export const MEMBER_SEED = {
  /** Only an email, so every nullable field is null. */
  bare: "member-bare@conformance.test",
  /** Name, note, a label and the default newsletter. */
  full: "member-full@conformance.test",
  /** Comped onto the paid tier (Ghost's stand-in subscription). */
  comped: "member-comped@conformance.test",
  /** Free, with a custom metafield value. */
  metafields: "member-metafields@conformance.test",
  label: "Conformance members",
  metafield: { namespace: "custom", key: "company", value: "Acme" },
} as const;

/** Seeds MEMBER_SEED through the client; the comped member and metafields go over the Owner's session. */
export async function seedMembers(ghost: LiveGhost) {
  const admin = adminApi(ghost, ghost.leg);
  const tiers = must(await admin.tiers.browse({ filter: "slug:default-product" }).fetch(), "member seed");
  const paidTier = tiers[0]!;
  const session = (method: string, path: string, body: unknown) =>
    sessionRequest<{ members?: { id: string }[] }>(ghost, method, path, body);

  const bare = must(await admin.members.add({ email: MEMBER_SEED.bare }), "bare member");
  // Sequential: concurrent creates that share a new label race on inserting it.
  const full = must(
    await admin.members.add({
      email: MEMBER_SEED.full,
      name: "Full Member",
      note: "seeded",
      labels: [{ name: MEMBER_SEED.label }],
      subscribed: true,
    }),
    "full member",
  );
  // Ghost's `tiers` input, which the client doesn't offer; `products` would do the same.
  const comped = (
    await session("POST", "/members/", {
      members: [
        { email: MEMBER_SEED.comped, labels: [{ name: MEMBER_SEED.label }], tiers: [{ id: paidTier.id }] },
      ],
    })
  ).members![0]!;
  const withMetafields = must(await admin.members.add({ email: MEMBER_SEED.metafields }), "member seed");

  if (manifestFor(ghost.version).has("POST /members/metafields/:namespace/")) {
    // Member metafields are behind the `membersCustomFields` labs flag, which only staff can switch on.
    const { namespace, key, value } = MEMBER_SEED.metafield;
    await session("PUT", "/settings/", {
      settings: [{ key: "labs", value: '{"membersCustomFields":true}' }],
    });
    await session("POST", `/members/metafields/${namespace}`, {
      members_metafields: [{ key, type: "short_text", name: "Company" }],
    });
    await session("PUT", `/members/${withMetafields.id}/`, {
      members: [{ metafields: { [namespace]: { [key]: value } } }],
    });
  }

  return { bare, full, comped, withMetafields, paidTier };
}
