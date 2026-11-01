// Checks the pinned versions and legs, moving the pin, version comparison and the client's version strings.

import { copyFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { GHOST_LATEST } from "@ts-ghost/admin-api";

import {
  clientVersion,
  compareVersions,
  GHOST_LATEST_FILE,
  GHOST_VERSIONS_FILE,
  ghostImage,
  ghostLeg,
  ghostVersions,
  minorOf,
  setPin,
  unsupportedGhost,
} from "./versions.ts";

describe("compareVersions", () => {
  test("a missing part counts as 0, and later parts still decide", () => {
    expect(compareVersions("6", "6.0.1")).toBeLessThan(0);
    expect(compareVersions("6.1", "6.0.9")).toBeGreaterThan(0);
    expect(compareVersions("6.0", "6.0.0")).toBe(0);
  });
});

describe("minorOf", () => {
  test("keeps a version's major and minor", () => {
    expect(minorOf("6.73.2")).toBe("6.73");
    expect(minorOf("6.73")).toBe("6.73");
  });
});

describe("clientVersion", () => {
  test("is the Ghost's major and minor, also on the pin", () => {
    expect(clientVersion("5.130.6")).toBe("v5.130");
    expect(clientVersion("6.30.0")).toBe("v6.30");
    expect(clientVersion(ghostVersions().pin)).toBe(`v${GHOST_LATEST}`);
  });

  test("refuses a major the client doesn't support, saying so", () => {
    expect(() => clientVersion("7.0.0")).toThrow("Ghost 7 isn't supported by the client yet");
  });
});

describe("the pin", () => {
  test("setPin moves the pin and GHOST_LATEST together, keeping the other legs", () => {
    const dir = mkdtempSync(join(tmpdir(), "pin-"));
    const files = { versions: join(dir, "ghost-versions.json"), latest: join(dir, "ghost-latest.ts") };
    copyFileSync(GHOST_VERSIONS_FILE, files.versions);
    copyFileSync(GHOST_LATEST_FILE, files.latest);
    setPin("6.80.1", "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", files);
    expect(ghostVersions(files.versions)).toEqual({ ...ghostVersions(), pin: "6.80.1" });
    expect(readFileSync(files.latest, "utf8")).toContain('export const GHOST_LATEST: string = "6.80";');
    expect(ghostImage("6.80.1", files.versions)).toBe(
      "ghost:6.80.1@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    // The old pin's digest goes with it; the frozen legs keep theirs.
    expect(ghostImage(ghostVersions().pin, files.versions)).toBe(`ghost:${ghostVersions().pin}`);
    expect(ghostImage(ghostVersions().v5, files.versions)).toBe(ghostImage(ghostVersions().v5));
  });

  test("is GHOST_LATEST's minor, which the drift job bumps with it", () => {
    expect(ghostVersions().pin).toMatch(new RegExp(`^${GHOST_LATEST.replace(".", "\\.")}\\.\\d+$`));
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
  test("pin every image to an exact version and its digest", () => {
    for (const version of Object.values(ghostVersions())) {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(ghostImage(version)).toMatch(new RegExp(`^ghost:${version}@sha256:[0-9a-f]{64}$`));
    }
  });

  test("run an unpinned Ghost by its tag alone", () => {
    expect(ghostImage("6.30.0")).toBe("ghost:6.30.0");
  });

  test("run the last Ghost 5 and Ghost 6.0.0 on compat", () => {
    expect(ghostLeg("v5")).toMatchObject({ ghost: ghostVersions().v5, target: "compat" });
    expect(ghostLeg("v6.0")).toMatchObject({ ghost: "6.0.0", target: "compat" });
  });

  test("run the pin on latest", () => {
    expect(ghostLeg("pin")).toMatchObject({ ghost: ghostVersions().pin, target: "latest" });
  });

  test("run a leg against another Ghost when asked", () => {
    expect(ghostLeg("v6.0", "6.30.0")).toMatchObject({ ghost: "6.30.0", target: "compat" });
  });

  test("default to the pin and refuse an unknown leg", () => {
    expect(ghostLeg(undefined).name).toBe("pin");
    expect(() => ghostLeg("v7")).toThrow(/Unknown GHOST_LEG "v7"/);
  });
});
