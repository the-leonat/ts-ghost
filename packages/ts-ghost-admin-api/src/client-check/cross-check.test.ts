import { describe, expect, test } from "vitest";

import { crossCheck, type ResourceClaim, type RouteSpec } from "./cross-check";

const route = (method: string, path: string, endpoint: string, controllerMethod: string) => ({
  method,
  path,
  integrationToken: "allowed",
  controller: { endpoint, method: controllerMethod },
});

const spec: RouteSpec = {
  ghostVersion: "6.72.0",
  adminApiSchemas: {},
  routes: [
    route("GET", "/posts", "posts", "browse"),
    route("GET", "/posts/:id", "posts", "read"),
    route("GET", "/posts/slug/:slug", "posts", "read"),
    route("DELETE", "/posts/:id", "posts", "destroy"),
    route("GET", "/tiers", "tiers", "browse"),
    route("GET", "/tiers/:id", "tiers", "read"),
    route("GET", "/labels", "labels", "browse"),
    route("GET", "/settings/", "settings", "browse"),
    {
      method: "GET",
      path: "/db",
      integrationToken: "refused:403",
      controller: { endpoint: "db", method: "exportContent" },
    },
  ],
  controllers: {
    posts: {
      methods: {
        browse: { allowedIncludes: ["tags", "authors"] },
        read: { allowedIncludes: ["tags", "authors"] },
        destroy: { allowedIncludes: null },
      },
    },
    tiers: { methods: { browse: { allowedIncludes: null }, read: { allowedIncludes: null } } },
    labels: { methods: { browse: { allowedIncludes: ["count.members"] } } },
    settings: { methods: { browse: { allowedIncludes: null } } },
  },
};

const posts: ResourceClaim = {
  resource: "posts",
  operations: ["browse", "read", "delete"],
  identities: ["id", "slug"],
  includes: ["tags", "authors"],
};

describe("route-spec cross-check", () => {
  test("a client whose every claim Ghost registers passes", () => {
    expect(crossCheck([posts], spec).failures).toEqual([]);
  });

  test("fails a read by slug when Ghost registers only a by-id route", () => {
    const tiers: ResourceClaim = {
      resource: "tiers",
      operations: ["browse", "read"],
      identities: ["id", "slug"],
      includes: [],
    };

    expect(crossCheck([tiers], spec).failures).toEqual([
      "tiers.read({ slug }) requests GET /tiers/slug/:slug/, which Ghost does not register",
    ]);
  });

  test("fails an include key the endpoint does not declare", () => {
    const tiers: ResourceClaim = {
      resource: "tiers",
      operations: ["browse", "read"],
      identities: ["id"],
      includes: ["benefits"],
    };

    expect(crossCheck([tiers], spec).failures).toEqual([
      'tiers.browse() offers include "benefits", but Ghost\'s tiers.browse allows no includes',
      'tiers.read() offers include "benefits", but Ghost\'s tiers.read allows no includes',
    ]);
  });

  test("names the includes Ghost does allow when rejecting one", () => {
    const withCount: ResourceClaim = { ...posts, operations: ["browse"], includes: ["tags", "count.posts"] };

    expect(crossCheck([withCount], spec).failures).toEqual([
      'posts.browse() offers include "count.posts", but Ghost\'s posts.browse allows only: tags, authors',
    ]);
  });

  test("fails an exposed operation Ghost has no route for", () => {
    const tiers: ResourceClaim = {
      resource: "tiers",
      operations: ["add", "delete"],
      identities: [],
      includes: [],
    };

    expect(crossCheck([tiers], spec).failures).toEqual([
      "tiers.add() requests POST /tiers/, which Ghost does not register",
      "tiers.delete() requests DELETE /tiers/:id/, which Ghost does not register",
    ]);
  });

  test("fails a route bound to a different controller method than the operation implies", () => {
    const misbound: RouteSpec = { ...spec, routes: [route("GET", "/posts", "posts", "exportCSV")] };

    expect(crossCheck([{ ...posts, operations: ["browse"], includes: [] }], misbound).failures).toEqual([
      "posts.browse() requests GET /posts/, which Ghost binds to posts.exportCSV, not posts.browse",
    ]);
  });

  test("checks a plain fetch resource against its GET route, trailing slash or not", () => {
    const settings: ResourceClaim = {
      resource: "settings",
      operations: ["fetch"],
      identities: [],
      includes: [],
    };
    const site: ResourceClaim = { resource: "site", operations: ["fetch"], identities: [], includes: [] };

    expect(crossCheck([settings, site], spec).failures).toEqual([
      "site.fetch() requests GET /site/, which Ghost does not register",
    ]);
  });

  test("reports, without failing, integration-reachable resources the client does not cover", () => {
    const result = crossCheck([posts], spec);

    expect(result.failures).toEqual([]);
    expect(result.uncovered).toEqual(["labels", "settings", "tiers"]);
  });
});
