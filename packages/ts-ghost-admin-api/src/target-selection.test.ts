import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { GHOST_LATEST } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "./admin-api";
import { json, stubFetch } from "./stub-fetch";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const url = "https://my-ghost-blog.com";

describe("a latest client on another Ghost minor", () => {
  const [major, minor] = GHOST_LATEST.split(".");
  const otherMinor = `${major}.${Number(minor) + 1}`;
  let warn: MockInstance<typeof console.warn>;
  const site = {
    title: "Blog",
    description: "",
    logo: null,
    version: "6.80",
    url: "https://my-ghost-blog.com/",
    icon: null,
    cover_image: null,
    accent_color: null,
    locale: "en",
    timezone: "Etc/UTC",
    site_uuid: "u1",
    allow_external_signup: true,
  };
  const respondAs = (version: string) =>
    stubFetch([json({ site }, { headers: { "content-version": version } })], { repeat: true });
  beforeEach(() => {
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    warn.mockRestore();
  });

  test("warns once when Ghost's content-version differs from the pin, and still succeeds", async () => {
    const api = new TSGhostAdminAPI(url, key, `v${otherMinor}` as `v6.${string}`, { schema: "latest" });
    respondAs(`v${otherMinor}`);
    expect(await api.site.fetch()).toMatchObject({ success: true });
    await api.site.fetch();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain(`Ghost v${otherMinor} answered a client on the latest schema`);
    expect(warn.mock.calls[0]?.[0]).toContain(`matches Ghost ${GHOST_LATEST}`);
  });

  test("stays quiet on the pinned minor, and on a compat client whatever its version", async () => {
    respondAs(`v${GHOST_LATEST}`);
    await new TSGhostAdminAPI(url, key, "v6.0", { schema: "latest" }).site.fetch();
    respondAs("v6.81");
    await new TSGhostAdminAPI(url, key, "v6.72").site.fetch();
    expect(warn).not.toHaveBeenCalled();
  });
});

test("the version string goes out as Accept-Version, whatever the target", async () => {
  const fetchMock = stubFetch([json({ site: {} })], { repeat: true });
  await new TSGhostAdminAPI(url, key, "v5.130.6", { schema: "latest" }).site.fetch();
  const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
  expect(headers["Accept-Version"]).toBe("v5.130.6");
});
