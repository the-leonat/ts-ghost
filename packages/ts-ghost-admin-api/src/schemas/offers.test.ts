import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { stubFetch } from "../stub-fetch";

const key = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";

describe("offers.add", () => {
  const api = new TSGhostAdminAPI("https://ghost.org", key, "v6.0");
  const base = { name: "n", code: "trial-check", cadence: "year", amount: 14, tier: { id: "t" } } as const;
  const rejectsDuration = { name: "ZodError", issues: [expect.objectContaining({ path: ["duration"] })] };

  test("refuses a trial offer without a trial duration, sending nothing", async () => {
    stubFetch([]);
    // @ts-expect-error a trial offer's duration is "trial"
    await expect(api.offers.add({ ...base, type: "trial", duration: "once" })).rejects.toMatchObject(
      rejectsDuration,
    );
  });

  test("refuses a trial duration on another offer, sending nothing", async () => {
    stubFetch([]);
    // @ts-expect-error only a trial offer has a trial duration
    await expect(api.offers.add({ ...base, type: "percent", duration: "trial" })).rejects.toMatchObject(
      rejectsDuration,
    );
  });
});
