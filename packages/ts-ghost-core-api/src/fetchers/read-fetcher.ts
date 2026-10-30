import type { ZodRawShape } from "zod";

import { DebugOption } from "../helpers/debug";
import type { HTTPClient } from "../helpers/http-client";
import { dropUnselected, parseFetched, resultSchema } from "../helpers/response-schema";
import { type APIResource, type GhostIdentityInput } from "../schemas/shared";
import type { Mask, NoUnrecognizedKeys } from "../utils";
import type { ContentFormats } from "./formats";
import { outputURLParams, withFields, withFormats, withInclude, type OutputConfig } from "./output-shape";

export class ReadFetcher<
  const Resource extends APIResource = any,
  Fields extends Mask<OutputShape> = any,
  BaseShape extends ZodRawShape = any,
  OutputShape extends ZodRawShape = any,
  IncludeShape extends ZodRawShape = any,
> {
  protected _urlParams: Record<string, string> = {};
  protected _urlSearchParams: URLSearchParams | undefined = undefined;
  protected _pathnameIdentity: string | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];

  constructor(
    protected resource: Resource,
    protected config: OutputConfig<BaseShape, OutputShape, IncludeShape>,
    private _params: {
      identity: GhostIdentityInput;
      include?: (keyof IncludeShape)[];
      fields?: Fields;
      formats?: string[];
    },
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
    return new ReadFetcher(
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
    return new ReadFetcher(
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
    return new ReadFetcher(this.resource, config, this._params, this.httpClient);
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

  public getIncludes() {
    return this._params?.include || [];
  }

  public getFormats() {
    return this._params?.formats || [];
  }

  private _buildUrlParams() {
    this._urlParams = outputURLParams(this.config, this._params);
    if (this._params.identity.id) {
      this._pathnameIdentity = `${this._params.identity.id}`;
    } else if (this._params.identity.slug) {
      this._pathnameIdentity = `slug/${this._params.identity.slug}`;
    } else if (this._params.identity.email) {
      this._pathnameIdentity = `email/${this._params.identity.email}`;
    } else {
      throw new Error("Identity is not defined");
    }
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }

  public async fetch(options?: RequestInit & DebugOption) {
    const res = resultSchema({ data: this.config.output });
    const fetched = await this.httpClient.fetchWithStatus({
      resource: this.resource,
      pathnameIdentity: this._pathnameIdentity,
      searchParams: this._urlSearchParams,
      options,
    });
    return parseFetched(res, fetched, {
      dataPath: `${this.resource}[0]`,
      strict: this.config.strict,
      success: (result) => ({
        data: dropUnselected(result?.[this.resource]?.[0], this.config.schema, this.config.output),
      }),
    });
  }
}
