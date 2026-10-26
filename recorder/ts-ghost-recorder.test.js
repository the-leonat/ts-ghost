// ts-ghost recorder.
//
// Runs as a file inside Ghost's own e2e-api suite, in the recorder container
// (see recorder/record.sh); it is never run on the host. It talks to a real,
// seeded Ghost through Ghost's own test agent and writes one fixture per call to
// $RECORDER_OUT, the bind-mounted, Ghost-minor-keyed fixture directory of
// @ts-ghost/admin-api.
//
// Terminology: Ghost calls its seed data "fixtures" (`fixtureManager`). In
// ts-ghost a *seed* is database rows and a *fixture* is a recorded
// request-to-response transcript. Both meanings meet only in this file.
//
// It deliberately has no seam and never uses @ts-ghost: recording through the
// client under test would bake that client's bugs in as expected behaviour.
const fs = require("node:fs");
const path = require("node:path");
const { agentProvider, fixtureManager, matchers } = require("../../utils/e2e-framework");
const { extractRouteSpec } = require("./ts-ghost-route-spec");

const OUT = process.env.RECORDER_OUT || "/out";
const GHOST_MINOR = process.env.GHOST_MINOR;
const API_ROOT = "/ghost/api/admin/";

// The response header subset a fixture keeps: the version header because the
// client records it, the location header because Ghost returns it on creations.
const RECORDED_HEADERS = ["content-version", "location"];

// Volatile values are stored as markers, `{{<matcher name>}}`, using Ghost's own
// matcher patterns verbatim. A string value that fully matches one is replaced.
// Only genuinely non-deterministic values belong here: object ids are not
// markered wholesale, because seeded ids are fixed and must stay literal.
const MARKERS = ["anyUuid", "anyISODateTime", "anyISODateTimeWithTZ"].map((name) => {
  const sample = matchers[name] && matchers[name].sample;
  if (!(sample instanceof RegExp)) {
    throw new Error(`Ghost matcher ${name} has no pattern; the marker set needs updating`);
  }
  return { name, pattern: new RegExp(`^(?:${sample.source})$`) };
});

// Ghost's DB test setup gives every worker its own port and rewrites it to the
// canonical 2369 before comparing its own snapshots. Same here, so a
// re-recording does not differ by port.
const CANONICAL_PORT = 2369;
const sessionHost = new RegExp(`127\\.0\\.0\\.1:${process.env.server__port}\\b`, "g");

function normalise(value) {
  if (typeof value === "string") {
    const marker = MARKERS.find(({ pattern }) => pattern.test(value));
    if (marker) {
      return `{{${marker.name}}}`;
    }
    return value.replace(sessionHost, `127.0.0.1:${CANONICAL_PORT}`);
  }
  if (Array.isArray(value)) {
    return value.map(normalise);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalise(v)]));
  }
  return value;
}

function requestKey(method, url) {
  const parsed = new URL(url, `http://127.0.0.1${API_ROOT}`);
  const query = Object.fromEntries(
    [...parsed.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)),
  );
  return { method: method.toUpperCase(), path: parsed.pathname, query };
}

// One entry per fixture: `name` is its path below $RECORDER_OUT.
const CALLS = [{ name: "site/get", method: "get", url: "site/" }];

describe("ts-ghost recorder", function () {
  let agent;

  beforeAll(async function () {
    if (!GHOST_MINOR) {
      throw new Error("GHOST_MINOR is not set; run the recorder through recorder/record.sh");
    }
    agent = await agentProvider.getAdminAPIAgent();
    await fixtureManager.init("users");
    await agent.loginAsOwner();

    // Authenticate as a custom integration, like a real consumer: the owner
    // session creates it and its admin key is returned as "id:secret".
    const res = await agent.post("integrations/").body({ integrations: [{ name: "ts-ghost recorder" }] });
    if (res.statusCode !== 201) {
      throw new Error(
        `Creating the recorder integration failed: ${res.statusCode} ${JSON.stringify(res.body)}`,
      );
    }
    const adminKey = res.body.integrations[0].api_keys.find((key) => key.type === "admin");
    const [keyId, keySecret] = adminKey.secret.split(":");
    await agent.useToken(keyId, keySecret);
  });

  // The route spec describes the admin surface itself; the admin package's
  // offline cross-check compares the client's claims against it.
  it("extracts the route spec", function () {
    const spec = extractRouteSpec({ matchers });
    if (spec.ghostVersion.split(".").slice(0, 2).join(".") !== GHOST_MINOR) {
      throw new Error(
        `Ghost is ${spec.ghostVersion}, but the route spec is being written for ${GHOST_MINOR}`,
      );
    }
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "route-spec.json"), `${JSON.stringify(spec, null, 2)}\n`);
  });

  for (const call of CALLS) {
    it(`records ${call.method.toUpperCase()} ${call.url}`, async function () {
      const res = await agent[call.method](call.url);

      const contentVersion = res.headers["content-version"];
      if (contentVersion !== `v${GHOST_MINOR}`) {
        throw new Error(
          `Ghost answered as ${contentVersion}, but fixtures are being written for v${GHOST_MINOR}`,
        );
      }

      const headers = {};
      for (const name of RECORDED_HEADERS) {
        if (res.headers[name] !== undefined) {
          headers[name] = res.headers[name];
        }
      }
      const fixture = {
        request: requestKey(call.method, call.url),
        response: normalise({ status: res.statusCode, headers, body: res.body }),
      };

      const file = path.join(OUT, `${call.name}.json`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, `${JSON.stringify(fixture, null, 2)}\n`);
    });
  }
});
