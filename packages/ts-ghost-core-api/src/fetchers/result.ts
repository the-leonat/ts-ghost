import type { FetchWithStatusResult } from "../helpers/http-client";

/**
 * A fetcher's result before it is parsed: on an error response, Ghost's errors
 * with the HTTP status and the body as received; otherwise `success: true` and
 * what `onSuccess` picks from the response data.
 */
export function toFetcherResult(
  { data, status, body }: FetchWithStatusResult<any>,
  onSuccess: (data: any) => Record<string, unknown>,
) {
  if (data.errors) {
    return { success: false, errors: data.errors, status, ...(body !== undefined && { body }) };
  }
  return { success: true, ...onSuccess(data) };
}
