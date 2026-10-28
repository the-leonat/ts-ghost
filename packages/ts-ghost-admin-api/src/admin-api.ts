import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  baseOffersSchema,
  baseSiteSchema,
  baseTagsSchema,
  BasicFetcher,
  DebugOption,
  emailOrIdSchema,
  HTTPClientFactory,
  slugOrIdSchema,
  type StrictOption,
} from "@ts-ghost/core-api";

import { adminTiersCreateSchema, adminTiersSchema } from "./schemas";
import { droppedByGhost } from "./schemas/dropped-by-ghost";
import {
  adminMembersCreateSchema,
  adminMembersIncludeSchema,
  adminMembersSchema,
  adminMembersUpdateSchema,
} from "./schemas/members";
import { adminNewsletterCreateSchema, adminNewsletterSchema } from "./schemas/newsletters";
import { adminOffersCreateSchema, adminOffersUpdateSchema } from "./schemas/offers";
import { adminPagesCreateSchema, adminPagesSchema, adminPagesUpdateSchema } from "./schemas/pages";
import { adminPostsCreateSchema, adminPostsSchema, adminPostsUpdateSchema } from "./schemas/posts";
import { adminTagsCreateSchema, adminTagsUpdateSchema } from "./schemas/tags";
import { adminUsersSchema } from "./schemas/users";
import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./schemas/webhooks";

export type { AdminAPICredentials, APIVersions } from "@ts-ghost/core-api";

/** A read by id, plus a read by slug for a resource Ghost has no read-by-slug route for. */
type ReadByIdOnly<Fetcher> = {
  (options: { id: string }): Fetcher;
  /** @deprecated Ghost has no read-by-slug route for this resource, so this always fails; use `read({ id })`. */
  (options: { slug: string }): Fetcher;
  (options: { id: string } | { slug: string }): Fetcher;
};

/** Types a composer's slug read as deprecated (newsletters, tiers, offers: Ghost reads them by id only). */
const readByIdOnly = <C extends object, Fetcher>(
  composer: C & { read: (options: { id: string } | { slug: string }) => Fetcher },
): Omit<C, "read"> & { read: ReadByIdOnly<Fetcher> } => composer;

export class TSGhostAdminAPI<Version extends `v5.${string}` | `v6.${string}` = any> {
  private httpClientFactory: HTTPClientFactory;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
    protected readonly options?: DebugOption & {
      /** Request options for every request, mutations included; per-call options win, headers merge. */
      defaultRequestOptions?: RequestInit;
      /** Fail a result carrying a key the client's schema doesn't declare; by default such keys pass through. */
      strict?: StrictOption;
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
      // Always sent: an include replaces Ghost's default `authors,tags`, and authors are required.
      authors: z.literal(true).default(true),
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
      /** @deprecated Ghost always sends a tier's monthly price and drops the include, so it is not sent. */
      monthly_price: droppedByGhost(z.literal(true)),
      /** @deprecated Ghost always sends a tier's yearly price and drops the include, so it is not sent. */
      yearly_price: droppedByGhost(z.literal(true)),
      /** @deprecated Ghost always sends a tier's benefits and drops the include, so it is not sent. */
      benefits: droppedByGhost(z.literal(true)),
    });
    const tiers = new APIComposer(
      "tiers",
      {
        // The tiers endpoint always sends benefits; a member's or post's embedded tier doesn't.
        schema: adminTiersSchema.required({ benefits: true }),
        identitySchema: slugOrIdSchema,
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read"]); // for now tiers mutations don't really work in the admin api
    return readByIdOnly(tiers);
  }

  get newsletters() {
    const newslettersIncludeSchema = z.object({});
    const newsletters = new APIComposer(
      "newsletters",
      {
        schema: adminNewsletterSchema,
        identitySchema: slugOrIdSchema,
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z.object({
          opt_in_existing: z.boolean(),
        }),
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit"]);
    return readByIdOnly(newsletters);
  }

  get offers() {
    const offersIncludeSchema = z.object({});
    const offers = new APIComposer(
      "offers",
      {
        schema: baseOffersSchema,
        identitySchema: slugOrIdSchema,
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema,
      },
      this.httpClientFactory,
    ).access(["browse", "read", "add", "edit"]);
    return readByIdOnly(offers);
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
