import { z } from "zod";
import { BasicFetcher, inputSchemasOf } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "../admin-api";
import type { IdentityForm, JsonSchema, Operation, ResourceClaim } from "./cross-check";

const COMPOSER_OPERATIONS = ["browse", "read", "add", "edit", "delete"] as const;
const IDENTITY_FORMS: IdentityForm[] = ["id", "slug", "email"];

/**
 * An include mask that says yes to every key: the include schema keeps the
 * keys it knows and drops the rest, so passing this through `.include()` and
 * reading `getIncludes()` back yields every include key the client offers.
 */
const EVERY_INCLUDE = new Proxy({}, { get: (_, key) => (typeof key === "string" ? true : undefined) });

type Composed = Partial<Record<(typeof COMPOSER_OPERATIONS)[number], (...args: any[]) => any>>;

function acceptsIdentity(resource: Composed, form: IdentityForm) {
  try {
    resource.read?.({ [form]: "x" });
    return true;
  } catch {
    return false;
  }
}

/**
 * The include keys the client accepts, split into those it sends and those it
 * accepts but drops from the request (read back from the request it would make).
 */
function includeKeys(resource: Composed): Pick<ResourceClaim, "includes" | "ignoredIncludes"> {
  // `browse` and `read` share the resource's include schema; only a browse
  // fetcher exposes the query it would send.
  const fetcher = resource.browse?.() ?? resource.read?.({ id: "x" });
  if (!fetcher) return { includes: [], ignoredIncludes: [] };
  const included = fetcher.include(EVERY_INCLUDE);
  const accepted = included.getIncludes() as string[];
  const query = included.getURLSearchParams?.() as URLSearchParams | undefined;
  const sent = query ? (query.get("include")?.split(",") ?? []) : accepted;
  return {
    includes: accepted.filter((key) => sent.includes(key)),
    ignoredIncludes: accepted.filter((key) => !sent.includes(key)),
  };
}

/**
 * The request bodies `add`/`edit` accept, as JSON Schema of what a caller may
 * pass. Values the schema transforms before sending (dates) come out
 * unconstrained, so their types are not compared.
 */
function inputsOf(resource: object): ResourceClaim["inputs"] {
  const schemas = inputSchemasOf(resource) ?? {};
  return Object.fromEntries(
    Object.entries(schemas).map(([op, schema]) => [
      op,
      z.toJSONSchema(schema as z.ZodType, { io: "input", unrepresentable: "any" }) as JsonSchema,
    ]),
  );
}

/**
 * What the admin client claims about Ghost, read through its public API only:
 * the operations each resource exposes, the identity forms `read` accepts, the
 * include keys `browse`/`read` accept and the request bodies `add`/`edit`
 * accept. Nothing is requested.
 */
export function describeClient(api: TSGhostAdminAPI): ResourceClaim[] {
  const resources = Object.entries(Object.getOwnPropertyDescriptors(TSGhostAdminAPI.prototype))
    .filter(([, descriptor]) => descriptor.get !== undefined)
    .map(([name]) => name);

  return resources.map((name): ResourceClaim => {
    const resource: unknown = api[name as keyof TSGhostAdminAPI];
    if (resource instanceof BasicFetcher) {
      return { resource: resource.getResource(), operations: ["fetch"], identities: [], includes: [] };
    }
    const composed = resource as Composed;
    const operations: Operation[] = COMPOSER_OPERATIONS.filter((op) => typeof composed[op] === "function");
    return {
      resource: name,
      operations,
      identities: operations.includes("read")
        ? IDENTITY_FORMS.filter((form) => acceptsIdentity(composed, form))
        : [],
      ...(operations.includes("browse") || operations.includes("read")
        ? includeKeys(composed)
        : { includes: [], ignoredIncludes: [] }),
      inputs: inputsOf(composed),
    };
  });
}
