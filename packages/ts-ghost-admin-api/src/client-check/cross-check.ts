/**
 * The route-spec cross-check: compares what the admin client claims about
 * Ghost with the route spec the recorder extracted from a booted Ghost
 * (`fixtures/ghost-<minor>/route-spec.json`). A pure function over two
 * values: no Ghost, no database, no container, no I/O.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { FIXTURES_ROOT, ROUTE_SPEC_FILE } from "./fixture-server";

/** The part of the recorded route spec the cross-check reads. */
export type RouteSpec = {
  ghostVersion: string;
  routes: Array<{
    method: string;
    path: string;
    integrationToken: string | null;
    controller: { endpoint: string; method: string } | null;
  }>;
  controllers: Record<string, { methods: Record<string, { allowedIncludes: string[] | null }> }>;
};

/** `fetch` is a plain GET of the resource root (site, settings). */
export type Operation = "browse" | "read" | "add" | "edit" | "delete" | "fetch";
export type IdentityForm = "id" | "slug" | "email";

/** What the client offers for one resource. */
export type ResourceClaim = {
  resource: string;
  operations: Operation[];
  /** Identity forms `read` accepts. */
  identities: IdentityForm[];
  /** Include keys `browse` and `read` accept. */
  includes: string[];
};

export type CrossCheckResult = {
  /** Claims the client makes that Ghost does not back. */
  failures: string[];
  /** Integration-reachable resources the client does not cover: reported, never failed. */
  uncovered: string[];
};

type Request = { call: string; method: string; path: string; controllerMethod?: string; includes: boolean };

const IDENTITY_PATHS: Record<IdentityForm, string> = {
  id: ":id",
  slug: "slug/:slug",
  email: "email/:email",
};

/** The requests each claimed operation makes, following the composer's path conventions. */
function requestsOf({ resource, operations, identities }: ResourceClaim): Request[] {
  const root = `/${resource}/`;
  return operations.flatMap((operation): Request[] => {
    switch (operation) {
      case "browse":
        return [
          {
            call: `${resource}.browse()`,
            method: "GET",
            path: root,
            controllerMethod: "browse",
            includes: true,
          },
        ];
      case "read":
        return identities.map((form) => ({
          call: `${resource}.read({ ${form} })`,
          method: "GET",
          path: `${root}${IDENTITY_PATHS[form]}/`,
          controllerMethod: "read",
          includes: form === identities[0],
        }));
      case "add":
        return [
          {
            call: `${resource}.add()`,
            method: "POST",
            path: root,
            controllerMethod: "add",
            includes: false,
          },
        ];
      case "edit":
        return [
          {
            call: `${resource}.edit()`,
            method: "PUT",
            path: `${root}:id/`,
            controllerMethod: "edit",
            includes: false,
          },
        ];
      case "delete":
        return [
          {
            call: `${resource}.delete()`,
            method: "DELETE",
            path: `${root}:id/`,
            controllerMethod: "destroy",
            includes: false,
          },
        ];
      case "fetch":
        return [{ call: `${resource}.fetch()`, method: "GET", path: root, includes: false }];
    }
  });
}

/** Route paths compared with parameter names erased and a trailing slash. */
function shape(path: string) {
  return `${path.replace(/:[A-Za-z_]+/g, ":").replace(/\/+$/, "")}/`;
}

export function crossCheck(claims: ResourceClaim[], spec: RouteSpec): CrossCheckResult {
  const failures: string[] = [];

  for (const claim of claims) {
    for (const request of requestsOf(claim)) {
      const route = spec.routes.find(
        (r) => r.method === request.method && shape(r.path) === shape(request.path),
      );
      if (route === undefined) {
        failures.push(
          `${request.call} requests ${request.method} ${request.path}, which Ghost does not register`,
        );
        continue;
      }
      const controller = route.controller;
      if (request.controllerMethod === undefined || controller === null) continue;
      if (controller.method !== request.controllerMethod) {
        failures.push(
          `${request.call} requests ${request.method} ${request.path}, which Ghost binds to ` +
            `${controller.endpoint}.${controller.method}, not ${claim.resource}.${request.controllerMethod}`,
        );
        continue;
      }
      if (!request.includes) continue;
      const allowed =
        spec.controllers[controller.endpoint]?.methods[controller.method]?.allowedIncludes ?? [];
      const ghostMethod = `${controller.endpoint}.${controller.method}`;
      for (const include of claim.includes) {
        if (allowed.includes(include)) continue;
        failures.push(
          `${claim.resource}.${request.controllerMethod}() offers include "${include}", but Ghost's ${ghostMethod} ` +
            (allowed.length === 0 ? "allows no includes" : `allows only: ${allowed.join(", ")}`),
        );
      }
    }
  }

  const covered = new Set(claims.map((claim) => claim.resource));
  const reachable = new Set(
    spec.routes.filter((r) => r.integrationToken === "allowed").map((r) => r.path.split("/")[1] ?? ""),
  );
  const uncovered = [...reachable].filter((resource) => resource !== "" && !covered.has(resource)).sort();

  return { failures, uncovered };
}

/** Reads the committed route spec for a Ghost minor, e.g. `ghost-6.72`. */
export function loadRouteSpec(ghostMinorDir: string): RouteSpec {
  return JSON.parse(
    readFileSync(path.join(FIXTURES_ROOT, ghostMinorDir, ROUTE_SPEC_FILE), "utf8"),
  ) as RouteSpec;
}
