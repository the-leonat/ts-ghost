import { afterAll, beforeAll, describe, expect, vi } from "vitest";

import { undeclaredKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const site = {
  title: "T",
  description: "D",
  logo: null,
  icon: null,
  cover_image: null,
  accent_color: null,
  locale: "en",
  version: "6.72",
  url: "http://localhost/",
  site_uuid: "3a6509ac-c05d-4ab0-b201-b09512b9ad72",
  allow_external_signup: true,
  timezone: "Etc/UTC",
};
const ghost = {
  url: "http://localhost:2368",
  integrationKey: KEY,
  staffToken: KEY,
  version: "6.72.0",
  leg: { name: "pin", ghost: "6.72.0", target: "v6-latest" },
} as const;

function stubSite() {
  // Stubbed before the fixture spies on fetch, which happens ahead of every test.
  beforeAll(() => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(JSON.stringify({ site: { ...site, unmodelled: 1 } }), {
          headers: { "content-type": "application/json" },
        }),
    );
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });
}

describe("liveTest's api", () => {
  liveTest.override({ ghost: ghost as never });
  stubSite();

  liveTest("fails a result carrying a key the client's schema lacks", async ({ api }) => {
    expect(undeclaredKeys(await api.site.fetch())).toEqual(["site.unmodelled"]);
  });

  liveTest("records the raw response", async ({ api, responses }) => {
    await api.site.fetch();
    expect(responses.last("/site/")).toMatchObject({ site: { unmodelled: 1 } });
  });
});

describe("liveTest with keys ignored for the describe", () => {
  liveTest.override({ ghost: ghost as never, ignore: ["site.unmodelled"] });
  stubSite();

  liveTest("passes a result whose only unknown key is ignored", async ({ api }) => {
    assertOk(await api.site.fetch());
  });
});
