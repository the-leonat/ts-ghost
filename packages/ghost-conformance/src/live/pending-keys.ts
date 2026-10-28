import type { SchemaTarget } from "../ghost/pin.ts";

// Unknown keys awaiting a client schema fix, per schema target (each leg checks its own). Each resource's
// "carries no key the client's schema lacks" test.fails owns its keys; drop them when that test turns green.
export const PENDING_KEYS: Record<SchemaTarget, string[]> = {
  v5: [],
  "v6-compat": [],
  "v6-latest": [],
};
