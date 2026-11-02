// Live: a webhook's add, failed delivery and edit parse, read back and set each nullable field.

import { randomBytes } from "node:crypto";
import { describe, expect, inject } from "vitest";
import { adminSchemas, adminWebhookCreateSchema } from "@ts-ghost/admin-api";

import { uniqueSuffix } from "../seeds/helpers.ts";
import { conformanceIntegration, WEBHOOK_TARGET } from "../seeds/webhooks.ts";
import { assertOk, liveTest } from "./live-test.ts";
import { nullabilityGaps, readBack, unsentInputs } from "./schema-keys.ts";

const schema = adminSchemas[inject("ghost").leg.target].webhooks;

/** The webhook as Ghost lists it on its integration: the client has no webhook reads. */
async function readBackWebhook(id: string) {
  return (await conformanceIntegration(inject("ghost"))).webhooks.find((w) => w.id === id);
}

// Webhooks have no reads, so their responses are the only shapes there are: one test on every leg.
describe("webhooks", () => {
  liveTest(
    "add, a failed delivery and edit parse, read back and set each nullable field",
    async ({ api }) => {
      // Only this test schedules a post, and nothing listens at the target, so the one delivery fails.
      const add = {
        event: "post.scheduled",
        target_url: `${WEBHOOK_TARGET}/${uniqueSuffix()}`,
        integration_id: (await conformanceIntegration(inject("ghost"))).id,
      } as const;
      const added = await api.webhooks.add(add);
      assertOk(added);
      const { id } = added.data;
      expect(await readBackWebhook(id)).toMatchObject(readBack(add));

      const post = await api.posts.add({
        title: `Webhook trigger ${uniqueSuffix()}`,
        status: "scheduled",
        published_at: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      });
      assertOk(post);
      await expect
        .poll(async () => (await readBackWebhook(id))?.last_triggered_at, { timeout: 10_000 })
        .toBeTruthy();

      const edit = {
        event: "page.rescheduled",
        target_url: `${WEBHOOK_TARGET}/${uniqueSuffix()}`,
        name: `Webhook ${uniqueSuffix()}`,
        secret: `secret-${randomBytes(8).toString("hex")}`,
        api_version: "v6",
      } as const;
      const edited = await api.webhooks.edit(id, edit);
      assertOk(edited);
      expect(await readBackWebhook(id)).toMatchObject(readBack(edit));

      const exceptions = {
        updated_at: "Ghost sets it on every write",
        last_triggered_status: "a delivery to a closed port fails before any HTTP status",
      };
      expect(nullabilityGaps(schema, [added.data, edited.data], exceptions)).toEqual([]);
      expect(unsentInputs(adminWebhookCreateSchema, add, edit)).toEqual([]);
      expect(await api.webhooks.delete(id)).toEqual({ success: true });
      expect(await api.posts.delete(post.data.id)).toEqual({ success: true });
    },
  );
});
