import { describe, expectTypeOf, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import type { GhostWebhookEvent, GhostWebhookEventTypes, Webhook } from "./webhooks";

const api = new TSGhostAdminAPI("https://ghost.org", "id:secret", "v6.72");

describe("webhook events: any string Ghost accepts, with the known events kept for autocomplete", () => {
  test("the event type is the known events plus any other string", () => {
    expectTypeOf<GhostWebhookEvent>().toEqualTypeOf<GhostWebhookEventTypes | (string & {})>();
    expectTypeOf<"post.added">().toExtend<GhostWebhookEventTypes>();
  });

  test("add and edit accept a known event and any other event string", () => {
    expectTypeOf(api.webhooks.add).parameter(0).toHaveProperty("event").toEqualTypeOf<GhostWebhookEvent>();
    api.webhooks.add({ event: "post.added", target_url: "https://example.com/hook" });
    api.webhooks.add({ event: "member.updated", target_url: "/relative/hook" });
    api.webhooks.edit("id", { event: "site.changed" });
  });

  test("a returned webhook's event and target_url are plain strings", () => {
    expectTypeOf<Webhook["event"]>().toEqualTypeOf<GhostWebhookEvent>();
    expectTypeOf<Webhook["target_url"]>().toEqualTypeOf<string>();
  });
});
