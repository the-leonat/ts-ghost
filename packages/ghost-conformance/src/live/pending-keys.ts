// Unknown keys awaiting a client schema fix (Ghost 6.72). Each resource's "carries no key the client's
// schema lacks" test.fails owns its keys; drop them here when that test turns green.

export const PENDING_KEYS: string[] = [];
