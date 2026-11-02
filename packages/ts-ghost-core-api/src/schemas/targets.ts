/** The response shape a client parses against: latest is the pinned Ghost, compat every supported Ghost. */
export type SchemaTarget = "compat" | "latest";

/** A client's version string: Ghost 5 or 6. Sent as `Accept-Version`; it never selects types. */
export type ClientVersion = `v5.${string}` | `v6.${string}`;
