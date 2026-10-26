import { assert, describe, expect, expectTypeOf, test } from "vitest";

import { adminMembersSchema, type Member } from "./members";

/**
 * A free member as Ghost 6.72 sends it, with an email suppression. No recorded
 * fixture has a suppressed member (Ghost only records one from Mailgun bounce
 * and complaint events), so the suppression is written from Ghost's source:
 * `EmailSuppressionData` in `email-suppression-list.js`.
 */
const member = (email_suppression: unknown) => ({
  id: "6203e0e2cd1d4a5d8aca5f2a",
  uuid: "f6f91b0e-8a5c-4d5b-9d0c-7f5e2c3c8a11",
  email: "bounced@example.com",
  name: "Bounced Member",
  note: null,
  geolocation: null,
  subscribed: false,
  created_at: "2026-10-26T12:00:00.000Z",
  updated_at: "2026-10-26T12:00:00.000Z",
  labels: [],
  subscriptions: [],
  avatar_image: null,
  comped: false,
  email_count: 3,
  email_opened_count: 0,
  email_open_rate: 0,
  status: "free",
  last_seen_at: null,
  newsletters: [],
  email_suppression,
});

describe("a member's email suppression", () => {
  test("a suppressed member carries the reason and the time of the suppression", () => {
    const result = adminMembersSchema.safeParse(
      member({ suppressed: true, info: { reason: "spam", timestamp: "2026-10-20T08:30:00.000Z" } }),
    );

    assert(result.success, result.error?.message);
    expect(result.data.email_suppression).toEqual({
      suppressed: true,
      info: { reason: "spam", timestamp: "2026-10-20T08:30:00.000Z" },
    });
  });

  test("a hard bounce is reason fail", () => {
    const result = adminMembersSchema.safeParse(
      member({ suppressed: true, info: { reason: "fail", timestamp: "2026-10-20T08:30:00.000Z" } }),
    );

    assert(result.success, result.error?.message);
    expect(result.data.email_suppression?.info?.reason).toBe("fail");
  });

  // Ghost reports `suppressed` for a member whose email it disabled, with no
  // suppression list entry behind it.
  test("a member suppressed without a suppression list entry has no info", () => {
    const result = adminMembersSchema.safeParse(member({ suppressed: true, info: null }));

    assert(result.success, result.error?.message);
    expect(result.data.email_suppression).toEqual({ suppressed: true, info: null });
  });

  test("the info is typed as Ghost builds it", () => {
    expectTypeOf<NonNullable<NonNullable<Member["email_suppression"]>["info"]>>().toEqualTypeOf<{
      reason: "spam" | "fail";
      timestamp: string;
    }>();
  });
});
