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

/**
 * Resources the walk records. Ghost's named seeds provide their records with no
 * Stripe involved: the `members` seed brings paid members, tier prices and
 * subscriptions. Offers are not seeded; the walk creates them.
 */
const SCOPE = [
  "site",
  "settings",
  "posts",
  "pages",
  "tags",
  "labels",
  "newsletters",
  "users",
  "webhooks",
  "members",
  "tiers",
  "offers",
];

const CRUD = ["browse", "read", "add", "edit", "destroy"];

/** An object id no seed or walk creates: the not-found read and refused writes use it. */
const NONEXISTENT_ID = "000000000000000000000000";

/**
 * What the walk creates, and how it edits it. Keyed by resource. `add` gets the
 * walk context (see the recorder), so a body can name a seeded record. A
 * resource with `variants` is created once per variant, recorded as
 * `<resource>/add-<variant>` and re-read as `<resource>/read-created-<variant>`;
 * its first variant is the one edited (and destroyed).
 */
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
  // A free member, and a complimentary one: given a tier, a member is comped
  // with no Stripe subscription, and Ghost sends a stand-in subscription of its
  // own making (no ids, no period end). The seed has no such member: its
  // comped@test.com is paid, on a Stripe subscription. (`comped: true` would
  // not do: with Stripe connected Ghost creates a Stripe subscription for it.)
  members: {
    variants: {
      free: () => ({ email: "ts-ghost-recorder@example.com", name: "ts-ghost recorder member" }),
      comped: ({ seeded }) => ({
        email: "ts-ghost-comped@example.com",
        name: "ts-ghost comped member",
        tiers: [{ id: seeded("tiers").id }],
      }),
    },
    edit: () => ({ name: "ts-ghost recorder member, edited" }),
  },
  // A paid tier with prices. Ghost then creates its Stripe product and prices
  // in an event handler, which the recorder's Stripe mock answers.
  tiers: {
    add: () => ({
      name: "ts-ghost recorder tier",
      description: "A paid tier the recorder created",
      visibility: "public",
      currency: "usd",
      monthly_price: 700,
      yearly_price: 7000,
      benefits: ["ts-ghost recorder benefit"],
    }),
    edit: () => ({ name: "ts-ghost recorder tier, edited" }),
  },
  // Both redemption types Ghost has, through its offers endpoint: a retention offer, which has no tier, and a trial offer (a signup
  // offer) on the seeded paid tier. Bodies follow Ghost's own
  // test/e2e-api/admin/offers.test.js.
  offers: {
    variants: {
      retention: () => ({
        name: "ts-ghost retention offer",
        code: "ts-ghost-retention",
        display_title: "Stay with us",
        display_description: "10% off if you stay",
        type: "percent",
        cadence: "month",
        amount: 10,
        duration: "forever",
        duration_in_months: null,
        currency_restriction: false,
        currency: null,
        status: "active",
        redemption_type: "retention",
        tier: null,
      }),
      trial: ({ seeded }) => ({
        name: "ts-ghost trial offer",
        code: "ts-ghost-trial",
        type: "trial",
        cadence: "year",
        amount: 14,
        duration: "trial",
        currency: "USD",
        tier: { id: seeded("tiers").id },
      }),
    },
    // Ghost caps an offer name at 40 characters.
    edit: () => ({ name: "ts-ghost retention offer, edited" }),
  },
};

/**
 * Resources Ghost seeds no records of. Their browse is recorded after the walk
 * has created some, and their read targets the records the walk created.
 */
const UNSEEDED = ["offers"];

/**
 * Which seeded record a read targets, where the first by slug (or email) would
 * not show the shape that matters: a paid member with an active subscription,
 * and an active paid tier. The recorder picks the first match.
 */
const READ_TARGETS = {
  members: (member) =>
    member.status === "paid" &&
    member.subscriptions.some((subscription) => subscription.status === "active"),
  tiers: (tier) => tier.type === "paid" && tier.active,
};

/** Extra browse calls, beyond the plain one, keyed by resource. */
const BROWSE_VARIANTS = {
  posts: [
    { name: "include-authors-tags", params: { include: "authors,tags" } },
    { name: "formats-html-plaintext", params: { formats: "html,plaintext" } },
  ],
  tags: [{ name: "include-count-posts", params: { include: "count.posts" } }],
  labels: [{ name: "include-count-members", params: { include: "count.members" } }],
  // Every relation Ghost's members.browse declares includable apart from
  // `products`, its legacy name for tiers; one at a time.
  members: [
    { name: "include-tiers", params: { include: "tiers" } },
    { name: "include-email-recipients", params: { include: "email_recipients" } },
    { name: "include-metafields", params: { include: "metafields" } },
  ],
  // The includes the client offers for tiers. Ghost's tiers.browse has no
  // include option, so this records what it sends regardless.
  tiers: [
    {
      name: "include-monthly-price-yearly-price-benefits",
      params: { include: "monthly_price,yearly_price,benefits" },
    },
  ],
};

