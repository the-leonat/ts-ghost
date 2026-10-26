// ts-ghost recorder.
//
// Runs as a file inside Ghost's own e2e-api suite, in the recorder container
// (see recorder/record.sh); it is never run on the host. It talks to a real,
// seeded Ghost through Ghost's own test agent and writes one fixture per call to
// $RECORDER_OUT, the bind-mounted, Ghost-minor-keyed fixture directory of
// @ts-ghost/admin-api. Which calls it makes comes from the route spec it
// extracts first (see ./ts-ghost-walk.js), not from a list kept here.
//
// Terminology: Ghost calls its seed data "fixtures" (`fixtureManager`). In
// ts-ghost a *seed* is database rows and a *fixture* is a recorded
// request-to-response transcript. Both meanings meet only in this file.
//
// It deliberately has no seam and never uses @ts-ghost: recording through the
// client under test would bake that client's bugs in as expected behaviour.
const fs = require("node:fs");
const path = require("node:path");
const DomainEvents = require("@tryghost/domain-events");
const { agentProvider, fixtureManager, matchers, mockManager } = require("../../utils/e2e-framework");
const { stripeMocker } = require("../../utils/e2e-framework-mock-manager");
const { extractRouteSpec } = require("./ts-ghost-route-spec");
const { planWalk, variantsOf, NONEXISTENT_ID, READ_TARGETS } = require("./ts-ghost-walk");

const OUT = process.env.RECORDER_OUT || "/out";
const GHOST_MINOR = process.env.GHOST_MINOR;
const API_ROOT = "/ghost/api/admin/";

// The response header subset a fixture keeps: the version header because the
// client records it, the location header because Ghost returns it on creations.
const RECORDED_HEADERS = ["content-version", "location"];

// Volatile values are stored as markers, `{{<matcher name>}}`, using Ghost's own
// matcher patterns verbatim. A string value that fully matches one is replaced.
const MARKERS = ["anyUuid", "anyISODateTime", "anyISODateTimeWithTZ", "anyObjectId"].map((name) => {
  const sample = matchers[name] && matchers[name].sample;
  if (!(sample instanceof RegExp)) {
    throw new Error(`Ghost matcher ${name} has no pattern; the marker set needs updating`);
  }
  return { name, source: sample.source, pattern: new RegExp(`^(?:${sample.source})$`) };
});
const marker = (name) => MARKERS.find((m) => m.name === name);

