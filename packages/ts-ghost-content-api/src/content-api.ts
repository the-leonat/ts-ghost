import {
  APIComposer,
  BasicFetcher,
  contentAPICredentialsSchema,
  GHOST_FIELDS,
  HTTPClientFactory,
  schemaTarget,
  slugOrIdSchema,
  warnOnceOffLatest,
  type DebugOption,
  type ResourcesAbsentIn,
  type SchemaOption,
  type SchemaTargetOf,
  type StrictOption,
} from "@ts-ghost/core-api";

import { authorsIncludeSchema, authorsSchema } from "./authors/schemas";
import { pagesIncludeSchema, pagesSchema } from "./pages/schemas";
import { postsIncludeSchema, postsSchema } from "./posts/schemas";
import { settingsSchema } from "./settings/schemas";
import { tagsIncludeSchema, tagsSchema } from "./tags/schemas";
import { tiersIncludeSchema, tiersSchema } from "./tiers/schemas";

export type { ContentAPICredentials, APIVersions, SchemaTarget } from "@ts-ghost/core-api";

/** Options of the content client. */
export type ContentAPIOptions = DebugOption &
  SchemaOption & {
    /** Request options for every request; per-call options win, headers merge. */
    defaultRequestOptions?: RequestInit;
    /** Fail a result carrying a key the schema doesn't declare (by default it passes through);
     * `{ ignore: ["posts[].new_key"] }` lets the listed paths through, `[]` matching any index. */
    strict?: StrictOption;
  };

/** Ghost 5 has one schema target, so `schema` is a Ghost 6 option. */
type OptionsFor<Version> = [Version] extends [`v5.${string}`] ? { schema?: "compat" } : {};

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
  settings = "settings",
}

/**
 * The Content API client. Like the admin client, it selects a schema target from `version` and
 * `options.schema`; the Content API's fields are the same in every target so far.
 */
export class TSGhostContentAPIClient<
  Version extends `v5.${string}` | `v6.${string}` = any,
  Options extends ContentAPIOptions = {},
> {
  private HTTPClientFactoryFactory: HTTPClientFactory;
  /** The schema target this client parses against. */
  readonly target: SchemaTargetOf<Version, Options>;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
    protected readonly options?: Options & OptionsFor<Version>,
  ) {
    this.target = schemaTarget(version, options) as SchemaTargetOf<Version, Options>;
    const apiCredentials = contentAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.HTTPClientFactoryFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "content",
      ...(this.target === "v6-latest" && { onResponse: warnOnceOffLatest() }),
    });
  }

  get authors() {
    return new APIComposer(
      "authors",
      {
        schema: authorsSchema,
        identitySchema: slugOrIdSchema,
        include: authorsIncludeSchema,
      },
      this.HTTPClientFactoryFactory,
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new APIComposer(
      "tiers",
      { schema: tiersSchema, identitySchema: slugOrIdSchema, include: tiersIncludeSchema },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }
  get posts() {
    return new APIComposer(
      "posts",
      {
        schema: postsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
      },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }
  get pages() {
    return new APIComposer(
      "pages",
      {
        schema: pagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
      },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }
  get tags() {
    return new APIComposer(
      "tags",
      { schema: tagsSchema, identitySchema: slugOrIdSchema, include: tagsIncludeSchema },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }

  get settings() {
    return new BasicFetcher("settings", { output: settingsSchema }, this.HTTPClientFactoryFactory.create());
  }
}

/** The client a version and options select: resources its schema target lacks are left out of the type. */
export type TSGhostContentAPI<
  Version extends `v5.${string}` | `v6.${string}` = any,
  Options extends ContentAPIOptions = {},
> = Omit<
  TSGhostContentAPIClient<Version, Options>,
  ResourcesAbsentIn<typeof GHOST_FIELDS, SchemaTargetOf<Version, Options>>
>;

type ContentAPIConstructor = {
  new <Version extends `v5.${string}` | `v6.${string}` = any, Options extends ContentAPIOptions = {}>(
    url: string,
    key: string,
    version: Version,
    options?: Options & OptionsFor<Version>,
  ): TSGhostContentAPI<Version, Options>;
  prototype: TSGhostContentAPIClient;
};

/** The Content API client; see TSGhostContentAPIClient. */
export const TSGhostContentAPI = TSGhostContentAPIClient as ContentAPIConstructor;
