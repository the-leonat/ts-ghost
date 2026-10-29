import type { ZodTypeAny } from "zod";

import { DebugOption } from "../helpers/debug";
import type { HTTPClient } from "../helpers/http-client";
import { parseFetched, resultSchema } from "../helpers/response-schema";
import type { APIResource } from "../schemas/shared";

export class BasicFetcher<const Resource extends APIResource = any, OutputShape extends ZodTypeAny = any> {
  constructor(
    protected resource: Resource,
    protected config: {
      output: OutputShape;
    },
    protected httpClient: HTTPClient,
  ) {}

  public getResource() {
    return this.resource;
  }

  public async fetch(options?: RequestInit & DebugOption) {
    const res = resultSchema({ data: this.config.output });
    const fetched = await this.httpClient.fetchWithStatus({ options, resource: this.resource });
    return parseFetched(res, fetched, {
      dataPath: this.resource,
      strict: this.httpClient.strict,
      success: (result) => ({ data: result?.[this.resource] }),
    });
  }
}
