import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { json, stubFetch } from "../stub-fetch";

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

describe("each target parses as its Ghost sends", () => {
  const ghost60 = json({ newsletters: [ghost60Newsletter] });
  const ghost672 = json({ newsletters: [ghost672Newsletter] });
  const read = (api: TSGhostAdminAPI | TSGhostAdminAPI<any, "latest">) =>
    api.newsletters.read({ id: "n1" }).fetch();

  test("compat, the default even with the pin's version: a field Ghost added after 6.0 may be missing", async () => {
    const api = new TSGhostAdminAPI(url, key, "v6.72");
    stubFetch([ghost60, ghost672]);
    expect(await read(api)).toMatchObject({ success: true });
    expect(await read(api)).toMatchObject({ success: true, data: { show_share_button: true } });
  });

  test("latest: every field the pin sends is required", async () => {
    const api = new TSGhostAdminAPI(url, key, "v6.0", { schema: "latest" });
    stubFetch([ghost672, ghost60]);
    expect(await read(api)).toMatchObject({ success: true });
    expect(await read(api)).toMatchObject({
      success: false,
      errors: [{ type: "ResponseSchemaError", kind: "mismatch", path: "newsletters[0].show_share_button" }],
    });
  });
});
