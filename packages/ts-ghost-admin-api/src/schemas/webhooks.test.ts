import { describe, expect, test } from "vitest";

import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./webhooks";

const stored = {
  id: "6720e0f0c0a8b2a1d4f3e9c1",
  event: "member.updated",
  target_url: "/relative/hook",
  created_at: "2026-10-26T00:00:00.000Z",
};

describe("webhook schemas accept what Ghost's webhooks input schema accepts", () => {
  test("a stored webhook with an event outside the known list and a relative target parses", () => {
    expect(adminWebhookSchema.safeParse(stored).success).toBe(true);
  });

  test("create and update take any lowercase event of up to 50 characters and a relative target", () => {
    expect(
      adminWebhookCreateSchema.safeParse({ event: "member.updated", target_url: "/hook" }).success,
    ).toBe(true);
    expect(
      adminWebhookUpdateSchema.safeParse({ event: "member.updated", target_url: "/hook" }).success,
    ).toBe(true);
  });

  test("create rejects what Ghost rejects: an event with capitals or over 50 characters, a target over 2000", () => {
    expect(adminWebhookCreateSchema.safeParse({ event: "Post.Added", target_url: "/hook" }).success).toBe(
      false,
    );
    expect(adminWebhookCreateSchema.safeParse({ event: "a".repeat(51), target_url: "/hook" }).success).toBe(
      false,
    );
    expect(
      adminWebhookCreateSchema.safeParse({ event: "post.added", target_url: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
