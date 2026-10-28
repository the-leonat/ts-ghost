import { afterEach, describe, expect, test, vi } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { recordResponses, undeclaredKeys } from "./unknown-keys.ts";

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
};

function ghostReturns(body: unknown) {
  // A plain function, not vi.fn(): recordResponses() spies on whatever fetch it finds.
  vi.stubGlobal(
    "fetch",
    async () => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } }),
  );
}

const strictApi = (ignore: string[] = []) =>
  new TSGhostAdminAPI("http://localhost:2368", KEY, "v6.0", { strict: { ignore } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("unknown-key check", () => {
  test("names the path of each key Ghost sends that the client's schema lacks", async () => {
    ghostReturns({ site: { ...site, language: "en", brand: { color: "#fff" } } });
    expect(undeclaredKeys(await strictApi().site.fetch())).toEqual(["site.brand", "site.language"]);
  });

  test("leaves out keys declared as deliberately ignored", async () => {
    ghostReturns({ site: { ...site, language: "en", brand_color: "#fff" } });
    expect(undeclaredKeys(await strictApi(["site.language"]).site.fetch())).toEqual(["site.brand_color"]);
  });

  test("collapses indices to [] and collects across results", async () => {
    ghostReturns({
      settings: [
        { key: "a", value: "1", group: "x" },
        { key: "b", value: "2", group: "y" },
      ],
    });
    const failed = { success: false, errors: [{ type: "NotFoundError", message: "gone" }] };
    const settings = await strictApi().settings.fetch();
    expect(undeclaredKeys(settings, failed)).toEqual(["settings[].group"]);
  });

  test("reports nothing for a result that parsed", async () => {
    ghostReturns({ site });
    expect(undeclaredKeys(await strictApi().site.fetch())).toEqual([]);
  });
});

describe("recordResponses", () => {
  test("keeps each raw JSON body for the test to inspect", async () => {
    ghostReturns({ site: { ...site, language: "en" } });
    const responses = recordResponses();
    try {
      await fetch("http://localhost:2368/ghost/api/admin/site/");
      expect(responses.last("/site/")).toEqual({ site: { ...site, language: "en" } });
    } finally {
      responses.restore();
    }
  });
});
