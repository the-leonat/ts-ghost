import { z } from "zod";

import { DebugOption } from "../helpers/debug";
import type { HTTPClient } from "../helpers/http-client";
import { parseResponse } from "../helpers/response-schema";
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
    let result: any = {};
    try {
      const response = await this.httpClient.fetchRawResponse({
        resource: this.resource,
        pathnameIdentity: this._pathnameIdentity,
        options: {
          ...options,
          method: "DELETE",
        },
      });
      if (response.status === 204) {
        result = {
          success: true,
        };
      } else {
        const body = await response.text();
        let errors: unknown;
        try {
          errors = JSON.parse(body).errors;
        } catch (e) {
          errors = [{ type: "FetchError", message: (e as Error).toString() }];
        }
        if (errors) {
          result.success = false;
          result.errors = errors;
          result.status = response.status;
          result.body = body;
        } else if (response.ok) {
          result = { success: true };
        }
      }
    } catch (e) {
      result = {
        success: false,
        errors: [
          {
            type: "FetchError",
            message: (e as Error).toString(),
          },
        ],
        status: 0,
      };
    }
    return parseResponse(schema, result, {
      dataPath: this.resource,
      status: result.status ?? 0,
      body: result.body,
    });
  }
}
