// Checks finding the newest Ghost release, its digest and the releases since the pin, and the plan.

import { describe, expect, test } from "vitest";

import { planDrift, resolveNewestGhost } from "./plan.ts";

const release = (tag: string, extra: Partial<{ prerelease: boolean; draft: boolean }> = {}) => ({
  tag_name: tag,
  html_url: `https://github.com/TryGhost/Ghost/releases/tag/${tag}`,
  prerelease: false,
  draft: false,
  ...extra,
});

const digestOf = (tag: string) => `sha256:${tag.replace(/\D/g, "").padEnd(64, "0")}`;

/** Stub of GitHub's releases API and Docker Hub's tag lookup; `images` lists the published image tags. */
function stubFetch(releases: unknown[], images: string[]) {
  const requests: string[] = [];
  const fetch = async (input: string | URL) => {
    const url = String(input);
    requests.push(url);
    if (url.startsWith("https://api.github.com/repos/TryGhost/Ghost/releases"))
      return Response.json(releases);
    const tag = /\/repositories\/library\/ghost\/tags\/([^/]+)\/?$/.exec(url)?.[1];
    if (tag)
      return images.includes(tag)
        ? Response.json({ digest: digestOf(tag) })
        : new Response("{}", { status: 404 });
    return new Response("unexpected", { status: 500 });
  };
  return { fetch, requests };
}

describe("resolveNewestGhost", () => {
  /** Unordered, with a prerelease, a draft and releases at or before the pin. */
  const mixed = () =>
    stubFetch(
      [
        release("v6.73.0"),
        release("v6.74.0-rc.1", { prerelease: true }),
        release("v6.80.0", { draft: true }),
        release("v6.72.1"),
        release("v6.72.0"),
        release("v5.130.0"),
        release("v6.71.0"),
        release("v6.100.0"),
      ],
      ["6.100.0", "6.73.0", "6.72.1"],
    ).fetch;

  test("picks the highest stable release by version, not by list order", async () => {
    const newest = await resolveNewestGhost({ pin: "6.72.0", fetch: mixed() });
    expect(newest.version).toBe("6.100.0");
  });

  test("gives the digest of the newest release's official image", async () => {
    const newest = await resolveNewestGhost({ pin: "6.72.0", fetch: mixed() });
    expect(newest.digest).toBe(digestOf("6.100.0"));
  });

  test("lists every stable release after the pin up to the newest, oldest first, with its URL", async () => {
    const newest = await resolveNewestGhost({ pin: "6.72.0", fetch: mixed() });
    expect(newest.releases.map((r) => r.version)).toEqual(["6.72.1", "6.73.0", "6.100.0"]);
    expect(newest.releases[0]?.url).toBe("https://github.com/TryGhost/Ghost/releases/tag/v6.72.1");
  });

  test("skips a release whose official Docker image isn't published yet", async () => {
    const { fetch } = stubFetch([release("v6.74.0"), release("v6.73.0")], ["6.73.0"]);
    const newest = await resolveNewestGhost({ pin: "6.72.0", fetch });
    expect(newest.version).toBe("6.73.0");
    expect(newest.releases.map((r) => r.version)).toEqual(["6.73.0"]);
  });

  test("an explicit target version wins over the newest release", async () => {
    const { fetch } = stubFetch([release("v6.74.0"), release("v6.73.0")], ["6.74.0", "6.73.0"]);
    const newest = await resolveNewestGhost({ pin: "6.72.0", fetch, target: "6.73.0" });
    expect(newest.version).toBe("6.73.0");
    expect(newest.digest).toBe(digestOf("6.73.0"));
    expect(newest.releases.map((r) => r.version)).toEqual(["6.73.0"]);
  });

  test.for(["latest", "6.73", "6.73.0\nbump=true", "v6.73.0"])(
    "refuses the target version %j, which isn't major.minor.patch",
    async (target) => {
      const { fetch } = stubFetch([release("v6.73.0")], ["6.73.0", "latest"]);
      await expect(resolveNewestGhost({ pin: "6.72.0", fetch, target })).rejects.toThrow(
        /not a Ghost version/,
      );
    },
  );

  test("refuses a target version without an official Docker image", async () => {
    const { fetch } = stubFetch([release("v6.74.0"), release("v6.73.0")], ["6.73.0"]);
    await expect(resolveNewestGhost({ pin: "6.72.0", fetch, target: "6.74.0" })).rejects.toThrow(
      /no official Docker image ghost:6\.74\.0/,
    );
  });

  test("fails, naming the source, when GitHub doesn't answer", async () => {
    const fetch = async () => new Response("rate limited", { status: 403 });
    await expect(resolveNewestGhost({ pin: "6.72.0", fetch })).rejects.toThrow(/GitHub releases.*403/);
  });
});

describe("planDrift", () => {
  test("does nothing when the newest release equals the pin", () => {
    expect(planDrift("6.72.0", "6.72.0")).toEqual({ bump: false, from: "6.72.0", to: "6.72.0" });
  });

  test("does nothing when the newest release is older than the pin", () => {
    expect(planDrift("6.72.0", "6.9.0")).toEqual({ bump: false, from: "6.72.0", to: "6.9.0" });
  });

  test("bumps when a newer release exists, comparing numerically", () => {
    expect(planDrift("6.9.0", "6.72.0")).toEqual({ bump: true, from: "6.9.0", to: "6.72.0" });
  });
});