// Object ids. Ghost's seed data hardcodes some ids and generates the rest
// (ObjectId() at load, migrations, the default tier and newsletter), and every
// record the walk creates gets a fresh one. An id is *stable* when it appears
// literally in Ghost's seed source (or is the walk's own non-existent id):
// those stay literal. Any other id is fresh
// and is markered: `{{anyObjectId:<alias>}}` when the walk named it (a record
// it created or picked as a path target, so the client check can follow it from
// response to request), `{{anyObjectId}}` otherwise.
const STABLE_IDS = new Set(
  [
    ...fs
      .readFileSync(path.join(__dirname, "../../utils/fixtures/data-generator.js"), "utf8")
      .matchAll(/['"]([a-f0-9]{24})['"]/g),
    [, NONEXISTENT_ID],
  ].map((match) => match[1]),
);
const aliases = new Map();
function alias(id, name) {
  if (typeof id === "string" && !STABLE_IDS.has(id)) {
    const existing = aliases.get(id);
    if (existing !== undefined && existing !== name) {
      throw new Error(`Object id ${id} is aliased as both ${existing} and ${name}`);
    }
    aliases.set(id, name);
  }
}
const embeddedId = new RegExp(`(?<![a-f0-9])(?:${marker("anyObjectId").source})(?![a-f0-9])`, "g");
const embeddedUuid = new RegExp(`(?<![a-f0-9-])(?:${marker("anyUuid").source})(?![a-f0-9-])`, "g");
function idMarker(id) {
  if (STABLE_IDS.has(id)) return id;
  const name = aliases.get(id);
  return name === undefined ? "{{anyObjectId}}" : `{{anyObjectId:${name}}}`;
}

// Settings whose value Ghost generates afresh on every boot, with the pattern
// Ghost's own settings e2e test matches them by (test/e2e-api/admin/settings.test.js).
const SETTING_MARKERS = {
  public_hash: { name: "publicHash", pattern: /^[a-z0-9]{30}$/ },
};

// Ghost's DB test setup gives every worker its own port and rewrites it to the
// canonical 2369 before comparing its own snapshots. Same here, so a
// re-recording does not differ by port.
const CANONICAL_PORT = 2369;
const sessionHost = new RegExp(`127\\.0\\.0\\.1:${process.env.server__port}\\b`, "g");

// A tier the walk created is answered from Ghost's tier domain object, whose
// timestamps keep their milliseconds, while Ghost's anyISODateTime pattern
// expects the `.000Z` a database round trip leaves (Ghost's own tiers e2e test
// falls back to anyISODate for these). Such a value is still an ISO date-time,
// so it gets the same marker; the pattern is Ghost's, with any milliseconds.
const unroundedDateTime = new RegExp(
  `^(?:${marker("anyISODateTime").source.replace("\\.000Z", "\\.\\d{3}Z")})$`,
);
if (unroundedDateTime.source === marker("anyISODateTime").pattern.source) {
  throw new Error("Ghost's anyISODateTime pattern changed; revisit unroundedDateTime");
}

// A member's unsubscribe URL is signed: its `key` is an HMAC of the member's
// uuid under a secret Ghost generates afresh on every boot
// (members_email_auth_secret). Only the key is markered; Ghost's own members
// test matches the whole URL with anyString.
const unsubscribeKey = /(\/unsubscribe\/\?uuid=[^&]+&key=)[a-f0-9]{64}(?![a-f0-9])/g;

function normaliseString(value) {
  const whole = MARKERS.find(({ pattern }) => pattern.test(value));
  if (whole) {
    return whole.name === "anyObjectId" ? idMarker(value) : `{{${whole.name}}}`;
  }
  if (unroundedDateTime.test(value)) {
    return "{{anyISODateTime}}";
  }
  return value
    .replace(unsubscribeKey, "$1{{unsubscribeKey}}")
    .replace(sessionHost, `127.0.0.1:${CANONICAL_PORT}`)
    .replace(embeddedUuid, "{{anyUuid}}")
    .replace(embeddedId, idMarker);
}

function normalise(value) {
  if (typeof value === "string") {
    return normaliseString(value);
  }
  if (Array.isArray(value)) {
    return value.map(normalise);
  }
  if (value && typeof value === "object") {
    const setting = SETTING_MARKERS[value.key];
    if (setting && typeof value.value === "string" && Object.keys(value).length === 2) {
      if (!setting.pattern.test(value.value)) {
        throw new Error(`Setting ${value.key} no longer matches ${setting.pattern}: ${value.value}`);
      }
      return { key: value.key, value: `{{${setting.name}}}` };
    }
    // Keys sorted: Ghost's serializers do not emit relations in a fixed order
    // (a post read by slug sends tags and authors either way round), and key
    // order carries no meaning, so a re-recording stays byte-identical.
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, normalise(value[k])]),
    );
  }
  return value;
}

// The name a created record is kept and aliased under: `posts.created`, or
// `offers.created-trial` for a resource created in variants.
function createdKey({ resource, variant }) {
  return `${resource}.created${variant === undefined ? "" : `-${variant}`}`;
}

function requestKey(method, url) {
  const parsed = new URL(url, `http://127.0.0.1${API_ROOT}`);
  const query = Object.fromEntries(
    [...parsed.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)),
  );
  return { method: method.toUpperCase(), path: normaliseString(parsed.pathname), query };
}

// The seeds the walk reads. `members:newsletters` brings the labels and needs
// `newsletters` first; `posts` brings tags and pages, and published, draft,
// scheduled and paid-only posts. `user:inactive` adds a user in a status other
// than active, a shape variant of the user schema. `members:newsletters` also
// brings the paid side with no Stripe involved: the free and the paid tier, the
// paid tier's Stripe prices, and Stripe customers and subscriptions for the paid
// members, all as literal rows of Ghost's seed source. `tiers:archived` adds an
// archived paid tier. `members:emails` sends two seeded posts as newsletters
// (one submitted, one failed), with no from, reply-to or source, and fills
// members' `email_recipients` include; it needs the members seeded first.
// Every resource the walk reads must come back non-empty: the client check
// fails on an empty collection (see src/client-check/evidence.ts).
const SEEDS = [
  "users",
  "user:inactive",
  "posts",
  "newsletters",
  "members:newsletters",
  "members:emails",
  "tiers:archived",
];

