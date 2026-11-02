// Checks the route-access classification, Ghost 5's 501 refusal of integrations included.

import { describe, expect, test } from "vitest";

import { classifyRoute } from "./route-access.ts";

const GHOST_6 = "6.72.0";
const admin = { method: "PUT", path: "/settings", labs: null, guard: "admin" } as const;
const responses = (none: number, integration: number, staff: number, session: number) => ({
  none: { status: none },
  integration: { status: integration },
  staff: { status: staff },
  session: { status: session },
});

describe("classifyRoute", () => {
  test.for([
    [403, 422, 404],
    [401, 500, 400],
  ])("%i means refused; any other status, even an error (%i, %i), means accepted", ([refused, a, b]) => {
    expect(classifyRoute(admin, responses(refused!, refused!, a!, b!), GHOST_6)).toEqual({
      public: false,
      integration: false,
      staff: true,
      session: true,
    });
  });

  test("Ghost 5 refuses an integration outside its allowlist with 501", () => {
    expect(classifyRoute(admin, responses(401, 501, 200, 200), "5.130.6")).toMatchObject({
      integration: false,
    });
  });

  test("on Ghost 6, a 501 to an integration is the route's answer, not a refusal", () => {
    expect(classifyRoute(admin, responses(401, 501, 200, 200), GHOST_6)).toMatchObject({
      integration: true,
    });
  });

  test("a 501 to a staff or session credential is the route's answer, not a refusal", () => {
    expect(classifyRoute(admin, responses(401, 501, 501, 501), GHOST_6)).toMatchObject({
      staff: true,
      session: true,
    });
  });

  test("a route without auth middleware is public whatever its body-less request returns", () => {
    const signIn = { method: "POST", path: "/session", labs: null, guard: "none" } as const;
    expect(classifyRoute(signIn, responses(401, 401, 401, 401), GHOST_6)).toEqual({
      public: true,
      integration: true,
      staff: true,
      session: true,
    });
  });

  test("a URL-token route refuses every header credential", () => {
    const schedules = {
      method: "PUT",
      path: "/schedules/:resource/:id",
      labs: null,
      guard: "url-token",
    } as const;
    expect(classifyRoute(schedules, responses(401, 401, 401, 401), GHOST_6)).toEqual({
      public: false,
      integration: false,
      staff: false,
      session: false,
    });
  });

  test("a credential whose request never gets an answer got past auth, which refuses immediately", () => {
    const hanging = { ...responses(403, 403, 0, 0), staff: { status: "timeout" as const } };
    expect(classifyRoute(admin, hanging, GHOST_6)).toMatchObject({ integration: false, staff: true });
  });

  test("an anonymous request that never gets an answer means the probe missed the route", () => {
    const anonymousHang = { ...responses(403, 403, 0, 0), none: { status: "timeout" as const } };
    expect(() => classifyRoute(admin, anonymousHang, GHOST_6)).toThrow(/anonymous/);
  });

  test("a rate-limited response can't be classified", () => {
    expect(() => classifyRoute(admin, responses(403, 403, 429, 200), GHOST_6)).toThrow(/429/);
  });

  test("a redirect means the probe URL wasn't the canonical one", () => {
    expect(() => classifyRoute(admin, responses(403, 301, 301, 301), GHOST_6)).toThrow(/301/);
  });

  test("a guarded route that lets an anonymous request through means the probe missed the route", () => {
    expect(() => classifyRoute(admin, responses(404, 403, 200, 200), GHOST_6)).toThrow(/anonymous/);
  });
});
