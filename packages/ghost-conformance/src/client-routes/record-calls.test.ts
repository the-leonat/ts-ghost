// Checks that every public method is recorded once per identity form, with its method and erased path.

import { describe, expect, test, vi } from "vitest";

import { recordClientCalls } from "./record-calls.ts";

// A pin the client's version type doesn't cover yet: recording must still work, so the drift PR can say so.
vi.mock("../ghost/versions.ts", async (original) => ({
  ...(await original<typeof import("../ghost/versions.ts")>()),
  ghostVersion: () => "7.0.0",
}));

describe("recording the client's calls", () => {
  test("works whatever Ghost is pinned", async () => {
    expect(await recordClientCalls("latest")).not.toEqual([]);
  });

  test("every public method is called once per identity form, recording method and erased path", async () => {
    const calls = await recordClientCalls();
    expect(calls).toEqual(
      expect.arrayContaining([
        { name: "posts.browse", method: "GET", path: "/posts/" },
        { name: "posts.read({id})", method: "GET", path: "/posts/:/" },
        { name: "posts.read({slug})", method: "GET", path: "/posts/slug/:/" },
        { name: "posts.add", method: "POST", path: "/posts/" },
        { name: "posts.edit", method: "PUT", path: "/posts/:/" },
        { name: "posts.delete", method: "DELETE", path: "/posts/:/" },
        { name: "users.read({email})", method: "GET", path: "/users/email/:/" },
        { name: "offers.add", method: "POST", path: "/offers/" },
        { name: "webhooks.edit", method: "PUT", path: "/webhooks/:/" },
        { name: "site.fetch", method: "GET", path: "/site/" },
      ]),
    );
  });

  test.for(["compat", "latest"] as const)(
    "the %s client reads users by slug, so the manifest check covers it",
    async (target) => {
      expect(await recordClientCalls(target)).toContainEqual({
        name: "users.read({slug})",
        method: "GET",
        path: "/users/slug/:/",
      });
    },
  );
});