/** Extra reads by id of the seeded record, beyond the plain one, keyed by resource. */
const READ_VARIANTS = {
  members: [{ name: "include-tiers", params: { include: "tiers" } }],
};

/** The order a browse is sorted by: a unique key, so rows Ghost's default order ties cannot swap. */
const ORDER = {
  posts: "slug asc",
  pages: "slug asc",
  tags: "slug asc",
  labels: "slug asc",
  newsletters: "slug asc",
  users: "slug asc",
  tiers: "slug asc",
  members: "email asc",
};

/** The small-limit browse whose first page reports a next page and whose last reports none. */
const PAGINATED = { resource: "tags", limit: 2 };

/** The resource whose read of NONEXISTENT_ID is recorded. */
const NOT_FOUND = "posts";

function segmentOf(route) {
  return route.path.split("/")[1] ?? "";
}

/** The variants a resource is created in, or `[undefined]` for a single plain one. */
function variantsOf(resource) {
  const variants = WRITES[resource]?.variants;
  return variants === undefined ? [undefined] : Object.keys(variants);
}

const suffix = (variant) => (variant === undefined ? "" : `-${variant}`);

function withQuery(base, params) {
  const query = new URLSearchParams(params).toString();
  return `${base}${query ? `?${query}` : ""}`;
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
    const unseeded = UNSEEDED.includes(resource);

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
      // any order), so a browse is ordered by a unique key where one exists.
      const order = ORDER[resource] ? { order: ORDER[resource] } : {};
      const url = (params = {}) => withQuery(`${resource}/`, { ...order, ...params });
      const phase = unseeded ? 4 : 0;
      steps.push({ phase, name: `${resource}/${op}`, method: "GET", url: url(), browse: resource });
      for (const variant of BROWSE_VARIANTS[resource] ?? []) {
        steps.push({
          phase,
          name: `${resource}/${op}-${variant.name}`,
          method: "GET",
          url: url(variant.params),
        });
      }
      if (PAGINATED.resource === resource) {
        const limit = String(PAGINATED.limit);
        steps.push({
          phase,
          name: `${resource}/${op}-limit-${limit}-first-page`,
          method: "GET",
          url: url({ limit, page: "1" }),
          paginates: true,
        });
        steps.push({
          phase,
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
        if (!unseeded) {
          const target = ({ seeded }) => `${resource}/${prefix}${seeded(resource)[identity]}/`;
          steps.push({ phase: 1, name: `${resource}/read-${identity}`, method: "GET", url: target });
          if (identity === "id") {
            for (const variant of READ_VARIANTS[resource] ?? []) {
              steps.push({
                phase: 1,
                name: `${resource}/read-${identity}-${variant.name}`,
                method: "GET",
                url: (context) => withQuery(target(context), variant.params),
              });
            }
          }
        }
        if (identity === "id" && WRITES[resource]) {
          for (const variant of variantsOf(resource)) {
            steps.push({
              phase: 4,
              name: `${resource}/read-created${suffix(variant)}`,
              method: "GET",
              url: ({ created }) => `${resource}/${created(resource, variant).id}/`,
            });
          }
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
      for (const variant of variantsOf(resource)) {
        const body = variant === undefined ? writes.add : writes.variants[variant];
        steps.push({
          phase: 2,
          name: `${resource}/add${suffix(variant)}`,
          method: "POST",
          url: `${resource}/`,
          body: (context) => ({ [resource]: [body(context)] }),
          creates: { resource, variant },
        });
      }
      continue;
    }
    if (writes && route.method === "PUT" && op === "edit" && rest === "/:id") {
      steps.push({
        phase: 3,
        name: `${resource}/edit`,
        method: "PUT",
        url: ({ created }) => `${resource}/${created(resource).id}/`,
        body: ({ created }) => ({ [resource]: [writes.edit(created(resource))] }),
        updates: { resource, variant: variantsOf(resource)[0] },
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

module.exports = { planWalk, variantsOf, NONEXISTENT_ID, READ_TARGETS, SCOPE };
