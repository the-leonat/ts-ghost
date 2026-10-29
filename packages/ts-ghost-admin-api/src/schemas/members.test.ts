import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { json, stubFetch } from "../stub-fetch";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("members input keys Ghost drops", () => {
  const api = new TSGhostAdminAPI("https://my-ghost-blog.com", key, "v6.0");
  const notFound = json({ errors: [{ type: "NotFoundError", message: "x" }] });

  const sentMember = (fetch: ReturnType<typeof stubFetch>) =>
    JSON.parse(String(fetch.mock.calls.at(-1)?.[1]?.body)).members[0] as Record<string, unknown>;

  test("add sends stripe_customer_id but not geolocation", async () => {
    const fetch = stubFetch([notFound]);
    await api.members.add({ email: "a@example.com", geolocation: "{}", stripe_customer_id: "cus_1" });
    expect(sentMember(fetch)).toEqual({ email: "a@example.com", stripe_customer_id: "cus_1" });
  });

  test("edit sends neither geolocation nor stripe_customer_id", async () => {
    const fetch = stubFetch([notFound]);
    await api.members.edit("1", { name: "n", geolocation: "{}", stripe_customer_id: "cus_1" });
    expect(sentMember(fetch)).toEqual({ name: "n" });
  });

  test("an edit of only dropped keys has no data to edit", async () => {
    stubFetch([]);
    await expect(api.members.edit("1", { geolocation: "{}" })).rejects.toThrow("No data to edit");
  });
});
