import { describe, expect, test } from "vitest";

import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./webhooks";

// Ghost 6.72 stores any lowercase event of up to 50 characters and any URI reference as the target.
const stored = {
  id: "6ae1fb7504a5250001f19621",
  event: "some.custom_event",
  target_url: "/relative/hook",
  name: null,
  secret: null,
  api_version: "v6",
  integration_id: "6ae1fb7504a5250001f19620",
  last_triggered_at: null,
  last_triggered_status: null,
  last_triggered_error: null,
  created_at: "2026-10-28T13:41:09.000Z",
  updated_at: "2026-10-28T13:41:09.000Z",
};

describe("webhook schemas accept what Ghost accepts", () => {
  test("a stored webhook with an event outside the known list and a relative target parses", () => {
    expect(adminWebhookSchema.safeParse(stored).success).toBe(true);
  });

  test("add takes any lowercase event of up to 50 characters and a relative target", () => {
    expect(
      adminWebhookCreateSchema.safeParse({ event: "some.custom_event", target_url: "/hook" }).success,
    ).toBe(true);
  });

  test("edit takes any lowercase event of up to 50 characters and a relative target", () => {
    expect(
      adminWebhookUpdateSchema.safeParse({ event: "some.custom_event", target_url: "/hook" }).success,
    ).toBe(true);
  });

  // What Ghost rejects.
  test.for([
    { reason: "an event with capitals", input: { event: "Post.Added", target_url: "/hook" } },
    { reason: "an event over 50 characters", input: { event: "a".repeat(51), target_url: "/hook" } },
    {
      reason: "a target over 2000 characters",
      input: { event: "post.added", target_url: "x".repeat(2001) },
    },
  ])("add rejects $reason", ({ input }) => {
    expect(adminWebhookCreateSchema.safeParse(input).success).toBe(false);
  });
});
