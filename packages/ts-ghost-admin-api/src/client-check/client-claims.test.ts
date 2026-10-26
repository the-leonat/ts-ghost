import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { describeClient } from "./client-claims";

const api = new TSGhostAdminAPI(
  "https://ghost.org",
  "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
  "v6.72",
);
const claims = describeClient(api);
const claimOf = (resource: string) => claims.find((claim) => claim.resource === resource);

describe("client claims: request bodies", () => {
  test("describes the body add() accepts as JSON Schema, with its required keys", () => {
    const add = claimOf("tags")?.inputs?.add;

    expect(add?.required).toEqual(["name"]);
    expect(Object.keys(add?.properties as object)).toContain("accent_color");
  });

  test("describes edit() by the schema edit() actually parses, derived from create when there is no update schema", () => {
    const edit = claimOf("members")?.inputs?.edit;

    expect(edit?.required ?? []).toEqual([]);
    expect(Object.keys(edit?.properties as object)).toContain("email");
  });

  test("describes no body for an operation the client does not expose", () => {
    expect(claimOf("tiers")?.inputs).toEqual({});
    expect(claimOf("settings")?.inputs).toBeUndefined();
  });
});
