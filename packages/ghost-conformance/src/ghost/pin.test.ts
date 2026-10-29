import { describe, expect, test } from "vitest";

import { clientOptions, clientVersion, ghostLeg, ghostVersions, unsupportedGhost } from "./pin.ts";

describe("clientVersion", () => {
  test("is the major and minor the client sends", () => {
    expect(clientVersion("6.72.3")).toBe("v6.72");
    expect(clientVersion("5.130.6")).toBe("v5.130");
  });

  test("refuses a major the client doesn't support, saying so", () => {
    expect(() => clientVersion("7.0.0")).toThrow("Ghost 7 isn't supported by the client yet");
  });
});

describe("unsupportedGhost", () => {
  test("is undefined for Ghost 5 and 6", () => {
    expect(unsupportedGhost("6.0.0")).toBeUndefined();
    expect(unsupportedGhost("5.130.6")).toBeUndefined();
  });

  test("explains why another major can't run", () => {
    expect(unsupportedGhost("7.1.0")).toMatch(/^Ghost 7 isn't supported by the client yet/);
  });
});

describe("matrix legs", () => {
  test("pin every image to an exact version", () => {
    for (const version of Object.values(ghostVersions())) expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("run the last Ghost 5 on v5 and Ghost 6.0.0 on v6-compat", () => {
    expect(ghostLeg("v5")).toMatchObject({ ghost: ghostVersions().v5, target: "v5" });
    expect(ghostLeg("v6.0")).toMatchObject({ ghost: "6.0.0", target: "v6-compat" });
  });

  test("run the pin on v6-latest, and on v6-compat as its own leg", () => {
    const { pin } = ghostVersions();
    expect(ghostLeg("pin")).toMatchObject({ ghost: pin, target: "v6-latest" });
    expect(ghostLeg("pin-compat")).toMatchObject({ ghost: pin, target: "v6-compat" });
  });

  test("run a leg against another Ghost when asked", () => {
    expect(ghostLeg("v6.0", "6.30.0")).toMatchObject({ ghost: "6.30.0", target: "v6-compat" });
  });

  test("default to the pin and refuse an unknown leg", () => {
    expect(ghostLeg(undefined).name).toBe("pin");
    expect(() => ghostLeg("v7")).toThrow(/Unknown GHOST_LEG "v7"/);
  });

  test("select v6-latest through the client's schema option", () => {
    expect(clientOptions("v6-latest")).toEqual({ schema: "latest" });
    expect(clientOptions("v6-compat")).toEqual({});
    expect(clientOptions("v5")).toEqual({});
  });
});
