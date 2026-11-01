// Seeding helpers: unwrap a client result, a unique suffix, and Admin API calls with the Owner's session.

import { randomBytes } from "node:crypto";

import type { LiveGhost } from "../ghost/admin-client.ts";
import { adminApiUrl } from "../ghost/admin-url.ts";

/** Unwraps a client result while seeding; a failed seed aborts the test file. */
export function must<T>(
  result: { success: true; data: T } | { success: false; errors: unknown },
  what: string,
): T {
  if (!result.success) throw new Error(`Seeding ${what} failed: ${JSON.stringify(result.errors)}`);
  return result.data;
}

/** Short random tag that keeps seeded slugs, names and emails unique per test file and run. */
export const uniqueSuffix = () => randomBytes(4).toString("hex");

/** Calls the Admin API with the Owner's session, for writes the client has no method for. */
export async function sessionRequest<T>(
  ghost: Pick<LiveGhost, "url" | "sessionCookie">,
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${adminApiUrl(ghost.url)}${path}`, {
    method,
    headers: { cookie: ghost.sessionCookie, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${path} ${response.status} ${await response.text()}`);
  const text = await response.text();
  // DELETE answers 204 with no body.
  return (text ? JSON.parse(text) : undefined) as T;
}
