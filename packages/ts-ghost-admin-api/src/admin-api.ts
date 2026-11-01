import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  BasicFetcher,
  DebugOption,
  emailOrIdSchema,
  GHOST_LATEST,
  HTTPClientFactory,
  slugOrIdSchema,
  type ClientVersion,
  type SchemaTarget,
  type StrictOption,
} from "@ts-ghost/core-api";

import { adminTiersCreateSchema } from "./schemas";
import {
  adminMembersCreateSchema,
  adminMembersIncludeSchema,
  adminMembersUpdateSchema,
} from "./schemas/members";
import { adminNewsletterCreateSchema } from "./schemas/newsletters";
import { adminOffersCreateSchema, adminOffersUpdateSchema } from "./schemas/offers";
import { adminPagesCreateSchema, adminPagesUpdateSchema } from "./schemas/pages";
import { adminPostsCreateSchema, adminPostsUpdateSchema } from "./schemas/posts";
import { adminTagsCreateSchema, adminTagsUpdateSchema } from "./schemas/tags";
import { adminSchemas, type AdminSchemas } from "./schemas/targets";
import { adminWebhookCreateSchema, adminWebhookUpdateSchema } from "./schemas/webhooks";

export type { AdminAPICredentials, APIVersions, ClientVersion, SchemaTarget } from "@ts-ghost/core-api";

/** Options of the admin client. */
export type AdminAPIOptions<Target extends SchemaTarget = "compat"> = DebugOption & {
  /** `"latest"` parses exactly what this release's pinned Ghost sends; `"compat"`, the default, every supported Ghost. */
  schema?: Target;
  /** Request options for every request, mutations included; per-call options win, headers merge. */
  defaultRequestOptions?: RequestInit;
  /** For tests and drift checks, not production: also fail a result carrying a key the schema doesn't
   * declare (by default it passes through). `{ ignore: ["posts[].new_key"] }` lets listed paths through. */
  strict?: StrictOption;
};

// A target known only at runtime types as compat: latest's output fits it, and a union of shapes would lose fields.
type TypedTarget<Target extends SchemaTarget> = [Target] extends ["latest"] ? "latest" : "compat";

/** The Admin API client; `version` names the Ghost you run and is sent as `Accept-Version`. */
export class TSGhostAdminAPI<Version extends ClientVersion = any, Target extends SchemaTarget = "compat"> {
  private httpClientFactory: HTTPClientFactory;
  /** The schema target this client parses against. */
  private readonly target: SchemaTarget;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
    protected readonly options?: AdminAPIOptions<Target>,
  ) {
    this.target = options?.schema ?? "compat";
    const apiCredentials = adminAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.httpClientFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "admin",
      expectedVersion: this.target === "latest" ? GHOST_LATEST : undefined,
    });
  }

  /** This client's response schema for `resource`, typed as an object so APIComposer infers its shape. */
  private schema<R extends keyof AdminSchemas[SchemaTarget]>(
    resource: R,
  ): z.ZodObject<AdminSchemas[TypedTarget<Target>][R]["shape"]> {
    return adminSchemas[this.target][resource] as any;
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
        schema: this.schema("posts"),
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
        strict: this.options?.strict,
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
        schema: this.schema("pages"),
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
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get members() {
    return new APIComposer(
      "members",
      {
        schema: this.schema("members"),
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
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get tiers() {
    const tiersIncludeSchema = z.object({
      /** @deprecated Ghost always sends a tier's monthly price; the include is a no-op. */
      monthly_price: z.literal(true).optional(),
      /** @deprecated Ghost always sends a tier's yearly price; the include is a no-op. */
      yearly_price: z.literal(true).optional(),
      /** @deprecated Ghost always sends a tier's benefits; the include is a no-op. */
      benefits: z.literal(true).optional(),
    });
    // A tier is typed alike on every target, so compat's type fits them all.
    const tiers: AdminSchemas["compat"]["tiers"] = adminSchemas[this.target].tiers;
    return new APIComposer(
      "tiers",
      {
        // The tiers endpoint always sends benefits; a member's or post's embedded tier doesn't.
        schema: tiers.required({ benefits: true }),
        identitySchema: z.object({ id: z.string() }),
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema,
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read"]); // for now tiers mutations don't really work in the admin api
  }

  get newsletters() {
    const newslettersIncludeSchema = z.object({});
    return new APIComposer(
      "newsletters",
      {
        schema: this.schema("newsletters"),
        identitySchema: z.object({ id: z.string() }),
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z.object({
          opt_in_existing: z.boolean(),
        }),
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit"]);
  }

  get offers() {
    const offersIncludeSchema = z.object({});
    return new APIComposer(
      "offers",
      {
        schema: this.schema("offers"),
        identitySchema: z.object({ id: z.string() }),
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema,
        strict: this.options?.strict,
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
        schema: this.schema("tags"),
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema,
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get users() {
    const usersIncludeSchema = z.object({});
    return new APIComposer(
      "users",
      {
        schema: this.schema("users"),
        identitySchema: emailOrIdSchema,
        include: usersIncludeSchema,
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["browse", "read"]);
  }

  get webhooks() {
    return new APIComposer(
      "webhooks",
      {
        schema: this.schema("webhooks"),
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema,
        strict: this.options?.strict,
      },
      this.httpClientFactory,
    ).access(["add", "edit", "delete"]);
  }

  get site() {
    return new BasicFetcher(
      "site",
      { output: this.schema("site"), strict: this.options?.strict },
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
        strict: this.options?.strict,
      },
      this.httpClientFactory.create(),
    );
  }
}
