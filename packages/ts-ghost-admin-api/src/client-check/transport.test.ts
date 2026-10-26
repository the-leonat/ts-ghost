import { assert, describe, expect, test } from "vitest";
import { z } from "zod";
import { APIComposer, HTTPClientFactory } from "@ts-ghost/core-api";

import { adminUsersSchema } from "../schemas/users";
import { fixtureId, PINNED_GHOST } from "./fixture-server";
import { ADMIN_KEY, fetchMocker, useClientCheck } from "./harness";

describe("client check: transport against recorded Ghost", () => {
  const check = useClientCheck();

  test("a read of a non-existent id is unsuccessful, carrying the 404 and Ghost's body", async () => {
    const result = await check.api.posts.read({ id: "000000000000000000000000" }).fetch();

    assert(result.success === false);
    expect(result.status).toBe(404);
    expect(result.errors).toEqual([
      { type: "NotFoundError", message: "Resource not found error, cannot read post." },
    ]);
    expect(JSON.parse(result.body ?? "")).toMatchObject({
      errors: [{ type: "NotFoundError", context: "Post not found." }],
    });
  });

  test("a route the integration-token allowlist excludes is unsuccessful, carrying the 403", async () => {
    // The admin client offers no user writes; the same composer and transport
    // it is built from reach the refused routes Ghost was recorded refusing.
    const users = new APIComposer(
      "users",
      {
        schema: adminUsersSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        updateSchema: z.object({ name: z.string() }),
      },
      new HTTPClientFactory({
        url: "https://ghost.org",
        key: ADMIN_KEY,
        version: `v${PINNED_GHOST.minor}` as `v6.${string}`,
        endpoint: "admin",
      }),
    ).access(["edit", "delete"]);

    const edited = await users.edit("000000000000000000000000", { name: "x" });
    const deleted = await users.delete("000000000000000000000000");

    for (const result of [edited, deleted]) {
      assert(result.success === false);
      expect(result.status).toBe(403);
      expect(result.errors[0]).toMatchObject({
        type: "NoPermissionError",
        message: "API tokens do not have permission to access this endpoint",
      });
    }
  });

  test("a small-limit browse reports a next page, and its last page reports none", async () => {
    const first = await check.api.tags.browse({ order: "slug asc", limit: 2, page: 1 }).fetch();
    assert(first.success);
    expect(first.data).toHaveLength(2);
    expect(first.meta.pagination).toMatchObject({ page: 1, limit: 2, prev: null, next: 2 });

    const lastPage = first.meta.pagination.pages;
    const last = await check.api.tags.browse({ order: "slug asc", limit: 2, page: lastPage }).fetch();
    assert(last.success);
    expect(last.meta.pagination).toMatchObject({ page: lastPage, next: null, prev: lastPage - 1 });
    expect(last.meta.pagination.total).toBe(first.meta.pagination.total);
  });

  test("paginate offers a next page from the first, and none from the last", async () => {
    const first = await check.api.tags.browse({ order: "slug asc", limit: 2, page: 1 }).paginate();
    assert(first.current.success);
    expect(first.next).toBeDefined();

    const { pages } = first.current.meta.pagination;
    const last = await check.api.tags.browse({ order: "slug asc", limit: 2, page: pages }).paginate();
    assert(last.current.success);
    expect(last.next).toBeUndefined();
  });

  test("the server's reported version is unknown before a response and recorded after one", async () => {
    expect(check.api.getServerVersion()).toBeUndefined();

    await check.api.site.fetch();

    expect(check.api.getServerVersion()).toBe(`v${PINNED_GHOST.minor}`);
  });
});

describe("client check: client-level default request options", () => {
  const check = useClientCheck({
    defaultRequestOptions: { redirect: "manual", headers: { "X-Trace": "t" } },
  });

  test("apply to every request, mutations included, without losing authentication", async () => {
    await check.api.tags.browse({ order: "slug asc" }).fetch();
    await check.api.webhooks.delete(fixtureId("webhooks.created"));

    expect(fetchMocker.mock.calls).toHaveLength(2);
    for (const [, init] of fetchMocker.mock.calls) {
      const headers = new Headers(init?.headers);
      expect(init?.redirect).toBe("manual");
      expect(headers.get("x-trace")).toBe("t");
      expect(headers.get("authorization")).toMatch(/^Ghost ey/);
    }
  });

  test("caller-supplied headers are merged with them and with authentication", async () => {
    await check.api.tags.browse({ order: "slug asc" }).fetch({ headers: { "X-Request": "r" } });

    const headers = new Headers(fetchMocker.mock.calls[0][1]?.headers);
    expect(headers.get("x-request")).toBe("r");
    expect(headers.get("x-trace")).toBe("t");
    expect(headers.get("authorization")).toMatch(/^Ghost ey/);
  });
});
