import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { adminResponseSchemas, GHOST_FIELDS, GHOST_LATEST } from "@ts-ghost/admin-api";

import { fieldDrift, GHOST_FIELDS_FILE, ghostFieldsSource, removalChangeset } from "./fields.ts";

const site = {
  title: "t",
  description: "d",
  logo: null,
  version: "6.74",
  url: "http://localhost/",
  icon: null,
  cover_image: null,
  accent_color: null,
  locale: "en",
  timezone: "Etc/UTC",
  site_uuid: "u",
  allow_external_signup: true,
};
const response = (url: string, body: unknown) => ({ method: "GET", url, status: 200, body });
const schemas = adminResponseSchemas("v6-latest");

describe("fieldDrift", () => {
  test("names a key no schema declares by its table key", () => {
    const drift = fieldDrift(schemas, [
      response("http://g/ghost/api/admin/site/", { site: { ...site, new_key: 1 } }),
    ]);
    expect(drift).toEqual({ added: ["site.new_key"], removed: [], untracked: [] });
  });

  test("names a required key that no response object carries", () => {
    const without: Record<string, unknown> = { ...site };
    delete without.timezone;
    const drift = fieldDrift(schemas, [response("http://g/ghost/api/admin/site/", { site: without })]);
    expect(drift.removed).toEqual(["site.timezone"]);
  });

  test("ignores responses narrowed with fields and error responses", () => {
    const drift = fieldDrift(schemas, [
      response("http://g/ghost/api/admin/site/?fields=title", { site: { title: "t" } }),
      { ...response("http://g/ghost/api/admin/site/", { site: { x: 1 } }), status: 404 },
    ]);
    expect(drift).toEqual({ added: [], removed: [], untracked: [] });
  });
});

describe("removalChangeset", () => {
  test("is major for core-api and admin-api and names the removed fields", () => {
    const text = removalChangeset("6.74.0", ["site.timezone"]);
    expect(text).toContain('"@ts-ghost/core-api": major');
    expect(text).toContain('"@ts-ghost/admin-api": major');
    expect(text).toContain("Ghost 6.74.0 no longer sends `site.timezone`");
  });
});

describe("ghostFieldsSource", () => {
  const table = { "site.timezone": { since: "6.67" }, "zeta.old": { since: "6.1" } };

  test("adds since and until for the new minor, sorted, and moves GHOST_LATEST", () => {
    const source = ghostFieldsSource(
      table,
      { added: ["admin.posts.new_key"], removed: ["zeta.old"], untracked: [] },
      "6.74",
    );
    expect(source).toContain('export const GHOST_LATEST = "6.74";');
    expect(source).toContain(
      [
        "export const GHOST_FIELDS = {",
        '  "admin.posts.new_key": { since: "6.74" },',
        '  "site.timezone": { since: "6.67" },',
        '  "zeta.old": { since: "6.1", until: "6.74" },',
        "} as const satisfies GhostFieldTable;",
      ].join("\n"),
    );
  });

  test("regenerates the committed table file unchanged when nothing drifted", async () => {
    const committed = await readFile(GHOST_FIELDS_FILE, "utf8");
    const none = { added: [], removed: [], untracked: [] };
    expect(ghostFieldsSource(GHOST_FIELDS, none, GHOST_LATEST)).toBe(committed);
  });
});
