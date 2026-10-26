/**
 * Client checks over members: their includes and the relations Ghost sends
 * with them, against the recorded member fixtures.
 */
import { assert, describe, expect, test } from "vitest";

import { fixtureId } from "./fixture-server";
import { fetchMocker, useClientCheck } from "./harness";

const BY_EMAIL = { order: "email asc" } as const;

describe("client check: members", () => {
  const check = useClientCheck();

  test("a plain browse, a read by id and an add validate, members without an avatar included", async () => {
    const browsed = await check.api.members.browse(BY_EMAIL).fetch();
    const read = await check.api.members.read({ id: fixtureId("members.seeded") }).fetch();
    const added = await check.api.members.add({
      email: "ts-ghost-recorder@example.com",
      name: "ts-ghost recorder member",
    });

    assert(browsed.success && read.success && added.success);
    expect(browsed.data).toHaveLength(9);
    expect(read.data).toMatchObject({ email: "comped@test.com", status: "paid", avatar_image: null });
    expect(added.data).toMatchObject({ email: "ts-ghost-recorder@example.com", status: "free" });
  });

  test("a browse sends a member's tiers only when they are included", async () => {
    const plain = await check.api.members.browse(BY_EMAIL).fetch();
    const included = await check.api.members.browse(BY_EMAIL).include({ tiers: true }).fetch();

    assert(plain.success && included.success);
    expect(plain.data.every((member) => member.tiers === undefined)).toBe(true);
    const paid = included.data.find((member) => member.id === fixtureId("members.seeded"));
    expect(paid?.tiers).toEqual([
      expect.objectContaining({
        id: fixtureId("tiers.seeded"),
        slug: "default-product",
        type: "paid",
        monthly_price: 500,
      }),
    ]);
    expect(included.data.find((member) => member.status === "free")?.tiers).toEqual([]);
  });

  test("a read by id sends the member's tiers, included or not", async () => {
    const plain = await check.api.members.read({ id: fixtureId("members.seeded") }).fetch();
    const included = await check.api.members
      .read({ id: fixtureId("members.seeded") })
      .include({ tiers: true })
      .fetch();

    assert(plain.success && included.success);
    expect(included.data.tiers.map((tier) => tier.slug)).toEqual(["default-product"]);
    expect(plain.data.tiers).toEqual(included.data.tiers);
  });

  test("a browse sends a member's email recipients only when they are included", async () => {
    const plain = await check.api.members.browse(BY_EMAIL).fetch();
    const included = await check.api.members.browse(BY_EMAIL).include({ email_recipients: true }).fetch();

    assert(plain.success && included.success);
    expect(plain.data.every((member) => member.email_recipients === undefined)).toBe(true);
    // Ghost's `members:emails` seed sent one newsletter to five seeded members.
    const recipients = included.data.flatMap((member) => member.email_recipients);
    expect(recipients).toHaveLength(5);
    expect(new Set(recipients.map((recipient) => recipient.email_id)).size).toBe(1);
    const member2 = included.data.find((member) => member.email === "member2@test.com");
    expect(member2?.email_recipients).toEqual([
      expect.objectContaining({ member_email: "member2@test.com", member_name: null, delivered_at: null }),
    ]);
  });

  test("metafields can be included; Ghost leaves the key out for a member who has none", async () => {
    const result = await check.api.members.browse(BY_EMAIL).include({ metafields: true }).fetch();

    assert(result.success);
    const [url] = fetchMocker.mock.calls[0];
    expect(new URL(String(url)).searchParams.get("include")).toBe("metafields");
    expect(result.data).toHaveLength(9);
  });

  test("a subscription on a Stripe price without a nickname validates", async () => {
    const result = await check.api.members.browse(BY_EMAIL).fetch();

    assert(result.success);
    const member = result.data.find((candidate) => candidate.email === "ts-ghost-stripe@example.com");
    expect(member?.subscriptions[0].price).toMatchObject({ nickname: null, interval: "month" });
  });

  test("a comped member's stand-in subscription validates, with no period end", async () => {
    const result = await check.api.members.read({ id: fixtureId("members.created-comped") }).fetch();

    assert(result.success);
    expect(result.data.status).toBe("comped");
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({ id: "", current_period_end: null, default_payment_card_last4: "****" }),
    ]);
  });
});
