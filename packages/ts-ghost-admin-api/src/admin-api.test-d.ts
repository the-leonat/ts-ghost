import { describe, expectTypeOf, test } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";

const api = new TSGhostAdminAPI("https://ghost.org", "1:2", "v6.0");

describe("tiers", () => {
  test("Ghost's tiers endpoint always sends benefits, so they are typed as present", async () => {
    const browsed = await api.tiers.browse().fetch();
    if (browsed.success) expectTypeOf(browsed.data[0]!.benefits).toEqualTypeOf<string[]>();
    const read = await api.tiers.read({ id: "x" }).fetch();
    if (read.success) expectTypeOf(read.data.benefits).toEqualTypeOf<string[]>();
  });
});

describe("members", () => {
  test("includable relations are optional on a plain read and required when included", async () => {
    const plain = await api.members.browse().fetch();
    const included = await api.members.browse().include({ tiers: true, email_recipients: true }).fetch();
    const read = await api.members.read({ id: "x" }).include({ tiers: true }).fetch();
    if (plain.success && included.success && read.success) {
      expectTypeOf(plain.data[0]!.tiers).toBeNullable();
      expectTypeOf(plain.data[0]!.email_recipients).toBeNullable();
      expectTypeOf(included.data[0]!.tiers).not.toBeNullable();
      expectTypeOf(included.data[0]!.email_recipients).not.toBeNullable();
      expectTypeOf(read.data.tiers[0]!.type).toEqualTypeOf<"free" | "paid">();
      // Always sent, so never optional.
      expectTypeOf(plain.data[0]!.labels).not.toBeNullable();
      expectTypeOf(plain.data[0]!.newsletters).not.toBeNullable();
      expectTypeOf(plain.data[0]!.subscriptions).not.toBeNullable();
    }
  });

  test("labels and subscriptions are always sent and cannot be included", () => {
    // @ts-expect-error labels are not an include
    void api.members.browse().include({ labels: true });
    // @ts-expect-error subscriptions are not an include
    void api.members.read({ id: "x" }).include({ subscriptions: true });
  });

  test("an update takes no include option: Ghost's members.edit accepts only the id", () => {
    // @ts-expect-error edit has no include option
    void api.members.edit("x", { name: "n" }, { include: "tiers" });
  });
});
