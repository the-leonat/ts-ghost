import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("members input keys Ghost drops", () => {
  const api = new TSGhostAdminAPI("https://my-ghost-blog.com", key, "v6.0");
  const fetch = vi.spyOn(globalThis, "fetch");
  beforeEach(() => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ type: "NotFoundError", message: "x" }] })),
    );
  });
  afterAll(() => fetch.mockRestore());

  const sentMember = () =>
    JSON.parse(String(fetch.mock.calls.at(-1)?.[1]?.body)).members[0] as Record<string, unknown>;

  test("add accepts geolocation but does not send it; stripe_customer_id is sent", async () => {
    await api.members.add({ email: "a@example.com", geolocation: "{}", stripe_customer_id: "cus_1" });
    expect(sentMember()).toEqual({ email: "a@example.com", stripe_customer_id: "cus_1" });
  });

  test("edit accepts geolocation and stripe_customer_id but sends neither", async () => {
    await api.members.edit("1", { name: "n", geolocation: "{}", stripe_customer_id: "cus_1" });
    expect(sentMember()).toEqual({ name: "n" });
  });

  test("an edit of only dropped keys has no data to edit", async () => {
    await expect(api.members.edit("1", { geolocation: "{}" })).rejects.toThrow("No data to edit");
  });
});
