import { assert, describe, expect, test } from "vitest";

import { adminWebhookUpdateSchema } from "../schemas/webhooks";
import { loadRouteSpec } from "./cross-check";
import { fixtureId, PINNED_GHOST } from "./fixture-server";
import { sentBody, useClientCheck } from "./harness";

describe("client check: webhooks", () => {
  const check = useClientCheck();

  test("add creates the webhook the walk created", async () => {
    const result = await check.api.webhooks.add({
      event: "post.added",
      target_url: "https://example.com/ts-ghost/webhook",
      name: "ts-ghost recorder webhook",
      secret: "ts-ghost-initial-secret",
    });

    assert(result.success);
    expect(result.data).toMatchObject({
      id: fixtureId("webhooks.created"),
      event: "post.added",
      secret: "ts-ghost-initial-secret",
      integration_id: fixtureId("integration"),
    });
  });

  test("an update carries the secret, so a rotation rotates", async () => {
    const result = await check.api.webhooks.edit(fixtureId("webhooks.created"), {
      secret: "ts-ghost-rotated-secret",
    });

    expect(sentBody(0)).toEqual({ webhooks: [{ secret: "ts-ghost-rotated-secret" }] });
    assert(result.success);
    expect(result.data.secret).toBe("ts-ghost-rotated-secret");
  });

  test("the update accepts exactly the fields Ghost's webhooks.edit input schema allows", () => {
    const editSchema = loadRouteSpec(PINNED_GHOST.fixtureDir).adminApiSchemas["webhooks-edit"] as {
      properties: { webhooks: { items: { properties: Record<string, unknown> } } };
    };

    expect(Object.keys(adminWebhookUpdateSchema.shape).sort()).toEqual(
      Object.keys(editSchema.properties.webhooks.items.properties).sort(),
    );
  });

  test("delete removes it", async () => {
    expect(await check.api.webhooks.delete(fixtureId("webhooks.created"))).toEqual({ success: true });
  });
});
