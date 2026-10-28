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

  test("add and edit take any lowercase event of up to 50 characters and a relative target", () => {
    const input = { event: "some.custom_event", target_url: "/hook" };
    expect(adminWebhookCreateSchema.safeParse(input).success).toBe(true);
    expect(adminWebhookUpdateSchema.safeParse(input).success).toBe(true);
  });

  test("add rejects what Ghost rejects: an event with capitals or over 50 characters, a target over 2000", () => {
    const add = (input: { event: string; target_url: string }) =>
      adminWebhookCreateSchema.safeParse(input).success;
    expect(add({ event: "Post.Added", target_url: "/hook" })).toBe(false);
    expect(add({ event: "a".repeat(51), target_url: "/hook" })).toBe(false);
    expect(add({ event: "post.added", target_url: "x".repeat(2001) })).toBe(false);
  });
});
