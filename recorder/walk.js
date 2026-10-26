// ts-ghost recorder walk: which calls to record, derived from the route spec.
//
// The recorder does not keep a route list of its own. It takes the route spec
// it has just extracted from the booted Ghost (the same route-spec.json it
// writes beside the fixtures) and selects every CRUD route of the resources in
// SCOPE: browse, read, add, edit and destroy routes bound to the resource's own
// controller. A route the integration-token allowlist admits is walked for real;
// one it excludes is recorded as a refusal. A selected route this file has no
// recipe for fails the recording, so a route Ghost adds to an in-scope resource
// surfaces as a failed run, never as a silently missing fixture.
//
// Recipes say only what Ghost cannot: which record a path parameter names and
// what body a write carries. Every write targets a record the walk created
// itself, and refused writes target an identifier that does not exist.
//
// Copied next to the recorder into Ghost's test/e2e-api/admin/ (see
// recorder/Dockerfile); it is never run on the host.

/** Resources whose records Ghost's named seeds provide with no Stripe involved. */
const SCOPE = ["site", "settings", "posts", "pages", "tags", "labels", "newsletters", "users", "webhooks"];

const CRUD = ["browse", "read", "add", "edit", "destroy"];

/** An object id no seed or walk creates: the not-found read and refused writes use it. */
const NONEXISTENT_ID = "000000000000000000000000";

/** What the walk creates, and how it edits it. Keyed by resource. */
const WRITES = {
  posts: {
    add: () => ({ title: "ts-ghost recorder post" }),
    edit: (created) => ({ title: "ts-ghost recorder post, edited", updated_at: created.updated_at }),
  },
  pages: {
    add: () => ({ title: "ts-ghost recorder page" }),
    edit: (created) => ({ title: "ts-ghost recorder page, edited", updated_at: created.updated_at }),
  },
  tags: {
    add: () => ({ name: "ts-ghost recorder tag" }),
    edit: () => ({ name: "ts-ghost recorder tag, edited" }),
  },
  labels: {
    add: () => ({ name: "ts-ghost recorder label" }),
    edit: () => ({ name: "ts-ghost recorder label, edited" }),
  },
  newsletters: {
    add: () => ({ name: "ts-ghost recorder newsletter" }),
    edit: () => ({ name: "ts-ghost recorder newsletter, edited" }),
  },
  webhooks: {
    add: () => ({
      event: "post.added",
      target_url: "https://example.com/ts-ghost/webhook",
      name: "ts-ghost recorder webhook",
      secret: "ts-ghost-initial-secret",
    }),
    // A secret rotation: the edit carries only the secret.
    edit: () => ({ secret: "ts-ghost-rotated-secret" }),
  },
};

/** Extra browse calls, beyond the plain one, keyed by resource. */
const BROWSE_VARIANTS = {
  posts: [
    { name: "include-authors-tags", params: { include: "authors,tags" } },
    { name: "formats-html-plaintext", params: { formats: "html,plaintext" } },
  ],
  tags: [{ name: "include-count-posts", params: { include: "count.posts" } }],
  labels: [{ name: "include-count-members", params: { include: "count.members" } }],
};

/** Resources whose records have a unique slug to order a browse by. */
const SLUGGED = ["posts", "pages", "tags", "labels", "newsletters", "users"];

/** The small-limit browse whose first page reports a next page and whose last reports none. */
const PAGINATED = { resource: "tags", limit: 2 };

/** The resource whose read of NONEXISTENT_ID is recorded. */
const NOT_FOUND = "posts";

function segmentOf(route) {
  return route.path.split("/")[1] ?? "";
}

/**
 * Selects the in-scope CRUD routes of the route spec and turns each into a step.
 * Throws on a selected route it has no recipe for.
 */