// The paid tier's Stripe product, a literal of Ghost's seed source
// (DataGenerator.forKnex.stripe_products).
const SEEDED_STRIPE_PRODUCT = "109c85c734fb9992e7bc30a26af66c22f5c94d8dc62e0a33cb797be902c06b2d";

// A member subscribed through Ghost's own Stripe webhook ingestion, on a price
// that has no nickname. Ghost names every price it creates itself, but a price
// made in the Stripe dashboard often has none, and Ghost copies Stripe's price
// as it is (members-api member-repository linkSubscription). That price state
// lives on Stripe's side, so this is the one seed that needs the Stripe mock:
// the price is put into the mock, and the mock's checkout webhook makes Ghost
// create the member, customer and subscription. Ids are fixed here rather than
// left to the mock's random ones, so they stay literal in the fixtures.
async function subscribeThroughStripe() {
  const price = {
    id: "price_tsghostnonickname",
    object: "price",
    active: true,
    product: SEEDED_STRIPE_PRODUCT,
    nickname: null,
    currency: "usd",
    unit_amount: 900,
    type: "recurring",
    recurring: { interval: "month" },
  };
  stripeMocker.prices.push(price);
  const customer = stripeMocker.createCustomer({
    id: "cus_tsghostrecorder",
    name: "ts-ghost stripe member",
    email: "ts-ghost-stripe@example.com",
  });
  await stripeMocker.createSubscription({ customer, price, id: "sub_tsghostrecorder" });
  await DomainEvents.allSettled();
}

