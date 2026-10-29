import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  baseOffersSchemaFor,
  baseSiteSchemaFor,
  baseTagsSchema,
  BasicFetcher,
  DebugOption,
  emailOrIdSchema,
  HTTPClientFactory,
  schemaTarget,
  slugOrIdSchema,
  warnOnceOffLatest,
  type SchemaOption,
  type SchemaTargetOf,
  type StrictOption,
  type VersionFor,
} from "@ts-ghost/core-api";

import { adminTiersCreateSchema, adminTiersSchema } from "./schemas";
import { droppedByGhost } from "./schemas/dropped-by-ghost";
import {
  adminMembersCreateSchema,
  adminMembersIncludeSchema,
  adminMembersSchemaFor,
  adminMembersUpdateSchema,
} from "./schemas/members";
import { adminNewsletterCreateSchema, adminNewsletterSchemaFor } from "./schemas/newsletters";
import { adminOffersCreateSchema, adminOffersUpdateSchema } from "./schemas/offers";
import { adminPagesCreateSchema, adminPagesSchemaFor, adminPagesUpdateSchema } from "./schemas/pages";
import { adminPostsCreateSchema, adminPostsSchemaFor, adminPostsUpdateSchema } from "./schemas/posts";
import { adminTagsCreateSchema, adminTagsUpdateSchema } from "./schemas/tags";
import { adminUsersSchemaFor } from "./schemas/users";
import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./schemas/webhooks";

export type { AdminAPICredentials, APIVersions, SchemaTarget } from "@ts-ghost/core-api";

/** Options of the admin client. */
export type AdminAPIOptions = DebugOption &
  SchemaOption & {
    /** Request options for every request, mutations included; per-call options win, headers merge. */
    defaultRequestOptions?: RequestInit;
    /** Fail a result carrying a key the schema doesn't declare (by default it passes through);
     * `{ ignore: ["posts[].new_key"] }` lets the listed paths through, `[]` matching any index. */
    strict?: StrictOption;
  };

/**
 * The Admin API client. Its schema target follows `version` and `options.schema`: "v5.x" parses as the last
 * Ghost 5, "v6.x" as any Ghost 6 (v6-compat), and "v6.x" with `{ schema: "latest" }` as the pinned Ghost 6.
 */
export class TSGhostAdminAPI<
  Version extends `v5.${string}` | `v6.${string}` = any,
  Options extends AdminAPIOptions = {},
> {
  private httpClientFactory: HTTPClientFactory;
  /** The schema target this client parses against. */
  readonly target: SchemaTargetOf<Version, Options>;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    // With `{ schema: "latest" }` only `v${GHOST_LATEST}`, e.g. "v6.72", type-checks.
    protected readonly version: VersionFor<Version, Options>,
    protected readonly options?: Options,
  ) {
    this.target = schemaTarget(version, options) as SchemaTargetOf<Version, Options>;
    const apiCredentials = adminAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.httpClientFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "admin",
      ...(this.target === "v6-latest" && { onResponse: warnOnceOffLatest() }),
    });
  }

  get posts() {
    const postsIncludeSchema = z.object({
      // Always sent: an include replaces Ghost's default `authors,tags`, and authors are required.
      authors: z.literal(true).default(true),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "posts",
      {
        schema: adminPostsSchemaFor(this.target),
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
        createSchema: adminPostsCreateSchema,
        updateSchema: adminPostsUpdateSchema,
        updateOptionsSchema: z.object({
          newsletter: z.string().optional(),
          email_segment: z.string().optional(),
          force_rerender: z.boolean().optional(),
          save_revision: z.boolean().optional(),
          convert_to_lexical: z.boolean().optional(),
          source: z.literal("html").optional(),
        }),
        createOptionsSchema: z.object({
          source: z.literal("html").optional(),
        }),
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get pages() {
    const pagesIncludeSchema = z.object({
      // Always sent: an include replaces Ghost's default `authors,tags`, and authors are required.
      authors: z.literal(true).default(true),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "pages",
      {
        schema: adminPagesSchemaFor(this.target),
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
        createSchema: adminPagesCreateSchema,
        updateSchema: adminPagesUpdateSchema,
        updateOptionsSchema: z.object({
          force_rerender: z.boolean().optional(),
          save_revision: z.boolean().optional(),
          convert_to_lexical: z.boolean().optional(),
          source: z.literal("html").optional(),
        }),
        createOptionsSchema: z.object({
          source: z.literal("html").optional(),
        }),
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get members() {
    return new APIComposer(
      "members",
      {
        schema: adminMembersSchemaFor(this.target),
        identitySchema: z.object({ id: z.string() }),
        include: adminMembersIncludeSchema,
        createSchema: adminMembersCreateSchema,
        updateSchema: adminMembersUpdateSchema,
        createOptionsSchema: z.object({
          send_email: z.boolean().optional(),
          email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
        }),
        updateOptionsSchema: z.object({
          send_email: z.boolean().optional(),
          email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
        }),
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get tiers() {
    const tiersIncludeSchema = z.object({
      /** @deprecated Ghost always sends a tier's monthly price and drops the include, so it is not sent. */
      monthly_price: droppedByGhost(z.literal(true)),
      /** @deprecated Ghost always sends a tier's yearly price and drops the include, so it is not sent. */
      yearly_price: droppedByGhost(z.literal(true)),
      /** @deprecated Ghost always sends a tier's benefits and drops the include, so it is not sent. */
      benefits: droppedByGhost(z.literal(true)),
    });
    return new APIComposer(
      "tiers",
      {
        // The tiers endpoint always sends benefits; a member's or post's embedded tier doesn't.
        schema: adminTiersSchema.required({ benefits: true }),
        identitySchema: z.object({ id: z.string() }),
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read"]); // for now tiers mutations don't really work in the admin api
  }

  get newsletters() {
    const newslettersIncludeSchema = z.object({});
    return new APIComposer(
      "newsletters",
      {
        schema: adminNewsletterSchemaFor(this.target),
        identitySchema: z.object({ id: z.string() }),
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z.object({
          opt_in_existing: z.boolean(),
        }),
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit"]);
  }

  get offers() {
    const offersIncludeSchema = z.object({});
    return new APIComposer(
      "offers",
      {
        schema: baseOffersSchemaFor(this.target),
        identitySchema: z.object({ id: z.string() }),
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit"]);
  }

  get tags() {
    const tagsIncludeSchema = z.object({
      "count.posts": z.literal(true).optional(),
    });
    return new APIComposer(
      "tags",
      {
        schema: baseTagsSchema,
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get users() {
    const usersIncludeSchema = z.object({});
    return new APIComposer(
      "users",
      {
        schema: adminUsersSchemaFor(this.target),
        identitySchema: emailOrIdSchema,
        include: usersIncludeSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read"]);
  }

  get webhooks() {
    return new APIComposer(
      "webhooks",
      {
        schema: adminWebhookSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema,
      },
      this.httpClientFactory,
    ).access(["add", "edit", "delete"]);
  }

  get site() {
    return new BasicFetcher(
      "site",
      { output: baseSiteSchemaFor(this.target) },
      this.httpClientFactory.create(),
    );
  }

  get settings() {
    return new BasicFetcher(
      "settings",
      {
        output: z.array(
          z.object({
            key: z.string(),
            value: z
              .string()
              .nullable()
              .or(z.number().nullable())
              .or(z.boolean().nullable())
              .or(z.array(z.string()))
              .meta({ description: "A list for list-valued settings, e.g. all_blocked_email_domains" }),
          }),
        ),
      },
      this.httpClientFactory.create(),
    );
  }
}
