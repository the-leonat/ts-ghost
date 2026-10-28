import { z } from "zod";

import { DebugOption } from "../helpers/debug";
import type { FetchWithStatusResult, HTTPClient } from "../helpers/http-client";
import { parseFetched } from "../helpers/response-schema";
import type { APIResource } from "../schemas/shared";

export class DeleteFetcher<const Resource extends APIResource = any> {
  protected _pathnameIdentity: string | undefined = undefined;

  constructor(
    protected resource: Resource,
    private _params: { id: string },
    protected httpClient: HTTPClient,
  ) {
    this._buildPathnameIdentity();
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  private _buildPathnameIdentity() {
    if (!this._params.id) {
      throw new Error("Missing id in params");
    }
    this._pathnameIdentity = this._params.id;
  }

  public async submit(options?: RequestInit & DebugOption) {
    const schema = z.discriminatedUnion("success", [
      z.object({
        success: z.literal(true),
      }),
      z.object({
        success: z.literal(false),
        errors: z.array(
          z.object({
            type: z.string(),
            message: z.string(),
            context: z.string().nullish(),
          }),
        ),
        status: z.number(),
        body: z.string().optional(),
      }),
    ]);
    let fetched: FetchWithStatusResult<any>;
    try {
      const response = await this.httpClient.fetchRawResponse({
        resource: this.resource,
        pathnameIdentity: this._pathnameIdentity,
        options: { ...options, method: "DELETE" },
      });
      const body = await response.text();
      fetched = { data: deleteResponseData(response, body), status: response.status, body };
    } catch (e) {
      fetched = { data: { errors: [{ type: "FetchError", message: (e as Error).toString() }] }, status: 0 };
    }
    return parseFetched(schema, fetched, {
      dataPath: this.resource,
      strict: this.httpClient.strict,
      success: () => ({}),
    });
  }
}

/** A delete's body: empty on success (204), Ghost's errors, or a FetchError for an unreadable or unexpected one. */
function deleteResponseData(response: Response, body: string) {
  if (response.ok && body === "") return {};
  try {
    const data = JSON.parse(body);
    if (response.ok || data?.errors !== undefined) return data;
  } catch (e) {
    return { errors: [{ type: "FetchError", message: (e as Error).toString() }] };
  }
  return { errors: [{ type: "FetchError", message: `Unexpected ${response.status} response without errors` }] };
}
