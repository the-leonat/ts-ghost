import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { FetchMock } from "vitest-fetch-mock";

/**
 * A fixture: one request-to-response transcript recorded from a real Ghost by
 * the recorder (see `recorder/` at the repository root).
 */
export type Fixture = {
  /**
   * `body` is recorded only when another fixture records the same method, path
   * and query (two variants of one `add`), to tell the two apart.
   */
  request: { method: string; path: string; query: Record<string, string>; body?: unknown };
  response: { status: number; headers: Record<string, string>; body: unknown };
};

/** Fixture directories are keyed by Ghost minor version, e.g. `ghost-6.72`. */
export const FIXTURES_ROOT = path.resolve(__dirname, "../../fixtures");

/**
 * The Ghost release the fixtures were recorded from, read from `fixtures/ghost-ref`
 * (a release tag such as `v6.72.0`). The recorder records it, the drift job bumps
 * it, and client checks load `fixtureDir` so ordinary runs assert against it only.
 */
export const PINNED_GHOST = (() => {
  const ref = readFileSync(path.join(FIXTURES_ROOT, "ghost-ref"), "utf8").trim();
  const match = /^v(\d+\.\d+)\.\d+$/.exec(ref);
  if (match === null) throw new Error(`fixtures/ghost-ref must be a Ghost release tag, got: ${ref}`);
  const minor = match[1];
  return { ref, minor, fixtureDir: `ghost-${minor}` };
})();

/**
 * Concrete stand-ins for the markers the recorder writes in place of volatile
 * values. Each satisfies the Ghost matcher pattern its marker is named after.
 */
const MARKER_SAMPLES: Record<string, string> = {
  anyUuid: "00000000-0000-4000-8000-000000000000",
  anyISODateTime: "2000-01-01T00:00:00.000Z",
  anyISODateTimeWithTZ: "2000-01-01T00:00:00.000+00:00",
  anyObjectId: "aaaaaaaaaaaaaaaaaaaaaaaa",
  publicHash: "000000000000000000000000000000",
  unsubscribeKey: "0000000000000000000000000000000000000000000000000000000000000000",
};

/**
 * The id a named id marker, `{{anyObjectId:<name>}}`, stands for: one fresh
 * object id the recorder followed from a response into later requests (e.g.
 * `posts.created`, `labels.seeded`). Fixed per name, distinct between names.
 */
export function fixtureId(name: string) {
  return createHash("sha256").update(name).digest("hex").slice(0, 24);
}

/**
 * A marker, whole or embedded in a longer string: `{{anyUuid}}`,
 * `{{anyObjectId:posts.created}}`. Only marker names are matched, because
 * recorded content has braces of its own (a post's `{{post_class}}`).
 */
const MARKER = /\{\{(any[A-Z]\w*|publicHash|unsubscribeKey)(?::([\w.-]+))?\}\}/g;

function resolveString(value: string) {
  return value.replace(MARKER, (marker, name: string, idName: string | undefined) => {
    if (name === "anyObjectId" && idName !== undefined) return fixtureId(idName);
    const sample = MARKER_SAMPLES[name];
    if (sample === undefined || idName !== undefined) {
      throw new Error(`Fixture uses unknown marker ${marker}`);
    }
    return sample;
  });
}

function resolveMarkers(value: unknown): unknown {
  if (typeof value === "string") return resolveString(value);
  if (Array.isArray(value)) return value.map(resolveMarkers);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveMarkers(v)]));
  }
  return value;
}

/** The route spec sits beside the fixtures but is not one (see `cross-check.ts`). */
export const ROUTE_SPEC_FILE = "route-spec.json";

function listFixtureFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFixtureFiles(full);
    return entry.name.endsWith(".json") && entry.name !== ROUTE_SPEC_FILE ? [full] : [];
  });
}

export function loadFixtures(ghostMinorDir: string): Fixture[] {
  return listFixtureFiles(path.join(FIXTURES_ROOT, ghostMinorDir)).map(
    (file) => JSON.parse(readFileSync(file, "utf8")) as Fixture,
  );
}

