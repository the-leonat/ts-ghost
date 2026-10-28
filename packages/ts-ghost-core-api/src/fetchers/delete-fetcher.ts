import { DebugOption } from "../helpers/debug";
import type { HTTPClient } from "../helpers/http-client";
import { parseFetched, resultSchema } from "../helpers/response-schema";
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
    const schema = resultSchema({});
    const fetched = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      pathnameIdentity: this._pathnameIdentity,
      options: { ...options, method: "DELETE" },
    });
    return parseFetched(schema, fetched, {
      dataPath: this.resource,
      strict: this.httpClient.strict,
      success: () => ({}),
    });
  }
}
