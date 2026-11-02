// Seeds percent, fixed, retention and trial offers on Ghost's default paid tier.

import { adminApi, type LiveGhost } from "../ghost/admin-client.ts";
import { versionAtLeast } from "../ghost/versions.ts";
import { must, sessionRequest, uniqueSuffix } from "./helpers.ts";

type Offer = { id: string; code: string };

/**
 * Seeds offers on Ghost's default paid tier: a repeating percent and a fixed offer through the client, and a
 * retention and a trial offer over the session, since the client can't create either.
 */
export async function seedOffers(ghost: LiveGhost) {
  const admin = adminApi(ghost, ghost.leg);
  const suffix = uniqueSuffix();
  const tiers = must(await admin.tiers.browse({ filter: "slug:default-product" }).fetch(), "offer seed");
  const tierId = tiers[0]!.id;
  const offer = async (body: object) =>
    (await sessionRequest<{ offers: Offer[] }>(ghost, "POST", "/offers/", { offers: [body] })).offers[0]!;

  const repeating = must(
    await admin.offers.add({
      name: `Repeating ${suffix}`,
      code: `repeating-${suffix}`,
      type: "percent",
      cadence: "month",
      amount: 15,
      duration: "repeating",
      duration_in_months: 3,
      tier: { id: tierId },
    }),
    "offer seed",
  );
  const fixed = must(
    await admin.offers.add({
      name: `Fixed ${suffix}`,
      code: `fixed-${suffix}`,
      type: "fixed",
      cadence: "year",
      amount: 500,
      duration: "once",
      currency: "USD",
      tier: { id: tierId },
    }),
    "offer seed",
  );
  // Body as in Ghost's own e2e offers test; Ghost before 6.18 has no retention offers (answers 500).
  const retention = versionAtLeast(ghost.version, "6.18.0")
    ? await offer({
        name: `Retention ${suffix}`,
        code: `retention-${suffix}`,
        display_title: "Stay with us",
        display_description: "10% off if you stay",
        type: "percent",
        cadence: "month",
        amount: 10,
        duration: "forever",
        duration_in_months: null,
        currency_restriction: false,
        currency: null,
        status: "active",
        redemption_type: "retention",
        tier: null,
      })
    : undefined;
  const trial = await offer({
    name: `Trial ${suffix}`,
    code: `trial-${suffix}`,
    type: "trial",
    cadence: "year",
    amount: 14,
    duration: "trial",
    currency: "USD",
    tier: { id: tierId },
  });
  return { tierId, repeating, fixed, retention, trial };
}