/** Method, path and query with parameters sorted: what a request is matched on. */
function requestKey(method: string, pathname: string, query: Iterable<[string, string]>) {
  const sorted = [...query].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const search = new URLSearchParams(sorted).toString();
  return `${method.toUpperCase()} ${pathname}${search ? `?${search}` : ""}`;
}

function fixtureKey({ request }: Fixture) {
  const query = Object.entries(request.query).map(([k, v]): [string, string] => [k, resolveString(v)]);
  return requestKey(request.method, resolveString(request.path), query);
}

function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/** Whether every value `recorded` holds is in `sent` too, at the same place. */
function containedIn(recorded: unknown, sent: unknown): boolean {
  if (Array.isArray(recorded)) {
    return (
      Array.isArray(sent) &&
      recorded.length === sent.length &&
      recorded.every((item, i) => containedIn(item, sent[i]))
    );
  }
  if (recorded !== null && typeof recorded === "object") {
    if (sent === null || typeof sent !== "object" || Array.isArray(sent)) return false;
    return Object.entries(recorded).every(([k, v]) => containedIn(v, (sent as Record<string, unknown>)[k]));
  }
  return recorded === sent;
}

export class UnmatchedRequestError extends Error {
  constructor(
    readonly received: string,
    readonly nearest: string | undefined,
  ) {
    super(
      `No fixture matches ${received}` +
        (nearest === undefined ? " (no fixtures loaded)" : `; nearest recorded: ${nearest}`),
    );
    this.name = "UnmatchedRequestError";
  }
}

export type FixtureServer = {
  /** Every request that matched no fixture, in order. */
  readonly unmatched: UnmatchedRequestError[];
  /** Throws the first unmatched request, so a test cannot pass past one. */
  assertAllRequestsMatched(): void;
};

/**
 * Answers fetch from fixtures, matching on method, path and normalised query.
 * Fixtures that share a request are told apart by the body each recorded;
 * two that share one and did not record a body are refused, since only one
 * could ever answer.
 * Fails closed: a request matching no fixture rejects and is recorded, naming
 * the request and the nearest recorded key.
 */
export function serveFixtures(fetchMocker: FetchMock, fixtures: Fixture[] | string): FixtureServer {
  const loaded = typeof fixtures === "string" ? loadFixtures(fixtures) : fixtures;
  const byKey = new Map<string, Fixture[]>();
  for (const fixture of loaded) {
    const key = fixtureKey(fixture);
    byKey.set(key, [...(byKey.get(key) ?? []), fixture]);
  }
  for (const [key, group] of byKey) {
    if (group.length > 1 && group.some((fixture) => fixture.request.body === undefined)) {
      throw new Error(`Two fixtures record the same request: ${key}`);
    }
  }
  const unmatched: UnmatchedRequestError[] = [];
  const fail = (error: UnmatchedRequestError) => {
    unmatched.push(error);
    throw error;
  };

  fetchMocker.mockResponse(async (request) => {
    const url = new URL(request.url);
    const key = requestKey(request.method, url.pathname, url.searchParams);
    const group = byKey.get(key);
    if (group === undefined) {
      const nearest = [...byKey.keys()].sort((a, b) => editDistance(key, a) - editDistance(key, b))[0];
      return fail(new UnmatchedRequestError(key, nearest));
    }
    let fixture = group[0];
    if (group.length > 1) {
      const text = await request.text();
      const sent: unknown = text === "" ? undefined : JSON.parse(text);
      const matching = group.filter((f) => containedIn(resolveMarkers(f.request.body), sent));
      if (matching.length !== 1) return fail(new UnmatchedRequestError(`${key} with this body`, key));
      fixture = matching[0];
    }
    const { status, headers, body } = fixture.response;
    const resolvedHeaders = resolveMarkers(headers) as Record<string, string>;
    // A 204 is recorded with a null body, and a Response for it must have none.
    if (body === null) return new Response(null, { status, headers: resolvedHeaders });
    return new Response(JSON.stringify(resolveMarkers(body)), {
      status,
      headers: { "content-type": "application/json", ...resolvedHeaders },
    });
  });

  return {
    unmatched,
    assertAllRequestsMatched() {
      if (unmatched.length > 0) throw unmatched[0];
    },
  };
}
