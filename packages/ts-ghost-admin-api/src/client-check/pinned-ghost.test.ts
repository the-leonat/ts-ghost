import { describe, expect, test } from "vitest";

import { loadRouteSpec } from "./cross-check";
import { loadFixtures, PINNED_GHOST } from "./fixture-server";

// The client check asserts against the pinned Ghost release only. The drift job
// moves the pin and re-records in the same pull request; these keep the two in step.
describe("client check: pinned Ghost release", () => {
  test("the pin is a Ghost release tag and names its minor-keyed fixture directory", () => {
    expect(PINNED_GHOST.ref).toMatch(/^v\d+\.\d+\.\d+$/);
    expect(PINNED_GHOST.fixtureDir).toBe(`ghost-${PINNED_GHOST.minor}`);
  });

  test("every pinned fixture was recorded from the pinned Ghost minor", () => {
    const fixtures = loadFixtures(PINNED_GHOST.fixtureDir);

    expect(fixtures.length).toBeGreaterThan(0);
    for (const fixture of fixtures) {
      expect(fixture.response.headers["content-version"], fixture.request.path).toBe(
        `v${PINNED_GHOST.minor}`,
      );
    }
  });

  test("the pinned route spec was extracted from the pinned Ghost release", () => {
    expect(`v${loadRouteSpec(PINNED_GHOST.fixtureDir).ghostVersion}`).toBe(PINNED_GHOST.ref);
  });
});
