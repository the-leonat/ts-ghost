// Version-watch: which Ghost release the drift job records, and where its
// artefacts live.
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { fixtureDirName, newestRelease } from "./release.mjs";

describe("newestRelease", () => {
  test("picks the highest release tag by version, not by text", () => {
    assert.equal(newestRelease(["v6.9.0", "v6.72.0", "v6.10.3", "v5.130.4"]), "v6.72.0");
  });

  test("a patch release counts as newer", () => {
    assert.equal(newestRelease(["v6.72.0", "v6.72.1"]), "v6.72.1");
  });

  test("ignores prereleases and anything that is not a release tag", () => {
    assert.equal(
      newestRelease(["v6.72.0", "v6.73.0-rc.0", "6.80.0", "v6.74.0^{}", "latest", "@tryghost/admin@6.0.0"]),
      "v6.72.0",
    );
  });

  test("reads tag names out of `git ls-remote --tags` output", () => {
    const lsRemote = [
      "0b1c7d0e\trefs/tags/v6.71.0",
      "7d1c9a2f\trefs/tags/v6.72.0",
      "7d1c9a2f\trefs/tags/v6.72.0^{}",
    ].join("\n");

    assert.equal(newestRelease(lsRemote), "v6.72.0");
  });

  test("no release tag at all is an error rather than a guess", () => {
    assert.throws(() => newestRelease(["latest"]), /no release tag/i);
  });
});

describe("fixtureDirName", () => {
  test("artefacts are keyed by Ghost minor version", () => {
    assert.equal(fixtureDirName("v6.72.1"), "ghost-6.72");
  });

  test("rejects anything but a release tag", () => {
    assert.throws(() => fixtureDirName("main"), /release tag/);
  });
});
