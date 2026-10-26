/**
 * The route-spec cross-check: compares what the admin client claims about
 * Ghost with the route spec the recorder extracted from a booted Ghost
 * (`fixtures/ghost-<minor>/route-spec.json`). A pure function over two
 * values: no Ghost, no database, no container, no I/O.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { FIXTURES_ROOT, ROUTE_SPEC_FILE } from "./fixture-server";
import { checkInput, type InputOperation, type JsonSchema } from "./input-check";

export type { InputOperation, JsonSchema } from "./input-check";

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
  /** Ghost's JSON Schemas for request bodies, by action (e.g. `webhooks-edit`). */
  adminApiSchemas: Record<string, unknown>;
  /** The definition documents those schemas reference (`posts#/definitions/post`), by name. */
  adminApiSchemaDefinitions: Record<string, unknown>;
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
  /** Include keys `browse` and `read` accept and send. */
  includes: string[];
  /** Include keys `browse` and `read` accept but do not send (kept so legacy calls compile). */
  ignoredIncludes?: string[];
  /** JSON Schemas of the request bodies `add` and `edit` accept, as the client sends them. */
  inputs?: Partial<Record<InputOperation, JsonSchema>>;
};

export type CrossCheckResult = {
  /** Claims the client makes that Ghost does not back. */
  failures: string[];
  /** Integration-reachable resources the client does not cover: reported, never failed. */
  uncovered: string[];
  /** What Ghost's input schemas accept and the client's bodies do not model: reported, never failed. */
  inputGaps: string[];
  /** Resources the client offers for which Ghost has no input schema to compare against. */
  inputsUncovered: string[];
  /** Include keys the client accepts but never sends, so Ghost never sees them: reported, never failed. */
  legacyClaims: string[];
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
  const legacyClaims: string[] = [];

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
      for (const include of claim.ignoredIncludes ?? []) {
        legacyClaims.push(
          `${claim.resource}.${request.controllerMethod}() accepts include "${include}" but does not send it`,
        );
      }
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

  const inputGaps: string[] = [];
  const inputsUncovered: string[] = [];
  for (const claim of claims) {
    const operations = (["add", "edit"] as const).filter((op) => claim.operations.includes(op));
    const ghostActions = operations
      .map((op) => `${claim.resource}-${op}`)
      .filter((name) => name in spec.adminApiSchemas);
    const anyGhostSchema = ["add", "edit"].some((op) => `${claim.resource}-${op}` in spec.adminApiSchemas);
    if (!anyGhostSchema) inputsUncovered.push(claim.resource);
    for (const op of operations) {
      const actionName = `${claim.resource}-${op}`;
      const library = claim.inputs?.[op];
      if (!ghostActions.includes(actionName) || library === undefined) continue;
      const result = checkInput(
        `${claim.resource}.${op}()`,
        claim.resource,
        library,
        actionName,
        spec.adminApiSchemas[actionName] as JsonSchema,
        spec.adminApiSchemaDefinitions,
      );
      failures.push(...result.failures);
      inputGaps.push(...result.gaps);
    }
  }

  const covered = new Set(claims.map((claim) => claim.resource));
  const reachable = new Set(
    spec.routes.filter((r) => r.integrationToken === "allowed").map((r) => r.path.split("/")[1] ?? ""),
  );
  const uncovered = [...reachable].filter((resource) => resource !== "" && !covered.has(resource)).sort();

  return { failures, uncovered, inputGaps, inputsUncovered: inputsUncovered.sort(), legacyClaims };
}

/** Reads the committed route spec for a Ghost minor, e.g. `ghost-6.72`. */
export function loadRouteSpec(ghostMinorDir: string): RouteSpec {
  return JSON.parse(
    readFileSync(path.join(FIXTURES_ROOT, ghostMinorDir, ROUTE_SPEC_FILE), "utf8"),
  ) as RouteSpec;
}
