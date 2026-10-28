import { afterAll, afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import { GHOST_LATEST } from "@ts-ghost/core-api";

import { TSGhostAdminAPI } from "./admin-api";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const url = "https://my-ghost-blog.com";

// A newsletter as Ghost sends it; `show_share_button` arrived in Ghost 6.23.
const newsletter = {
  id: "n1",
  slug: "default-newsletter",
  name: "Default",
  description: null,
  sender_name: null,
  sender_email: null,
  sender_reply_to: "newsletter",
  status: "active",
  visibility: "members",
  subscribe_on_signup: true,
  sort_order: 0,
  header_image: null,
  show_header_icon: true,
  show_header_title: true,
  title_font_category: "sans_serif",
  title_alignment: "center",
  show_feature_image: true,
  body_font_category: "sans_serif",
  footer_content: null,
  show_badge: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  show_header_name: true,
  uuid: "u1",
  background_color: "light",
  button_color: null,
  button_corners: "rounded",
  button_style: "fill",
  divider_color: null,
  header_background_color: "transparent",
  image_corners: "square",
  link_color: null,
  link_style: "underline",
  post_title_color: null,
  section_title_color: null,
  title_font_weight: "bold",
  feedback_enabled: false,
  show_comment_cta: true,
  show_excerpt: false,
  show_latest_posts: false,
  show_post_title_section: true,
  show_subscription_details: false,
};
const ghost60Newsletter = newsletter;
const ghost672Newsletter = { ...newsletter, show_share_button: true };

describe("schema targets", () => {
  const fetch = vi.spyOn(globalThis, "fetch");
  const respond = (body: unknown) => fetch.mockResolvedValue(new Response(JSON.stringify(body)));
  beforeEach(() => fetch.mockClear());
  afterAll(() => fetch.mockRestore());

  const read = (api: { newsletters: { read: (o: { id: string }) => { fetch: () => Promise<unknown> } } }) =>
    api.newsletters.read({ id: "n1" }).fetch();

  test('"v6.x" selects v6-compat: a field Ghost added after 6.0 may be missing', async () => {
    const api = new TSGhostAdminAPI(url, key, "v6.0");
    respond({ newsletters: [ghost60Newsletter] });
    expect(await read(api)).toMatchObject({ success: true });
    respond({ newsletters: [ghost672Newsletter] });
    expect(await read(api)).toMatchObject({ success: true, data: { show_share_button: true } });
  });

  test('{ schema: "latest" } selects v6-latest: every field the pin sends is required', async () => {
    const api = new TSGhostAdminAPI(url, key, "v6.72", { schema: "latest" });
    respond({ newsletters: [ghost672Newsletter] });
    expect(await read(api)).toMatchObject({ success: true });
    respond({ newsletters: [ghost60Newsletter] });
    expect(await read(api)).toMatchObject({
      success: false,
      errors: [
        {
          type: "ResponseSchemaError",
          message: expect.stringContaining("newsletters[0].show_share_button"),
        },
      ],
    });
  });

  test('"v5.x" selects v5: Ghost 6 fields are not declared, so strict mode refuses them', async () => {
    const api = new TSGhostAdminAPI(url, key, "v5.130", { strict: true });
    respond({ newsletters: [ghost60Newsletter] });
    const result = await api.newsletters.read({ id: "n1" }).fetch();
    assert(result.success);
    expect(result.data).not.toHaveProperty("show_share_button");
    respond({ newsletters: [ghost672Newsletter] });
    expect(await read(api)).toMatchObject({
      success: false,
      errors: [{ message: expect.stringContaining("newsletters[0].show_share_button: key not declared") }],
    });
  });

  test('{ schema: "latest" } with a Ghost 5 version throws', () => {
    // @ts-expect-error latest is a Ghost 6 target
    expect(() => new TSGhostAdminAPI(url, key, "v5.130", { schema: "latest" })).toThrow(/Ghost 6 version/);
  });
});

describe("a v6-latest client on another Ghost minor", () => {
  // Spied per test: the describe above restores the global fetch when it ends.
  let fetch = vi.spyOn(globalThis, "fetch");
  let warn = vi.spyOn(console, "warn");
  const respondAs = (version: string) =>
    fetch.mockImplementation(
      async () =>
        new Response(JSON.stringify({ newsletters: [ghost672Newsletter] }), {
          headers: { "content-version": version },
        }),
    );
  beforeEach(() => {
    fetch = vi.spyOn(globalThis, "fetch");
    warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    fetch.mockRestore();
    warn.mockRestore();
  });

  test("warns once per client when Ghost's content-version differs from the pin, and still succeeds", async () => {
    const api = new TSGhostAdminAPI(url, key, "v6.80", { schema: "latest", strict: true });
    respondAs("v6.80");
    const read = await api.newsletters.read({ id: "n1" }).fetch();
    expect(read, JSON.stringify(read)).toMatchObject({ success: true });
    await api.newsletters.browse().fetch();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/Ghost v6\.80.*v6-latest.*6\.72/);
  });

  test("stays quiet on the pinned minor, and on a v6-compat client", async () => {
    respondAs(`v${GHOST_LATEST}`);
    await new TSGhostAdminAPI(url, key, "v6.72", { schema: "latest" }).newsletters.browse().fetch();
    respondAs("v6.80");
    await new TSGhostAdminAPI(url, key, "v6.80").newsletters.browse().fetch();
    expect(warn).not.toHaveBeenCalled();
  });
});
