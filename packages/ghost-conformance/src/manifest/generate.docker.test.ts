// Docker: generates the leg's manifest on a throwaway Ghost and checks its version, routes and access.

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { startGhost, type GhostInstance } from "../ghost/docker-compose.ts";
import { ghostLeg } from "../ghost/versions.ts";
import { generateManifest } from "./generate.ts";
import { manifestFor } from "./manifest-files.ts";
import type { Manifest, ManifestRoute } from "./manifest.ts";

// Its own command (`pnpm test:manifest`): it starts a throwaway Ghost of the GHOST_LEG's version.
const version = ghostLeg().ghost;

describe("manifest generation", () => {
  let ghost: GhostInstance;
  let manifest: Manifest;
  beforeAll(async () => {
    ghost = await startGhost({ name: "ts-ghost-manifest-test", version });
    manifest = await generateManifest(ghost);
  }, 600_000);
  afterAll(async () => {
    await ghost?.stop();
  });

  const route = (method: string, path: string): ManifestRoute => {
    const found = manifest.routes.find((r) => r.method === method && r.path === path);
    if (!found) throw new Error(`${method} ${path} is not in the manifest`);
    return found;
  };

  test("records the pinned Ghost version and a sorted, unique route list", () => {
    expect(manifest.ghost).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.routes.length).toBeGreaterThan(150);
    const keys = manifest.routes.map((r) => `${r.path} ${r.method}`);
    expect(keys).toEqual([...new Set(keys)].sort());
  });

  test("the site route is public", () => {
    expect(route("GET", "/site/")).toMatchObject({ public: true, integration: true, staff: true });
  });

  // Ghost 5 and 6 share one integration allowlist (5 refuses with 501, 6 with 403).
  test("editing settings refuses integration tokens and accepts staff tokens", () => {
    expect(route("PUT", "/settings/")).toMatchObject({ public: false, integration: false, staff: true });
  });

  test("reading snippets is off the integration allowlist", () => {
    expect(route("GET", "/snippets/")).toMatchObject({ integration: false, staff: true, session: true });
  });

  test("wiping the database refuses staff and integration tokens", () => {
    expect(route("DELETE", "/db/")).toMatchObject({
      integration: false,
      staff: false,
      session: true,
    });
  });

  test("routes that take their token from the URL refuse every header credential", () => {
    expect(route("PUT", "/schedules/:resource/:id/")).toMatchObject({
      public: false,
      integration: false,
      staff: false,
      session: false,
    });
  });

  test("sign-in is public although it refuses a body-less request", () => {
    expect(route("POST", "/session/")).toMatchObject({ public: true });
  });

  test("the staff-token routes accept staff and session, and only reading passes integrations", () => {
    // GET lets integrations past auth (Ghost's controller then fails); PUT isn't on the integration allowlist.
    expect(route("GET", "/users/:id/token/")).toMatchObject({
      integration: true,
      staff: true,
      session: true,
    });
    expect(route("PUT", "/users/:id/token/")).toMatchObject({
      integration: false,
      staff: true,
      session: true,
    });
  });

  test("records labs flags on routes and on sub-routers", (context) => {
    expect(route("GET", "/posts/").labs).toBeNull();
    // Which labs-gated routes this Ghost has comes from its committed manifest; Ghost 6.0 and 5 have none.
    const committed = manifestFor(version);
    if (!committed.has("POST /members/metafields/:namespace/"))
      context.skip(`Ghost ${version} has no labs-gated metafields route`);
    expect(route("GET", "/members/metafields/:namespace/").labs).toBeNull();
    expect(route("POST", "/members/metafields/:namespace/").labs).toBe("membersCustomFields");
    if (committed.has("GET /stripe/checkout/config/"))
      expect(route("GET", "/stripe/checkout/config/").labs).toBe("stripeCheckoutDesign");
  });

  test("refuses an instance that has already been set up", async () => {
    // Generating bootstrapped this throwaway, so it is no longer fresh.
    const setUp: GhostInstance = {
      ...ghost,
      compose: async () => {
        throw new Error("must not touch a set-up instance");
      },
    };
    await expect(generateManifest(setUp)).rejects.toThrow(/already set up/);
  });
});
