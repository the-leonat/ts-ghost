// The Admin API's path and URL; no imports, so the plain-Node manifest step loads it without the client.

/** Path of Ghost's Admin API under the site URL. */
export const ADMIN_API_PATH = "/ghost/api/admin";

export const adminApiUrl = (url: string) => `${url}${ADMIN_API_PATH}`;
