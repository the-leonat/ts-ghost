import { SignJWT } from "jose";

import type { APICredentials, APIResource } from "../schemas";
import { DebugOption, resolveDebugLogger } from "./debug";
import type { StrictOption } from "./response-schema";

export type FetchWithStatusResult<T = unknown> = {
  data: T;
  status: number;
  /** The response body as received, before any parsing; absent when no response arrived. */
  body?: string;
};

export type HTTPClientOptions = {
  key: string;
  version: APICredentials["version"];
  url: APICredentials["url"];
  endpoint: "content" | "admin";
  /** Request options for every request, e.g. `{ redirect: "manual" }`; per-call options win, headers merge. */
  defaultRequestOptions?: RequestInit;
  /** Fail results carrying keys the schema doesn't declare; by default they pass through. */
  strict?: StrictOption;
  /** Called with every response Ghost sends, before it is read. */
  onResponse?: (response: Response) => void;
} & DebugOption;

/** Merges caller headers over generated ones; a caller header replaces a same-named one, case-insensitively. */
function mergeHeaders(generated: Record<string, string>, ...supplied: (HeadersInit | undefined)[]) {
  const merged: Record<string, string> = { ...generated };
  for (const init of supplied) {
    if (init === undefined) continue;
    new Headers(init).forEach((value, name) => {
      for (const key of Object.keys(merged)) {
        if (key.toLowerCase() === name) delete merged[key];
      }
      merged[name] = value;
    });
  }
  return merged;
}

export interface IHTTPClient {
  get baseURL(): URL | undefined;
  get jwt(): string | undefined;
  generateJWT(key: string): Promise<string>;
  genHeaders(): Promise<Record<string, string>>;
  fetch({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }): Promise<any>;
  fetchRawResponse({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }): Promise<Response>;
  fetchWithStatus({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit;
    pathnameIdentity?: string;
  }): Promise<FetchWithStatusResult>;
}

export interface IHTTPClientFactory {
  create(config: HTTPClientOptions): HTTPClient;
}

export class HTTPClientFactory implements IHTTPClientFactory {
  constructor(private config: HTTPClientOptions) {}

  public create() {
    return new HTTPClient(this.config);
  }
}

export class HTTPClient<const Options extends HTTPClientOptions = any> implements IHTTPClient {
  private _jwt: string | undefined;
  private _jwtExpiresAt: number | undefined;
  protected _baseURL: URL | undefined = undefined;

  constructor(protected config: Options) {
    let prefixPath = new URL(config.url).pathname;
    if (prefixPath.slice(-1) === "/") {
      prefixPath = prefixPath.slice(0, -1);
    }

    this._baseURL = new URL(`${prefixPath}/ghost/api/${config.endpoint}/`, config.url);
  }

  get baseURL() {
    return this._baseURL;
  }

  get strict(): StrictOption {
    return this.config.strict ?? false;
  }

  get jwt() {
    return this._jwt;
  }

  public async generateJWT(key: string) {
    const [id, _secret] = key.split(":");
    this._jwtExpiresAt = Date.now() + 5 * 60 * 1000;
    return new SignJWT({})
      .setProtectedHeader({ kid: id, alg: "HS256" })
      .setExpirationTime("5m")
      .setIssuedAt()
      .setAudience("/admin/")
      .sign(
        Uint8Array.from((_secret.match(/.{1,2}/g) as RegExpMatchArray).map((byte) => parseInt(byte, 16))),
      );
  }

  public async genHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept-Version": this.config.version,
    };
    if (this.config.endpoint === "admin") {
      if (this._jwt === undefined || this._jwtExpiresAt === undefined || this._jwtExpiresAt < Date.now()) {
        this._jwt = await this.generateJWT(this.config.key);
      }
      headers["Authorization"] = `Ghost ${this.jwt}`;
    }
    return headers;
  }

  /** A fresh URL for one request; the base URL is never changed. */
  protected urlFor(resource: APIResource, pathnameIdentity?: string, searchParams?: URLSearchParams) {
    if (this._baseURL === undefined) throw new Error("URL is undefined");
    let path = `${resource}/`;
    if (pathnameIdentity !== undefined) {
      path += `${pathnameIdentity}/`;
    }
    const url = new URL(path, this._baseURL);
    if (searchParams !== undefined) {
      for (const [key, value] of searchParams.entries()) {
        url.searchParams.append(key, value);
      }
    }
    if (this.config.endpoint === "content") {
      url.searchParams.append("key", this.config.key);
    }
    return url;
  }

  /** The init for one request: per-call options over client defaults over generated headers. */
  protected requestInit(options: RequestInit | undefined, generatedHeaders: Record<string, string>) {
    const defaults = this.config.defaultRequestOptions;
    return {
      ...defaults,
      ...options,
      headers: mergeHeaders(generatedHeaders, defaults?.headers, options?.headers),
    };
  }

  /** @deprecated Unused by the fetchers, and its error shape differs from theirs; use `fetchWithStatus`. */
  public async fetch({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit & DebugOption;
    pathnameIdentity?: string;
  }) {
    const debug = resolveDebugLogger({ ...this.config, ...options });
    const url = this.urlFor(resource, pathnameIdentity, searchParams);
    let result = undefined;
    const headers = await this.genHeaders();
    debug("url", url.toString(), "headers", headers, "options", options);
    try {
      const response = await fetch(url.toString(), this.requestInit(options, headers));
      this.config.onResponse?.(response);
      result = await response.json();
      debug("result", result, "status", result.status);
    } catch (e) {
      debug("error", e);
      return {
        status: "error",
        errors: [
          {
            type: "FetchError",
            message: (e as Error).toString(),
          },
        ],
      };
    }
    return result;
  }

  public async fetchWithStatus({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit;
    pathnameIdentity?: string;
  }): Promise<FetchWithStatusResult> {
    const url = this.urlFor(resource, pathnameIdentity, searchParams);
    const headers = await this.genHeaders();
    try {
      const response = await fetch(url.toString(), this.requestInit(options, headers));
      this.config.onResponse?.(response);
      const status = response.status;
      const body = await response.text();
      // A delete answers 204 with no body.
      if (body === "" && response.ok) return { data: undefined, status, body };
      try {
        const data = JSON.parse(body);
        return { data, status, body };
      } catch (e) {
        return {
          data: {
            errors: [
              {
                type: "FetchError",
                message: (e as Error).toString(),
              },
            ],
          },
          status,
          body,
        };
      }
    } catch (e) {
      return {
        data: {
          errors: [
            {
              type: "FetchError",
              message: (e as Error).toString(),
            },
          ],
        },
        status: 0,
      };
    }
  }

  /** @deprecated Unused by the fetchers; use `fetchWithStatus`. */
  public async fetchRawResponse({
    resource,
    searchParams,
    options,
    pathnameIdentity,
  }: {
    resource: APIResource;
    searchParams?: URLSearchParams;
    options?: RequestInit;
    pathnameIdentity?: string;
  }) {
    const url = this.urlFor(resource, pathnameIdentity, searchParams);
    const headers = await this.genHeaders();
    const response = await fetch(url.toString(), this.requestInit(options, headers));
    this.config.onResponse?.(response);
    return response;
  }
}