function planWalk(spec) {
  const selected = spec.routes.filter(
    (route) =>
      SCOPE.includes(segmentOf(route)) &&
      route.controller !== null &&
      route.controller.endpoint === segmentOf(route) &&
      CRUD.includes(route.controller.method),
  );

  const steps = [];
  const unrecordable = [];
  for (const route of selected) {
    const resource = segmentOf(route);
    const op = route.controller.method;
    const rest = route.path.slice(resource.length + 1).replace(/\/$/, "");
    const refused = route.integrationToken !== "allowed";

    if (refused) {
      const url = route.path
        .slice(1)
        .replace(/:[a-z_]+/g, NONEXISTENT_ID)
        .replace(/\/?$/, "/");
      steps.push({
        phase: 6,
        name: `${resource}/${op}-refused`,
        method: route.method,
        url,
        body: route.method === "GET" || route.method === "DELETE" ? undefined : { [resource]: [{}] },
      });
      continue;
    }

    if (route.method === "GET" && rest === "" && (op === "browse" || op === "read")) {
      // Ghost's default order ties on seed data (MySQL then returns tied rows in
      // any order), so a browse of a slugged resource is ordered by its slug.
      const order = SLUGGED.includes(resource) ? { order: "slug asc" } : {};
      const url = (params = {}) => {
        const query = new URLSearchParams({ ...order, ...params }).toString();
        return `${resource}/${query ? `?${query}` : ""}`;
      };
      steps.push({ phase: 0, name: `${resource}/${op}`, method: "GET", url: url(), browse: resource });
      for (const variant of BROWSE_VARIANTS[resource] ?? []) {
        steps.push({
          phase: 0,
          name: `${resource}/${op}-${variant.name}`,
          method: "GET",
          url: url(variant.params),
        });
      }
      if (PAGINATED.resource === resource) {
        const limit = String(PAGINATED.limit);
        steps.push({
          phase: 0,
          name: `${resource}/${op}-limit-${limit}-first-page`,
          method: "GET",
          url: url({ limit, page: "1" }),
          paginates: true,
        });
        steps.push({
          phase: 0,
          name: `${resource}/${op}-limit-${limit}-last-page`,
          method: "GET",
          url: ({ lastPage }) => url({ limit, page: String(lastPage) }),
        });
      }
      continue;
    }

    if (route.method === "GET" && op === "read") {
      const identity = { "/:id": "id", "/slug/:slug": "slug", "/email/:email": "email" }[rest];
      if (identity !== undefined) {
        const prefix = identity === "id" ? "" : `${identity}/`;
        steps.push({
          phase: 1,
          name: `${resource}/read-${identity}`,
          method: "GET",
          url: ({ seeded }) => `${resource}/${prefix}${seeded(resource)[identity]}/`,
        });
        if (identity === "id" && WRITES[resource]) {
          steps.push({
            phase: 4,
            name: `${resource}/read-created`,
            method: "GET",
            url: ({ created }) => `${resource}/${created(resource).id}/`,
          });
        }
        if (identity === "id" && resource === NOT_FOUND) {
          steps.push({
            phase: 1,
            name: `${resource}/read-not-found`,
            method: "GET",
            url: `${resource}/${NONEXISTENT_ID}/`,
          });
        }
        continue;
      }
    }

    const writes = WRITES[resource];
    if (writes && route.method === "POST" && op === "add" && rest === "") {
      steps.push({
        phase: 2,
        name: `${resource}/add`,
        method: "POST",
        url: `${resource}/`,
        body: () => ({ [resource]: [writes.add()] }),
        creates: resource,
      });
      continue;
    }
    if (writes && route.method === "PUT" && op === "edit" && rest === "/:id") {
      steps.push({
        phase: 3,
        name: `${resource}/edit`,
        method: "PUT",
        url: ({ created }) => `${resource}/${created(resource).id}/`,
        body: ({ created }) => ({ [resource]: [writes.edit(created(resource))] }),
        updates: resource,
      });
      continue;
    }
    if (writes && route.method === "DELETE" && op === "destroy" && rest === "/:id") {
      steps.push({
        phase: 5,
        name: `${resource}/destroy`,
        method: "DELETE",
        url: ({ created }) => `${resource}/${created(resource).id}/`,
      });
      continue;
    }

    unrecordable.push(`${route.method} ${route.path} (${route.controller.endpoint}.${op})`);
  }

  if (unrecordable.length > 0) {
    throw new Error(
      `The route spec has in-scope routes the walk has no recipe for; add one to recorder/walk.js:\n  ${unrecordable.join("\n  ")}`,
    );
  }
  const covered = new Set(steps.map((step) => step.name.split("/")[0]));
  const missing = SCOPE.filter((resource) => !covered.has(resource));
  if (missing.length > 0) {
    throw new Error(`The route spec has no recordable route for: ${missing.join(", ")}`);
  }

  // Stable order: by phase, then by name, so the walk and its fixtures do not
  // depend on the order Ghost registers its routes in.
  return steps.sort((a, b) => a.phase - b.phase || a.name.localeCompare(b.name));
}

module.exports = { planWalk, NONEXISTENT_ID, SCOPE };
