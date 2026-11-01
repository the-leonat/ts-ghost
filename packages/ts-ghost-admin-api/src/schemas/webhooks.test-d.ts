import { describe, expectTypeOf, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import type { GhostWebhookEvent, GhostWebhookEventTypes } from "./webhooks";

const api = new TSGhostAdminAPI("https://ghost.org", "1:2", "v6.0");

describe("webhook events: any string Ghost accepts, with the known events kept for autocomplete", () => {
  test("the event type is the known events plus any other string", () => {
    expectTypeOf<GhostWebhookEvent>().toEqualTypeOf<GhostWebhookEventTypes | (string & {})>();
    expectTypeOf<"post.added">().toExtend<GhostWebhookEventTypes>();
    expectTypeOf<"not.an.event">().not.toExtend<GhostWebhookEventTypes>();
  });

  test("add and edit accept a known event, any other event string and a relative target", () => {
    expectTypeOf(api.webhooks.add).parameter(0).toHaveProperty("event").toEqualTypeOf<GhostWebhookEvent>();
    void api.webhooks.add({ event: "post.added", target_url: "https://example.com/hook" });
    void api.webhooks.add({ event: "custom.event", target_url: "/relative/hook" });
    void api.webhooks.edit("id", { event: "site.changed" });
  });

  test("a returned webhook's event and target_url are typed as sent", async () => {
    const added = await api.webhooks.add({ event: "post.added", target_url: "/hook" });
    if (added.success) {
      expectTypeOf(added.data.event).toEqualTypeOf<GhostWebhookEvent>();
      expectTypeOf(added.data.target_url).toEqualTypeOf<string>();
    }
  });
});