describe("ts-ghost recorder", function () {
  let agent;
  let spec;

  beforeAll(async function () {
    if (!GHOST_MINOR) {
      throw new Error("GHOST_MINOR is not set; run the recorder through recorder/record.sh");
    }
    agent = await agentProvider.getAdminAPIAgent();
    await fixtureManager.init(...SEEDS);
    // Ghost's test settings say Stripe is connected (fake keys, no account), so
    // creating a tier or an offer makes Ghost's event handlers call Stripe.
    // The Stripe mock answers those calls in-process, and also cuts the
    // network, so the recording reaches no outside service. Mail is mocked so
    // the staff notifications member creation sends go nowhere either.
    mockManager.mockStripe();
    mockManager.mockMail();
    await subscribeThroughStripe();
    await agent.loginAsOwner();

    // Authenticate as a custom integration, like a real consumer: the owner
    // session creates it and its admin key is returned as "id:secret".
    const res = await agent.post("integrations/").body({ integrations: [{ name: "ts-ghost recorder" }] });
    if (res.statusCode !== 201) {
      throw new Error(
        `Creating the recorder integration failed: ${res.statusCode} ${JSON.stringify(res.body)}`,
      );
    }
    const integration = res.body.integrations[0];
    if (integration.type !== "custom") {
      throw new Error(`The recorder integration is of type ${integration.type}, not custom`);
    }
    alias(integration.id, "integration");
    const adminKey = integration.api_keys.find((key) => key.type === "admin");
    const [keyId, keySecret] = adminKey.secret.split(":");
    await agent.useToken(keyId, keySecret);
  });

  afterAll(async function () {
    await mockManager.restore();
  });

  // The route spec describes the admin surface itself; the admin package's
  // offline cross-check compares the client's claims against it, and the walk
  // below is planned from it.
  it("extracts the route spec", function () {
    spec = extractRouteSpec({ matchers });
    if (spec.ghostVersion.split(".").slice(0, 2).join(".") !== GHOST_MINOR) {
      throw new Error(
        `Ghost is ${spec.ghostVersion}, but the route spec is being written for ${GHOST_MINOR}`,
      );
    }
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "route-spec.json"), `${JSON.stringify(spec, null, 2)}\n`);
  });

  // One test, run in order: read the seeded state, create, edit, re-read,
  // delete, then the refusals. Ghost shuffles files in CI, never steps here.
  it("walks the route spec", { timeout: 120000 }, async function () {
    if (!spec) {
      throw new Error("The route spec was not extracted");
    }
    const recorded = [];
    const browsed = {};
    const created = {};
    let lastPage;
    const context = {
      // The seeded record a read targets: the lowest slug (or email) of its
      // browse among those the walk's read target admits, so the choice does
      // not depend on Ghost's default order.
      seeded(resource) {
        const admits = READ_TARGETS[resource] ?? (() => true);
        const records = (browsed[resource] ?? []).filter(admits);
        if (records.length === 0) {
          throw new Error(`No seeded ${resource} to read`);
        }
        const key = (record) => record.slug ?? record.email ?? record.id;
        const record = [...records].sort((a, b) => key(a).localeCompare(key(b)))[0];
        alias(record.id, `${resource}.seeded`);
        return record;
      },
      // A record the walk created: of the given variant, or of the resource's
      // first one (see WRITES in ./ts-ghost-walk).
      created(resource, variant = variantsOf(resource)[0]) {
        const record = created[createdKey({ resource, variant })];
        if (!record) {
          throw new Error(`The walk created no ${resource}${variant ? ` (${variant})` : ""}`);
        }
        return record;
      },
      get lastPage() {
        return lastPage;
      },
    };

    for (const step of planWalk(spec)) {
      const url = typeof step.url === "function" ? step.url(context) : step.url;
      let request = agent[step.method.toLowerCase()](url);
      const sent = typeof step.body === "function" ? step.body(context) : step.body;
      if (sent !== undefined) {
        request = request.body(sent);
      }
      const res = await request;
      // Let Ghost's event handlers (Stripe sync, member events) finish before
      // the next call, so no response depends on how far they got.
      await DomainEvents.allSettled();

      const contentVersion = res.headers["content-version"];
      if (contentVersion !== `v${GHOST_MINOR}`) {
        throw new Error(
          `${step.name}: Ghost answered as ${contentVersion}, but fixtures are being written for v${GHOST_MINOR}`,
        );
      }
      const ok = res.statusCode >= 200 && res.statusCode < 300;
      const expectsFailure = step.name.endsWith("-refused") || step.name.endsWith("-not-found");
      if (ok === expectsFailure) {
        throw new Error(`${step.name}: unexpected ${res.statusCode} ${JSON.stringify(res.body)}`);
      }
      if (step.browse) {
        browsed[step.browse] = res.body[step.browse];
      }
      if (step.creates) {
        const record = res.body[step.creates.resource][0];
        created[createdKey(step.creates)] = record;
        alias(record.id, createdKey(step.creates));
      }
      if (step.updates) {
        created[createdKey(step.updates)] = res.body[step.updates.resource][0];
      }
      if (step.paginates) {
        const { pagination } = res.body.meta;
        if (pagination.next === null || pagination.pages < 2) {
          throw new Error(`${step.name}: expected more than one page, got ${JSON.stringify(pagination)}`);
        }
        lastPage = pagination.pages;
      }

      const headers = {};
      for (const name of RECORDED_HEADERS) {
        if (res.headers[name] !== undefined) {
          headers[name] = res.headers[name];
        }
      }
      // A 204 has no body; the agent reports it as {}.
      const body = res.statusCode === 204 ? null : res.body;
      recorded.push({ step, url, sent, response: { status: res.statusCode, headers, body } });
    }

    // Normalised only once the walk is done, so an id the walk named late (a
    // read target picked from an earlier browse) carries its alias everywhere.
    // Two steps that make the same request (two variants of one add) also
    // record the body each sent, so the client check can tell them apart.
    const keyOf = ({ step, url }) => JSON.stringify(requestKey(step.method, url));
    const shared = new Set(recorded.map(keyOf).filter((key, i, keys) => keys.indexOf(key) !== i));
    for (const entry of recorded) {
      const { step, url, sent, response } = entry;
      const request = requestKey(step.method, url);
      if (shared.has(keyOf(entry))) request.body = normalise(sent);
      const fixture = { request, response: normalise(response) };
      const file = path.join(OUT, `${step.name}.json`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `${JSON.stringify(fixture, null, 2)}\n`);
    }
  });
});
