import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { json, stubFetch } from "../stub-fetch";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("members inputs are sent as given", () => {
  const api = new TSGhostAdminAPI("https://my-ghost-blog.com", key, "v6.0");
  const notFound = json({ errors: [{ type: "NotFoundError", message: "x" }] });

  const sentMember = (fetch: ReturnType<typeof stubFetch>) =>
    JSON.parse(String(fetch.mock.calls.at(-1)?.[1]?.body)).members[0] as Record<string, unknown>;

  test("add sends geolocation and stripe_customer_id", async () => {
    const fetch = stubFetch([notFound]);
    const member = { email: "a@example.com", geolocation: "{}", stripe_customer_id: "cus_1" };
    await api.members.add(member);
    expect(sentMember(fetch)).toEqual(member);
  });

  test("edit sends the deprecated geolocation and stripe_customer_id", async () => {
    const fetch = stubFetch([notFound]);
    const member = { name: "n", geolocation: "{}", stripe_customer_id: "cus_1" };
    await api.members.edit("1", member);
    expect(sentMember(fetch)).toEqual(member);
  });

  test("a label needs its name: Ghost matches by name, and drops or 500s on one without", async () => {
    stubFetch([]);
    for (const label of [{ id: "1" }, { slug: "vip" }]) {
      const labels = [label] as unknown as { name: string }[];
      await expect(api.members.edit("1", { labels })).rejects.toThrow();
      await expect(api.members.add({ email: "a@example.com", labels })).rejects.toThrow();
    }
  });

  test("labels read from a member can be sent back and keep their names", async () => {
    const fetch = stubFetch([notFound]);
    const labels = [{ id: "1", name: "VIP", slug: "vip", created_at: "x", updated_at: null }];
    await api.members.edit("1", { labels });
    expect(sentMember(fetch).labels).toEqual([{ name: "VIP" }]);
  });

  test("an edit without keys has no data to edit", async () => {
    stubFetch([]);
    await expect(api.members.edit("1", {})).rejects.toThrow("No data to edit");
  });
});
