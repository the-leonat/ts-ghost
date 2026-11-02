// The webhook target nothing listens on, and the bootstrap integration's webhooks for read-backs.

import type { LiveGhost } from "../ghost/admin-client.ts";
import { sessionRequest } from "./helpers.ts";

// Nothing listens here, so deliveries fail locally instead of leaving the machine.
export const WEBHOOK_TARGET = "http://127.0.0.1:9/ts-ghost-webhook";

type Integration = { id: string; name: string; webhooks?: Record<string, unknown>[] };

/**
 * The bootstrap's integration with its webhooks. The client has no webhook reads and Ghost only lists
 * them on the integration, which takes a session, so read-backs go through this.
 */
export async function conformanceIntegration(
  ghost: LiveGhost,
): Promise<Integration & { webhooks: Record<string, unknown>[] }> {
  const { integrations } = await sessionRequest<{ integrations: Integration[] }>(
    ghost,
    "GET",
    "/integrations/?include=webhooks&limit=all",
  );
  const integration = integrations.find((i) => i.name === "ts-ghost conformance");
  if (!integration) throw new Error("The bootstrap's integration is missing");
  return { ...integration, webhooks: integration.webhooks ?? [] };
}
