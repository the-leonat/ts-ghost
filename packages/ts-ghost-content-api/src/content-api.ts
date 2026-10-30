import {
  APIComposer,
  BasicFetcher,
  contentAPICredentialsSchema,
  HTTPClientFactory,
  slugOrIdSchema,
  type DebugOption,
  type StrictOption,
} from "@ts-ghost/core-api";

import { authorsIncludeSchema, authorsSchema } from "./authors/schemas";
import { pagesIncludeSchema, pagesSchema } from "./pages/schemas";
import { postsIncludeSchema, postsSchema } from "./posts/schemas";
import { settingsSchema } from "./settings/schemas";
import { tagsIncludeSchema, tagsSchema } from "./tags/schemas";
import { tiersIncludeSchema, tiersSchema } from "./tiers/schemas";

export type { ContentAPICredentials, APIVersions } from "@ts-ghost/core-api";

/** Options of the content client. */
export type ContentAPIOptions = DebugOption & {
  /** Request options for every request; per-call options win, headers merge. */
  defaultRequestOptions?: RequestInit;
  /** For tests and drift checks, not production: also fail a result carrying a key the schema doesn't
   * declare (by default it passes through). `{ ignore: ["posts[].new_key"] }` lets listed paths through. */
  strict?: StrictOption;
};

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
  settings = "settings",
}

export class TSGhostContentAPI<Version extends `v5.${string}` | `v6.${string}` = any> {
  private HTTPClientFactoryFactory: HTTPClientFactory;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
    protected readonly options?: ContentAPIOptions,
  ) {
    const apiCredentials = contentAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.HTTPClientFactoryFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "content",
    });
  }

  get authors() {
    return new APIComposer(
      "authors",
      {
        schema: authorsSchema,
        identitySchema: slugOrIdSchema,
        include: authorsIncludeSchema,
        strict: this.options?.strict,
      },
      this.HTTPClientFactoryFactory,
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new APIComposer(
      "tiers",
      {
        schema: tiersSchema,
        identitySchema: slugOrIdSchema,
        include: tiersIncludeSchema,
        strict: this.options?.strict,
      },
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
        strict: this.options?.strict,
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
        strict: this.options?.strict,
      },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }
  get tags() {
    return new APIComposer(
      "tags",
      {
        schema: tagsSchema,
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        strict: this.options?.strict,
      },
      this.HTTPClientFactoryFactory,
    ).access(["browse", "read"]);
  }

  get settings() {
    return new BasicFetcher(
      "settings",
      { output: settingsSchema, strict: this.options?.strict },
      this.HTTPClientFactoryFactory.create(),
    );
  }
}
