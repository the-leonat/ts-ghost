import { z, ZodRawShape } from "zod";

import { BrowseParamsSchema } from "../helpers/browse-params";
import { DebugOption } from "../helpers/debug";
import type { HTTPClient } from "../helpers/http-client";
import { dropUnselected, parseFetched, resultSchema } from "../helpers/response-schema";
import { ghostMetaSchema, type APIResource } from "../schemas/shared";
import type { Mask, NoUnrecognizedKeys } from "../utils";
import type { ContentFormats } from "./formats";
import { outputURLParams, withFields, withFormats, withInclude, type OutputConfig } from "./output-shape";

export class BrowseFetcher<
  const Resource extends APIResource = any,
  Params extends BrowseParamsSchema = any,
  Fields extends Mask<OutputShape> = any,
  BaseShape extends ZodRawShape = any,
  OutputShape extends ZodRawShape = any,
  IncludeShape extends ZodRawShape = any,
> {
  protected _urlParams: Record<string, string> = {};
  protected _urlSearchParams: URLSearchParams | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];

  constructor(
    protected resource: Resource,
    protected config: OutputConfig<BaseShape, OutputShape, IncludeShape>,
    private _params: {
      browseParams?: Params;
      include?: (keyof IncludeShape)[];
      fields?: Fields;
      formats?: string[];
    } = { browseParams: {} as Params, include: [], fields: {} as NoUnrecognizedKeys<Fields, OutputShape> },
    protected httpClient: HTTPClient,
  ) {
    this._buildUrlParams();
  }

  /**
   * Lets you choose output format for the content of Post and Pages resources
   * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
   * with the selected formats required.
   *
   * @param formats html, mobiledoc or plaintext
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public formats<Formats extends Mask<Pick<OutputShape, ContentFormats>>>(
    formats: NoUnrecognizedKeys<Formats, OutputShape>,
  ) {
    const shaped = withFormats<BaseShape, OutputShape, IncludeShape, Formats>(this.config, formats);
    return new BrowseFetcher(
      this.resource,
      shaped.config,
      { ...this._params, formats: shaped.formats },
      this.httpClient,
    );
  }

  /**
   * Let's you include special keys into the Ghost API Query to retrieve complimentary info
   * The available keys are defined by the Resource include schema, will not care about unknown keys.
   * Returns a new Fetcher with an Output shape modified with the include keys required.
   *
   * @param include Include specific keys from the include shape
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public include<Includes extends Mask<IncludeShape>>(include: NoUnrecognizedKeys<Includes, IncludeShape>) {
    const shaped = withInclude<BaseShape, OutputShape, IncludeShape, Includes>(this.config, include);
    return new BrowseFetcher(
      this.resource,
      shaped.config,
      { ...this._params, include: shaped.include },
      this.httpClient,
    );
  }

  /**
   * Let's you strip the output to only the specified keys of your choice that are in the config Schema
   * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
   *
   * @param fields Any keys from the resource Schema
   * @returns A new Fetcher with the fixed output shape having only the selected Fields
   */
  public fields<Fields extends Mask<OutputShape>>(fields: NoUnrecognizedKeys<Fields, OutputShape>) {
    const config = withFields<BaseShape, OutputShape, IncludeShape, Fields>(this.config, fields);
    return new BrowseFetcher(this.resource, config, this._params, this.httpClient);
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURLSearchParams() {
    return this._urlSearchParams;
  }

  public getIncludes() {
    return this._params?.include || [];
  }

  public getFormats() {
    return this._params?.formats || [];
  }

  private _buildUrlParams() {
    this._urlParams = {
      ...this._urlBrowseParams(),
      ...outputURLParams(this.config, this._params, { omitFields: ["count"] }),
    };
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }

  private _urlBrowseParams() {
    let urlBrowseParams: { filter?: string; page?: string; order?: string; limit?: string } = {};
    if (this._params.browseParams === undefined) return {};
    const { limit, page, ...params } = this._params.browseParams;
    urlBrowseParams = {
      ...params,
    };
    if (limit) {
      urlBrowseParams.limit = limit.toString();
    }
    if (page) {
      urlBrowseParams.page = page.toString();
    }
    return urlBrowseParams;
  }

  private _getResultSchema() {
    return resultSchema({ meta: ghostMetaSchema, data: z.array(this.config.output) });
  }

  private async _parse(
    resultSchema: ReturnType<typeof this._getResultSchema>,
    options?: RequestInit & DebugOption,
  ) {
    const fetched = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      options,
    });
    return parseFetched(resultSchema, fetched, {
      dataPath: this.resource,
      strict: this.config.strict,
      success: (result) => ({
        meta: result?.meta || {
          pagination: { pages: 0, page: 0, limit: 15, total: 0, prev: null, next: null },
        },
        data: dropUnselected(result?.[this.resource], this.config.schema, this.config.output),
      }),
    });
  }

  public async fetch(options?: RequestInit & DebugOption) {
    const resultSchema = this._getResultSchema();
    return this._parse(resultSchema, options);
  }

  public async paginate(options?: RequestInit & DebugOption) {
    if (!this._params.browseParams?.page) {
      this._params.browseParams = {
        ...this._params.browseParams,
        page: 1,
      } as Params;
      this._buildUrlParams();
    }

    const resultSchema = this._getResultSchema();
    const response: {
      current: z.infer<typeof resultSchema>;
      next: BrowseFetcher<Resource, Params, Fields, BaseShape, OutputShape, IncludeShape> | undefined;
    } = {
      current: await this._parse(resultSchema, options),
      next: undefined,
    };
    if (response.current.success === false) return response;
    const { meta } = response.current;
    if (meta.pagination.pages <= 1 || meta.pagination.page === meta.pagination.pages) return response;
    const params = {
      ...this._params,
      browseParams: {
        ...this._params.browseParams,
        page: meta.pagination.page + 1,
      },
    };
    const next = new BrowseFetcher(this.resource, this.config, params, this.httpClient);
    response.next = next;
    return response;
  }
}
