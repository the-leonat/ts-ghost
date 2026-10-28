import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  baseNewsletterSchema,
  baseOffersSchema,
  baseSiteSchema,
  baseTagsSchema,
  BasicFetcher,
  DebugOption,
  emailOrIdSchema,
  HTTPClientFactory,
  ignoredInclude,
  slugOrIdSchema,
} from "@ts-ghost/core-api";

import { adminTiersCreateSchema, adminTiersSchema } from "./schemas";
import {
  adminMembersCreateSchema,
  adminMembersIncludeSchema,
  adminMembersSchema,
  adminMembersUpdateSchema,
} from "./schemas/members";
import { adminNewsletterCreateSchema } from "./schemas/newsletters";
import { adminOffersCreateSchema, adminOffersUpdateSchema } from "./schemas/offers";
import { adminPagesCreateSchema, adminPagesSchema, adminPagesUpdateSchema } from "./schemas/pages";
import { adminPostsCreateSchema, adminPostsSchema, adminPostsUpdateSchema } from "./schemas/posts";
import { adminTagsCreateSchema, adminTagsUpdateSchema } from "./schemas/tags";
import { adminUsersSchema } from "./schemas/users";
import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./schemas/webhooks";

export type { AdminAPICredentials, APIVersions } from "@ts-ghost/core-api";

// Ghost registers only GET /<resource>/:id/ for tiers and offers; a slug read gets a 404.
const idOrDeprecatedSlugSchema = z.union([
  z.object({ id: z.string() }),
  z.object({
    /** @deprecated Ghost has no read-by-slug route for this resource, so it 404s. Read by `id`. */
    slug: z.string(),
  }),
]);

export class TSGhostAdminAPI<Version extends `v5.${string}` | `v6.${string}` = any> {
  private httpClientFactory: HTTPClientFactory;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
    protected readonly options?: DebugOption & {
      /** Request options for every request, mutations included; per-call options win, headers merge. */
      defaultRequestOptions?: RequestInit;
    },
  ) {
    const apiCredentials = adminAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.httpClientFactory = new HTTPClientFactory({
      ...options,
      ...apiCredentials,
      endpoint: "admin",
    });
  }

  /** The server's `content-version` from the latest response; `undefined` before any. */
  getServerVersion(): string | undefined {
    return this.httpClientFactory.serverVersion;
  }

  get posts() {
    const postsIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "posts",
      {
        schema: adminPostsSchema,
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
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "pages",
      {
        schema: adminPagesSchema,
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
        schema: adminMembersSchema,
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
      /** @deprecated Ghost ignores it and always sends a tier's monthly price, so it is not sent. */
      monthly_price: ignoredInclude(),
      /** @deprecated Ghost ignores it and always sends a tier's yearly price, so it is not sent. */
      yearly_price: ignoredInclude(),
      /** @deprecated Ghost ignores it and always sends a tier's benefits, so it is not sent. */
      benefits: ignoredInclude(),
    });
    return new APIComposer(
      "tiers",
      {
        schema: adminTiersSchema,
        identitySchema: idOrDeprecatedSlugSchema,
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
        schema: baseNewsletterSchema,
        identitySchema: slugOrIdSchema,
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
        schema: baseOffersSchema,
        identitySchema: idOrDeprecatedSlugSchema,
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
        schema: adminUsersSchema,
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
    return new BasicFetcher("site", { output: baseSiteSchema }, this.httpClientFactory.create());
  }

  get settings() {
    return new BasicFetcher(
      "settings",
      {
        output: z.array(
          z.object({
            key: z.string(),
            // List-valued settings (e.g. all_blocked_email_domains) arrive as arrays.
            value: z
              .string()
              .nullable()
              .or(z.number().nullable())
              .or(z.boolean().nullable())
              .or(z.array(z.string())),
          }),
        ),
      },
      this.httpClientFactory.create(),
    );
  }
}
