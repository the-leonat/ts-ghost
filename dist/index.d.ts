import { z, ZodRawShape, ZodTypeAny } from 'zod';
import * as z4 from 'zod/v4/core';

declare const baseAuthorsSchema: z.ZodObject<{
    name: z.ZodString;
    profile_image: z.ZodNullable<z.ZodString>;
    cover_image: z.ZodNullable<z.ZodString>;
    bio: z.ZodNullable<z.ZodString>;
    website: z.ZodNullable<z.ZodString>;
    location: z.ZodNullable<z.ZodString>;
    facebook: z.ZodNullable<z.ZodString>;
    twitter: z.ZodNullable<z.ZodString>;
    count: z.ZodOptional<z.ZodObject<{
        posts: z.ZodNumber;
    }, z.core.$strip>>;
    url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const basePagesSchema: z.ZodObject<{
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    custom_template: z.ZodNullable<z.ZodString>;
    canonical_url: z.ZodNullable<z.ZodString>;
    authors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        profile_image: z.ZodNullable<z.ZodString>;
        cover_image: z.ZodNullable<z.ZodString>;
        bio: z.ZodNullable<z.ZodString>;
        website: z.ZodNullable<z.ZodString>;
        location: z.ZodNullable<z.ZodString>;
        facebook: z.ZodNullable<z.ZodString>;
        twitter: z.ZodNullable<z.ZodString>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        feature_image: z.ZodNullable<z.ZodString>;
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        canonical_url: z.ZodNullable<z.ZodString>;
        accent_color: z.ZodNullable<z.ZodString>;
        url: z.ZodString;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        twitter_image: z.ZodNullable<z.ZodString>;
        twitter_title: z.ZodNullable<z.ZodString>;
        twitter_description: z.ZodNullable<z.ZodString>;
        og_image: z.ZodNullable<z.ZodString>;
        og_title: z.ZodNullable<z.ZodString>;
        og_description: z.ZodNullable<z.ZodString>;
        codeinjection_head: z.ZodNullable<z.ZodString>;
        codeinjection_foot: z.ZodNullable<z.ZodString>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>>;
    primary_author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        profile_image: z.ZodNullable<z.ZodString>;
        cover_image: z.ZodNullable<z.ZodString>;
        bio: z.ZodNullable<z.ZodString>;
        website: z.ZodNullable<z.ZodString>;
        location: z.ZodNullable<z.ZodString>;
        facebook: z.ZodNullable<z.ZodString>;
        twitter: z.ZodNullable<z.ZodString>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    primary_tag: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        feature_image: z.ZodNullable<z.ZodString>;
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        canonical_url: z.ZodNullable<z.ZodString>;
        accent_color: z.ZodNullable<z.ZodString>;
        url: z.ZodString;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        twitter_image: z.ZodNullable<z.ZodString>;
        twitter_title: z.ZodNullable<z.ZodString>;
        twitter_description: z.ZodNullable<z.ZodString>;
        og_image: z.ZodNullable<z.ZodString>;
        og_title: z.ZodNullable<z.ZodString>;
        og_description: z.ZodNullable<z.ZodString>;
        codeinjection_head: z.ZodNullable<z.ZodString>;
        codeinjection_foot: z.ZodNullable<z.ZodString>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>>;
    url: z.ZodString;
    excerpt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    reading_time: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    published_at: z.ZodNullable<z.ZodString>;
    email_subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_page: z.ZodDefault<z.ZodBoolean>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    html: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    plaintext: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comment_id: z.ZodNullable<z.ZodString>;
    feature_image: z.ZodNullable<z.ZodString>;
    feature_image_alt: z.ZodNullable<z.ZodString>;
    feature_image_caption: z.ZodNullable<z.ZodString>;
    featured: z.ZodBoolean;
    custom_excerpt: z.ZodNullable<z.ZodString>;
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const basePostsSchema: z.ZodObject<{
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    custom_template: z.ZodNullable<z.ZodString>;
    canonical_url: z.ZodNullable<z.ZodString>;
    authors: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        profile_image: z.ZodNullable<z.ZodString>;
        cover_image: z.ZodNullable<z.ZodString>;
        bio: z.ZodNullable<z.ZodString>;
        website: z.ZodNullable<z.ZodString>;
        location: z.ZodNullable<z.ZodString>;
        facebook: z.ZodNullable<z.ZodString>;
        twitter: z.ZodNullable<z.ZodString>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        feature_image: z.ZodNullable<z.ZodString>;
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        canonical_url: z.ZodNullable<z.ZodString>;
        accent_color: z.ZodNullable<z.ZodString>;
        url: z.ZodString;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        twitter_image: z.ZodNullable<z.ZodString>;
        twitter_title: z.ZodNullable<z.ZodString>;
        twitter_description: z.ZodNullable<z.ZodString>;
        og_image: z.ZodNullable<z.ZodString>;
        og_title: z.ZodNullable<z.ZodString>;
        og_description: z.ZodNullable<z.ZodString>;
        codeinjection_head: z.ZodNullable<z.ZodString>;
        codeinjection_foot: z.ZodNullable<z.ZodString>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>>;
    primary_author: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        profile_image: z.ZodNullable<z.ZodString>;
        cover_image: z.ZodNullable<z.ZodString>;
        bio: z.ZodNullable<z.ZodString>;
        website: z.ZodNullable<z.ZodString>;
        location: z.ZodNullable<z.ZodString>;
        facebook: z.ZodNullable<z.ZodString>;
        twitter: z.ZodNullable<z.ZodString>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
        url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    primary_tag: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        feature_image: z.ZodNullable<z.ZodString>;
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        canonical_url: z.ZodNullable<z.ZodString>;
        accent_color: z.ZodNullable<z.ZodString>;
        url: z.ZodString;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        count: z.ZodOptional<z.ZodObject<{
            posts: z.ZodNumber;
        }, z.core.$strip>>;
        twitter_image: z.ZodNullable<z.ZodString>;
        twitter_title: z.ZodNullable<z.ZodString>;
        twitter_description: z.ZodNullable<z.ZodString>;
        og_image: z.ZodNullable<z.ZodString>;
        og_title: z.ZodNullable<z.ZodString>;
        og_description: z.ZodNullable<z.ZodString>;
        codeinjection_head: z.ZodNullable<z.ZodString>;
        codeinjection_foot: z.ZodNullable<z.ZodString>;
        meta_title: z.ZodNullable<z.ZodString>;
        meta_description: z.ZodNullable<z.ZodString>;
        slug: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>>;
    url: z.ZodString;
    excerpt: z.ZodNullable<z.ZodString>;
    reading_time: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    published_at: z.ZodNullable<z.ZodString>;
    email_subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    is_page: z.ZodDefault<z.ZodBoolean>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    html: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    plaintext: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comment_id: z.ZodNullable<z.ZodString>;
    feature_image: z.ZodNullable<z.ZodString>;
    feature_image_alt: z.ZodNullable<z.ZodString>;
    feature_image_caption: z.ZodNullable<z.ZodString>;
    featured: z.ZodBoolean;
    custom_excerpt: z.ZodNullable<z.ZodString>;
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const baseSettingsSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    logo: z.ZodNullable<z.ZodString>;
    icon: z.ZodNullable<z.ZodString>;
    accent_color: z.ZodNullable<z.ZodString>;
    cover_image: z.ZodNullable<z.ZodString>;
    facebook: z.ZodNullable<z.ZodString>;
    twitter: z.ZodNullable<z.ZodString>;
    lang: z.ZodString;
    timezone: z.ZodString;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    navigation: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
    secondary_navigation: z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    members_support_address: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;

type DebugOption = {
    debug?: boolean;
    logger?: (message?: any, ...optionalParams: any[]) => void;
};
declare const resolveDebugLogger: (options?: DebugOption) => (message?: any, ...optionalParams: any[]) => void;

type FetchWithStatusResult<T = unknown> = {
    data: T;
    status: number;
};
type HTTPClientOptions = {
    key: string;
    version: APICredentials["version"];
    url: APICredentials["url"];
    endpoint: "content" | "admin";
} & DebugOption;
interface IHTTPClient {
    get baseURL(): URL | undefined;
    get jwt(): string | undefined;
    generateJWT(key: string): Promise<string>;
    genHeaders(): Promise<Record<string, string>>;
    fetch({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit & DebugOption;
        pathnameIdentity?: string;
    }): Promise<any>;
    fetchRawResponse({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit & DebugOption;
        pathnameIdentity?: string;
    }): Promise<Response>;
    fetchWithStatus({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit;
        pathnameIdentity?: string;
    }): Promise<FetchWithStatusResult>;
}
interface IHTTPClientFactory {
    create(config: HTTPClientOptions): HTTPClient;
}
declare class HTTPClientFactory implements IHTTPClientFactory {
    private config;
    constructor(config: HTTPClientOptions);
    create(): HTTPClient<HTTPClientOptions>;
}
declare class HTTPClient<const Options extends HTTPClientOptions = any> implements IHTTPClient {
    protected config: Options;
    private _jwt;
    private _jwtExpiresAt;
    protected _baseURL: URL | undefined;
    constructor(config: Options);
    get baseURL(): URL | undefined;
    get jwt(): string | undefined;
    generateJWT(key: string): Promise<string>;
    genHeaders(): Promise<Record<string, string>>;
    fetch({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit & DebugOption;
        pathnameIdentity?: string;
    }): Promise<any>;
    fetchWithStatus({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit;
        pathnameIdentity?: string;
    }): Promise<FetchWithStatusResult>;
    fetchRawResponse({ resource, searchParams, options, pathnameIdentity, }: {
        resource: APIResource;
        searchParams?: URLSearchParams;
        options?: RequestInit;
        pathnameIdentity?: string;
    }): Promise<Response>;
}

declare const ghostIdentitySchema: z.ZodObject<{
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;
declare const ghostIdentityInputSchema: z.ZodObject<{
    slug: z.ZodOptional<z.ZodString>;
    id: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEmail>;
}, z.core.$strip>;
type GhostIdentityInput = z.output<typeof ghostIdentityInputSchema>;
type GhostIdentity = z.infer<typeof ghostIdentitySchema>;
declare const ghostMetaSchema: z.ZodObject<{
    pagination: z.ZodObject<{
        pages: z.ZodNumber;
        page: z.ZodNumber;
        limit: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"all">]>;
        total: z.ZodNumber;
        prev: z.ZodNullable<z.ZodNumber>;
        next: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
type GhostMeta = z.infer<typeof ghostMetaSchema>;
declare const ghostExcerptSchema: z.ZodObject<{
    excerpt: z.ZodOptional<z.ZodString>;
    custom_excerpt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const ghostCodeInjectionSchema: z.ZodObject<{
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ghostFacebookSchema: z.ZodObject<{
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ghostTwitterSchema: z.ZodObject<{
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ghostSocialMediaSchema: z.ZodObject<{
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ghostMetadataSchema: z.ZodObject<{
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
declare const ghostVisibilitySchema: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
declare const apiVersionsSchema: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodString]>>;
type TAPIVersion<V> = V extends "v5.0" | `v5.${infer Minor}` ? `v5.${Minor}` : V extends "v6.0" | `v6.${infer Minor}` ? `v6.${Minor}` : never;
type APIVersions = z.infer<typeof apiVersionsSchema>;
declare const contentAPICredentialsSchema: z.ZodObject<{
    key: z.ZodString;
    version: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    url: z.ZodString;
}, z.core.$strip>;
type ContentAPICredentials = z.infer<typeof contentAPICredentialsSchema>;
type APIResource = "pages" | "posts" | "settings" | "authors" | "tiers" | "tags" | "members" | "site" | "offers" | "users" | "newsletters" | "webhooks" | "themes" | "files" | "images";
type APIEndpoint = "admin" | "content";
type APICredentials = {
    key: string;
    version: APIVersions;
    url: string;
};
type GhostRequestConfig = {
    endpoint: APIEndpoint;
    resource: APIResource;
    httpClient: HTTPClient;
};
declare const adminAPICredentialsSchema: z.ZodObject<{
    key: z.ZodString;
    version: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    url: z.ZodString;
}, z.core.$strip>;
declare const slugOrIdSchema: z.ZodUnion<readonly [z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>]>;
declare const emailOrIdSchema: z.ZodUnion<readonly [z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>]>;
declare const identitySchema: z.ZodUnion<readonly [z.ZodObject<{
    email: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    slug: z.ZodString;
}, z.core.$strip>]>;
type AdminAPICredentials = z.infer<typeof adminAPICredentialsSchema>;

declare const baseTagsSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    feature_image: z.ZodNullable<z.ZodString>;
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    canonical_url: z.ZodNullable<z.ZodString>;
    accent_color: z.ZodNullable<z.ZodString>;
    url: z.ZodString;
    created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    count: z.ZodOptional<z.ZodObject<{
        posts: z.ZodNumber;
    }, z.core.$strip>>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    meta_title: z.ZodNullable<z.ZodString>;
    meta_description: z.ZodNullable<z.ZodString>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const baseTiersSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    active: z.ZodBoolean;
    type: z.ZodUnion<readonly [z.ZodLiteral<"free">, z.ZodLiteral<"paid">]>;
    welcome_page_url: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodNullable<z.ZodString>;
    stripe_prices: z.ZodPipe<z.ZodOptional<z.ZodArray<z.ZodNumber>>, z.ZodTransform<number[], number[] | undefined>>;
    monthly_price: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | null, number | null | undefined>>;
    yearly_price: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | null, number | null | undefined>>;
    benefits: z.ZodOptional<z.ZodArray<z.ZodString>>;
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    trial_days: z.ZodDefault<z.ZodNumber>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const baseEmailSchema: z.ZodObject<{
    id: z.ZodString;
    uuid: z.ZodString;
    status: z.ZodString;
    recipient_filter: z.ZodString;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    error_data: z.ZodNullable<z.ZodAny>;
    email_count: z.ZodNumber;
    delivered_count: z.ZodNumber;
    opened_count: z.ZodNumber;
    failed_count: z.ZodNumber;
    subject: z.ZodString;
    from: z.ZodString;
    reply_to: z.ZodNullable<z.ZodString>;
    source: z.ZodString;
    html: z.ZodNullable<z.ZodString>;
    plaintext: z.ZodNullable<z.ZodString>;
    track_opens: z.ZodBoolean;
    submitted_at: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, z.core.$strip>;

declare const baseOffersSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodDefault<z.ZodString>;
    code: z.ZodString;
    display_title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    display_description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    type: z.ZodUnion<readonly [z.ZodLiteral<"percent">, z.ZodLiteral<"fixed">, z.ZodLiteral<"trial">]>;
    cadence: z.ZodUnion<readonly [z.ZodLiteral<"month">, z.ZodLiteral<"year">]>;
    amount: z.ZodNumber;
    duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">, z.ZodLiteral<"trial">]>;
    duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    currency_restriction: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
    redemption_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    tier: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;

declare const baseMembersSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
    note: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geolocation: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    labels: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        created_at: z.ZodString;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>;
    subscriptions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        customer: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            email: z.ZodString;
        }, z.core.$strip>;
        status: z.ZodString;
        start_date: z.ZodString;
        default_payment_card_last4: z.ZodNullable<z.ZodString>;
        cancel_at_period_end: z.ZodBoolean;
        cancellation_reason: z.ZodNullable<z.ZodString>;
        current_period_end: z.ZodString;
        price: z.ZodObject<{
            id: z.ZodString;
            price_id: z.ZodString;
            nickname: z.ZodString;
            amount: z.ZodNumber;
            interval: z.ZodString;
            type: z.ZodString;
            currency: z.ZodString;
        }, z.core.$strip>;
        tier: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodNullable<z.ZodString>;
            active: z.ZodBoolean;
            type: z.ZodUnion<readonly [z.ZodLiteral<"free">, z.ZodLiteral<"paid">]>;
            welcome_page_url: z.ZodNullable<z.ZodString>;
            created_at: z.ZodString;
            updated_at: z.ZodNullable<z.ZodString>;
            stripe_prices: z.ZodPipe<z.ZodOptional<z.ZodArray<z.ZodNumber>>, z.ZodTransform<number[], number[] | undefined>>;
            monthly_price: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | null, number | null | undefined>>;
            yearly_price: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodNumber>>, z.ZodTransform<number | null, number | null | undefined>>;
            benefits: z.ZodOptional<z.ZodArray<z.ZodString>>;
            visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
            currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            trial_days: z.ZodDefault<z.ZodNumber>;
            slug: z.ZodString;
            id: z.ZodString;
        }, z.core.$strip>>>;
        offer: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodDefault<z.ZodString>;
            code: z.ZodString;
            display_title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            display_description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            type: z.ZodUnion<readonly [z.ZodLiteral<"percent">, z.ZodLiteral<"fixed">, z.ZodLiteral<"trial">]>;
            cadence: z.ZodUnion<readonly [z.ZodLiteral<"month">, z.ZodLiteral<"year">]>;
            amount: z.ZodNumber;
            duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">, z.ZodLiteral<"trial">]>;
            duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            currency_restriction: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
            redemption_count: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            tier: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    avatar_image: z.ZodString;
    email_count: z.ZodNumber;
    email_opened_count: z.ZodNumber;
    email_open_rate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodString;
    last_seen_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    newsletters: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sender_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sender_email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sender_reply_to: z.ZodString;
        status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">]>;
        subscribe_on_signup: z.ZodBoolean;
        sort_order: z.ZodNumber;
        header_image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_header_icon: z.ZodBoolean;
        show_header_title: z.ZodBoolean;
        title_font_category: z.ZodUnion<readonly [z.ZodLiteral<"serif">, z.ZodLiteral<"sans_serif">]>;
        title_alignment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_feature_image: z.ZodBoolean;
        body_font_category: z.ZodUnion<readonly [z.ZodLiteral<"serif">, z.ZodLiteral<"sans_serif">]>;
        footer_content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_badge: z.ZodBoolean;
        created_at: z.ZodString;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_header_name: z.ZodBoolean;
        uuid: z.ZodString;
        slug: z.ZodString;
        id: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;

declare const baseNewsletterSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sender_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sender_email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sender_reply_to: z.ZodString;
    status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">]>;
    subscribe_on_signup: z.ZodBoolean;
    sort_order: z.ZodNumber;
    header_image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_header_icon: z.ZodBoolean;
    show_header_title: z.ZodBoolean;
    title_font_category: z.ZodUnion<readonly [z.ZodLiteral<"serif">, z.ZodLiteral<"sans_serif">]>;
    title_alignment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_feature_image: z.ZodBoolean;
    body_font_category: z.ZodUnion<readonly [z.ZodLiteral<"serif">, z.ZodLiteral<"sans_serif">]>;
    footer_content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_badge: z.ZodBoolean;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_header_name: z.ZodBoolean;
    uuid: z.ZodString;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;

declare const baseSiteSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    logo: z.ZodNullable<z.ZodString>;
    version: z.ZodString;
    url: z.ZodString;
}, z.core.$strip>;

type Split<Str, Separator extends string> = Str extends `${infer Start}${Separator}${infer Rest}` ? [Start, ...Split<Rest, Separator>] : [Str];
type BrowseOrder<S, Shape> = S extends [infer Head, ...infer Tail] ? Tail extends [] ? OrderPredicate<Head, Shape> : `${OrderPredicate<Head, Shape>},${BrowseOrder<Tail, Shape>}` : S extends string ? OrderPredicate<S, Shape> : never;
type OrderPredicate<S, Shape> = S extends string ? S extends `${infer Field} ${infer Direction}` ? Field extends keyof Shape ? Direction extends "ASC" | "DESC" | "asc" | "desc" ? `${Field} ${Direction}` : never : never : S extends keyof Shape ? `${S}` : never : never;
type FilterQuerySeparator = "+" | "," | "(" | ")";
type FilterQueryOperators = `-` | `>` | `<` | `~`;
type FilterQuerySetOperators = `-`;
type FieldOrSubField<S> = S extends `${infer Field}.${string}` ? Field : S;
type BrowseFilter<S, Shape> = S extends string ? S extends `${infer Field}:'${infer Value}'` ? FieldOrSubField<Field> extends keyof Shape ? Value extends string ? S : never : never : S extends `${infer Field}:${infer Rest}` ? FieldOrSubField<Field> extends keyof Shape ? Rest extends `${FilterQuerySetOperators}[${infer Values}]` ? `${Field}:${FilterQuerySetOperators}[${Values}]` : Rest extends `[${infer Values}]` ? `${Field}:[${Values}]` : Rest extends `${FilterQuerySetOperators}[${infer Values}]${FilterQuerySeparator}${infer NextQuery}` ? `${Field}:${FilterQuerySetOperators}[${Values}]${FilterQuerySeparator}${BrowseFilter<NextQuery, Shape>}` : Rest extends `[${infer Values}]${FilterQuerySeparator}${infer NextQuery}` ? `${Field}:[${Values}]${FilterQuerySeparator}${BrowseFilter<NextQuery, Shape>}` : Rest extends `${infer Value}${FilterQuerySeparator}${infer NextQuery}` ? `${Field}:${Value}${FilterQuerySeparator}${BrowseFilter<NextQuery, Shape>}` : Rest extends `${infer Value}` ? Value extends string ? `${Field}:${Value}` : never : S : never : never : never;
type BrowseParams<P, Shape> = P extends {
    order: infer Order;
} ? P extends {
    filter: infer Filter;
} ? Omit<P, "order" | "filter"> & {
    order: BrowseOrder<Split<Order, ",">, Shape>;
} & {
    filter: BrowseFilter<Filter, Shape>;
} : Omit<P, "order"> & {
    order: BrowseOrder<Split<Order, ",">, Shape>;
} : P extends {
    filter: infer Filter;
} ? Omit<P, "filter"> & {
    filter: BrowseFilter<Filter, Shape>;
} : P;
declare const browseParamsSchema: z.ZodObject<{
    order: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"all">, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodNumber>;
    filter: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
type BrowseParamsSchema = z.infer<typeof browseParamsSchema>;
declare const parseBrowseParams: <P, Shape extends z.ZodRawShape, IncludeShape extends z.ZodRawShape>(args: P, schema: z.ZodObject<Shape>, includeSchema?: z.ZodObject<IncludeShape>) => {
    limit?: number | "all" | undefined;
    page?: number | undefined;
    order?: string | undefined;
    filter?: string | undefined;
};

type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;

declare type Mask<Obj> = {
  [k in keyof Obj]?: true;
};

declare type InferResponseDataShape<T> = T extends { success: true; data: infer D } ? D : never;

declare type InferFetcherDataShape<T extends { fetch: () => Promise<any> }> = InferResponseDataShape<
  Awaited<ReturnType<T["fetch"]>>
>;

type IsAny<T> = 0 extends 1 & T ? true : false;

type NoUnrecognizedKeys<Obj extends object, Shape extends object> = {
  [k in keyof Obj]: k extends keyof Shape ? Obj[k] : never;
};

type ContentFormats = "html" | "mobiledoc" | "plaintext" | "lexical";

declare class BrowseFetcher<const Resource extends APIResource = any, Params extends BrowseParamsSchema = any, Fields extends Mask<OutputShape> = any, BaseShape extends ZodRawShape = any, OutputShape extends ZodRawShape = any, IncludeShape extends ZodRawShape = any> {
    protected resource: Resource;
    protected config: {
        schema: z.ZodObject<BaseShape>;
        output: z.ZodObject<OutputShape>;
        include: z.ZodObject<IncludeShape>;
    };
    private _params;
    protected httpClient: HTTPClient;
    protected _urlParams: Record<string, string>;
    protected _urlSearchParams: URLSearchParams | undefined;
    protected _includeFields: (keyof IncludeShape)[];
    constructor(resource: Resource, config: {
        schema: z.ZodObject<BaseShape>;
        output: z.ZodObject<OutputShape>;
        include: z.ZodObject<IncludeShape>;
    }, _params: {
        browseParams?: Params;
        include?: (keyof IncludeShape)[];
        fields?: Fields;
        formats?: string[];
    } | undefined, httpClient: HTTPClient);
    /**
     * Lets you choose output format for the content of Post and Pages resources
     * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
     * with the selected formats required.
     *
     * @param formats html, mobiledoc or plaintext
     * @returns A new Fetcher with the fixed output shape and the formats specified
     */
    formats<Formats extends Mask<Pick<OutputShape, ContentFormats>>>(formats: NoUnrecognizedKeys<Formats, OutputShape>): BrowseFetcher<Resource, Params, Fields, BaseShape, { [k in keyof OutputShape]: k extends keyof Formats | Exclude<keyof Formats, keyof Formats> ? z.ZodNonOptional<OutputShape[k]> : OutputShape[k]; }, IncludeShape>;
    /**
     * Let's you include special keys into the Ghost API Query to retrieve complimentary info
     * The available keys are defined by the Resource include schema, will not care about unknown keys.
     * Returns a new Fetcher with an Output shape modified with the include keys required.
     *
     * @param include Include specific keys from the include shape
     * @returns A new Fetcher with the fixed output shape and the formats specified
     */
    include<Includes extends Mask<IncludeShape>>(include: NoUnrecognizedKeys<Includes, IncludeShape>): BrowseFetcher<Resource, Params, Fields, BaseShape, { [k in keyof OutputShape]: k extends keyof Includes | Exclude<keyof Includes, keyof Includes> ? z.ZodNonOptional<OutputShape[k]> : OutputShape[k]; }, IncludeShape>;
    /**
     * Let's you strip the output to only the specified keys of your choice that are in the config Schema
     * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
     *
     * @param fields Any keys from the resource Schema
     * @returns A new Fetcher with the fixed output shape having only the selected Fields
     */
    fields<Fields extends Mask<OutputShape>>(fields: NoUnrecognizedKeys<Fields, OutputShape>): BrowseFetcher<Resource, Params, Fields_1, BaseShape, Pick<OutputShape, Extract<keyof OutputShape, keyof Fields | Exclude<keyof Fields, keyof Fields>>> extends infer T ? { [k in keyof T]: T[k]; } : never, IncludeShape>;
    getResource(): Resource;
    getParams(): {
        browseParams?: Params;
        include?: (keyof IncludeShape)[];
        fields?: Fields;
        formats?: string[];
    };
    getOutputFields(): string[];
    getURLSearchParams(): URLSearchParams | undefined;
    getIncludes(): (keyof IncludeShape)[];
    getFormats(): string[];
    private _buildUrlParams;
    private _urlBrowseParams;
    private _getResultSchema;
    fetch(options?: RequestInit & DebugOption): Promise<{
        success: true;
        meta: {
            pagination: {
                pages: number;
                page: number;
                limit: number | "all";
                total: number;
                prev: number | null;
                next: number | null;
            };
        };
        data: z.core.$InferObjectOutput<OutputShape, {}>[];
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
        }[];
        status: number;
    }>;
    paginate(options?: RequestInit & DebugOption): Promise<{
        current: z.infer<z.ZodDiscriminatedUnion<[z.ZodObject<{
            success: z.ZodLiteral<true>;
            meta: z.ZodObject<{
                pagination: z.ZodObject<{
                    pages: z.ZodNumber;
                    page: z.ZodNumber;
                    limit: z.ZodUnion<readonly [z.ZodNumber, z.ZodLiteral<"all">]>;
                    total: z.ZodNumber;
                    prev: z.ZodNullable<z.ZodNumber>;
                    next: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>;
            }, z.core.$strip>;
            data: z.ZodArray<z.ZodObject<OutputShape, z.core.$strip>>;
        }, z.core.$strip>, z.ZodObject<{
            success: z.ZodLiteral<false>;
            errors: z.ZodArray<z.ZodObject<{
                type: z.ZodString;
                message: z.ZodString;
            }, z.core.$strip>>;
            status: z.ZodNumber;
        }, z.core.$strip>], "success">>;
        next: BrowseFetcher<Resource, Params, Fields, BaseShape, OutputShape, IncludeShape> | undefined;
    }>;
}

declare class ReadFetcher<const Resource extends APIResource = any, Fields extends Mask<OutputShape> = any, BaseShape extends ZodRawShape = any, OutputShape extends ZodRawShape = any, IncludeShape extends ZodRawShape = any> {
    protected resource: Resource;
    protected config: {
        schema: z.ZodObject<BaseShape>;
        output: z.ZodObject<OutputShape>;
        include: z.ZodObject<IncludeShape>;
    };
    private _params;
    protected httpClient: HTTPClient;
    protected _urlParams: Record<string, string>;
    protected _urlSearchParams: URLSearchParams | undefined;
    protected _pathnameIdentity: string | undefined;
    protected _includeFields: (keyof IncludeShape)[];
    constructor(resource: Resource, config: {
        schema: z.ZodObject<BaseShape>;
        output: z.ZodObject<OutputShape>;
        include: z.ZodObject<IncludeShape>;
    }, _params: {
        identity: GhostIdentityInput;
        include?: (keyof IncludeShape)[];
        fields?: Fields;
        formats?: string[];
    }, httpClient: HTTPClient);
    /**
     * Lets you choose output format for the content of Post and Pages resources
     * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
     * with the selected formats required.
     *
     * @param formats html, mobiledoc or plaintext
     * @returns A new Fetcher with the fixed output shape and the formats specified
     */
    formats<Formats extends Mask<Pick<OutputShape, ContentFormats>>>(formats: NoUnrecognizedKeys<Formats, OutputShape>): ReadFetcher<Resource, Fields, BaseShape, { [k in keyof OutputShape]: k extends keyof Formats | Exclude<keyof Formats, keyof Formats> ? z.ZodNonOptional<OutputShape[k]> : OutputShape[k]; }, IncludeShape>;
    /**
     * Let's you include special keys into the Ghost API Query to retrieve complimentary info
     * The available keys are defined by the Resource include schema, will not care about unknown keys.
     * Returns a new Fetcher with an Output shape modified with the include keys required.
     *
     * @param include Include specific keys from the include shape
     * @returns A new Fetcher with the fixed output shape and the formats specified
     */
    include<Includes extends Mask<IncludeShape>>(include: NoUnrecognizedKeys<Includes, IncludeShape>): ReadFetcher<Resource, Fields, BaseShape, { [k in keyof OutputShape]: k extends keyof Includes | Exclude<keyof Includes, keyof Includes> ? z.ZodNonOptional<OutputShape[k]> : OutputShape[k]; }, IncludeShape>;
    /**
     * Let's you strip the output to only the specified keys of your choice that are in the config Schema
     * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
     *
     * @param fields Any keys from the resource Schema
     * @returns A new Fetcher with the fixed output shape having only the selected Fields
     */
    fields<Fields extends Mask<OutputShape>>(fields: NoUnrecognizedKeys<Fields, OutputShape>): ReadFetcher<Resource, Fields_1, BaseShape, Pick<OutputShape, Extract<keyof OutputShape, keyof Fields | Exclude<keyof Fields, keyof Fields>>> extends infer T ? { [k in keyof T]: T[k]; } : never, IncludeShape>;
    getResource(): Resource;
    getParams(): {
        identity: GhostIdentityInput;
        include?: (keyof IncludeShape)[];
        fields?: Fields;
        formats?: string[];
    };
    getOutputFields(): string[];
    getIncludes(): (keyof IncludeShape)[];
    getFormats(): string[];
    private _buildUrlParams;
    fetch(options?: RequestInit & DebugOption): Promise<{
        success: true;
        data: z.core.$InferObjectOutput<OutputShape, {}>;
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
        }[];
        status: number;
    }>;
}

declare class BasicFetcher<const Resource extends APIResource = any, OutputShape extends ZodTypeAny = any> {
    protected resource: Resource;
    protected config: {
        output: OutputShape;
    };
    protected httpClient: HTTPClient;
    constructor(resource: Resource, config: {
        output: OutputShape;
    }, httpClient: HTTPClient);
    getResource(): Resource;
    fetch(options?: RequestInit & DebugOption): Promise<(({
        success: z.ZodLiteral<true>;
        data: OutputShape;
    } extends infer T_1 extends z.core.$ZodLooseShape ? { -readonly [k in keyof T_1 as {
        success: z.ZodLiteral<true>;
        data: OutputShape;
    }[k] extends {
        _zod: {
            optout: "optional";
        };
    } ? never : k]: T_1[k]["_zod"]["output"]; } : never) & ({
        success: z.ZodLiteral<true>;
        data: OutputShape;
    } extends infer T_2 extends z.core.$ZodLooseShape ? { -readonly [k_1 in keyof T_2 as {
        success: z.ZodLiteral<true>;
        data: OutputShape;
    }[k_1] extends {
        _zod: {
            optout: "optional";
        };
    } ? k_1 : never]?: T_2[k_1]["_zod"]["output"] | undefined; } : never) extends infer T ? { [K in keyof T]: T[K]; } : never) | {
        success: false;
        errors: {
            type: string;
            message: string;
        }[];
        status: number;
    }>;
}

type ExplicitObjectKeys<T> = {
    [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K];
};
declare class MutationFetcher<const Resource extends APIResource = any, OutputShape extends z4.$ZodType = any, ParamsShape extends z4.$ZodType = any, const HTTPVerb extends "POST" | "PUT" = "POST"> {
    protected resource: Resource;
    protected config: {
        output: OutputShape;
        paramsShape?: ParamsShape;
    };
    private _params;
    protected _options: {
        method: HTTPVerb;
        body: Record<string, unknown>;
    };
    protected httpClient: HTTPClient;
    protected _urlParams: Record<string, string>;
    protected _urlSearchParams: URLSearchParams | undefined;
    protected _pathnameIdentity: string | undefined;
    constructor(resource: Resource, config: {
        output: OutputShape;
        paramsShape?: ParamsShape;
    }, _params: ({
        id?: string;
    } & ExplicitObjectKeys<z4.output<ParamsShape>>) | undefined, _options: {
        method: HTTPVerb;
        body: Record<string, unknown>;
    }, httpClient: HTTPClient);
    getResource(): Resource;
    getParams(): ({
        id?: string;
    } & ExplicitObjectKeys<z.core.output<ParamsShape>>) | undefined;
    private _buildUrlParams;
    submit(options?: RequestInit & DebugOption): Promise<(({
        success: z.ZodLiteral<true>;
        data: OutputShape;
    } extends infer T_1 extends z.core.$ZodLooseShape ? { -readonly [k in keyof T_1 as {
        success: z.ZodLiteral<true>;
        data: OutputShape;
    }[k] extends {
        _zod: {
            optout: "optional";
        };
    } ? never : k]: T_1[k]["_zod"]["output"]; } : never) & ({
        success: z.ZodLiteral<true>;
        data: OutputShape;
    } extends infer T_2 extends z.core.$ZodLooseShape ? { -readonly [k_1 in keyof T_2 as {
        success: z.ZodLiteral<true>;
        data: OutputShape;
    }[k_1] extends {
        _zod: {
            optout: "optional";
        };
    } ? k_1 : never]?: T_2[k_1]["_zod"]["output"] | undefined; } : never) extends infer T ? { [K in keyof T]: T[K]; } : never) | {
        success: false;
        errors: {
            type: string;
            message: string;
            context?: string | null | undefined;
        }[];
        status: number;
    }>;
}

declare class DeleteFetcher<const Resource extends APIResource = any> {
    protected resource: Resource;
    private _params;
    protected httpClient: HTTPClient;
    protected _pathnameIdentity: string | undefined;
    constructor(resource: Resource, _params: {
        id: string;
    }, httpClient: HTTPClient);
    getResource(): Resource;
    getParams(): {
        id: string;
    };
    private _buildPathnameIdentity;
    submit(options?: RequestInit & DebugOption): Promise<{
        success: true;
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
            context?: string | null | undefined;
        }[];
        status: number;
    }>;
}

/**
 * API Composer contains all methods, pick and choose.
 */
declare class APIComposer<const Resource extends APIResource = any, Shape extends ZodRawShape = any, IdentityShape extends z4.$ZodType<{
    slug?: string;
    id?: string;
    email?: string;
}> = any, IncludeShape extends ZodRawShape = any, CreateSchema extends z4.$ZodType = any, CreateOptions extends z4.$ZodType = any, UpdateSchema extends z4.$ZodObject = any, UpdateOptions extends z4.$ZodObject = any> {
    protected resource: Resource;
    protected config: {
        schema: z.ZodObject<Shape>;
        identitySchema: IdentityShape;
        include: z.ZodObject<IncludeShape>;
        createSchema?: CreateSchema;
        createOptionsSchema?: CreateOptions;
        updateSchema?: UpdateSchema;
        updateOptionsSchema?: UpdateOptions;
    };
    protected httpClientFactory: HTTPClientFactory;
    constructor(resource: Resource, config: {
        schema: z.ZodObject<Shape>;
        identitySchema: IdentityShape;
        include: z.ZodObject<IncludeShape>;
        createSchema?: CreateSchema;
        createOptionsSchema?: CreateOptions;
        updateSchema?: UpdateSchema;
        updateOptionsSchema?: UpdateOptions;
    }, httpClientFactory: HTTPClientFactory);
    /**
     * Browse function that accepts browse params order, filter, page and limit. Will return an instance
     * of BrowseFetcher class.
     */
    browse<const OrderStr extends string, const FilterStr extends string, const P extends {
        order?: OrderStr;
        limit?: number | "all";
        page?: number | string;
        filter?: FilterStr;
    }>(options?: BrowseParams<P, Shape & IncludeShape>): BrowseFetcher<Resource, {
        limit?: number | "all" | undefined;
        page?: number | undefined;
        order?: string | undefined;
        filter?: string | undefined;
    }, any, Shape, Shape, IncludeShape>;
    /**
     * Read function that accepts Identify fields like id, slug or email. Will return an instance
     * of ReadFetcher class.
     */
    read(options: z4.infer<IdentityShape>): ReadFetcher<Resource, any, Shape, Shape, IncludeShape>;
    add(data: z4.input<CreateSchema>, options?: z4.infer<CreateOptions>): Promise<{
        success: true;
        data: z.core.$InferObjectOutput<Shape, {}>;
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
            context?: string | null | undefined;
        }[];
        status: number;
    }>;
    edit(id: string, data: IsAny<UpdateSchema> extends true ? Partial<z4.input<CreateSchema>> : z4.input<UpdateSchema>, options?: z4.infer<UpdateOptions>): Promise<{
        success: true;
        data: z.core.$InferObjectOutput<Shape, {}>;
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
            context?: string | null | undefined;
        }[];
        status: number;
    }>;
    delete(id: string): Promise<{
        success: true;
    } | {
        success: false;
        errors: {
            type: string;
            message: string;
            context?: string | null | undefined;
        }[];
        status: number;
    }>;
    access<const Keys extends keyof this>(keys: Keys[]): Pick<this, Keys>;
}

/**
 * Parse a Fields object and generate a new Output Schema
 *
 * @param schema Base Resource Schema
 * @param fields Object containing fields to be picked with true as value
 * @returns new schema with only the fields specified in the fields object
 */
declare const schemaWithPickedFields: <Shape extends z.ZodRawShape, Fields extends Mask<Shape>>(schema: z.ZodObject<Shape>, fields?: Fields) => z.ZodObject<Pick<Shape, Extract<keyof Shape, keyof Fields | Exclude<keyof Fields, keyof Fields>>> extends infer T ? { [k in keyof T]: T[k]; } : never, z.core.$strip>;

export { APIComposer, type APICredentials, type APIEndpoint, type APIResource, type APIVersions, type AdminAPICredentials, BasicFetcher, BrowseFetcher, type BrowseFilter, type BrowseOrder, type BrowseParams, type BrowseParamsSchema, type ContentAPICredentials, type DebugOption, DeleteFetcher, type Exactly, type FetchWithStatusResult, type FieldOrSubField, type FilterQueryOperators, type FilterQuerySeparator, type FilterQuerySetOperators, type GhostIdentity, type GhostIdentityInput, type GhostMeta, type GhostRequestConfig, HTTPClient, HTTPClientFactory, type HTTPClientOptions, type IHTTPClient, type IHTTPClientFactory, type InferFetcherDataShape, type InferResponseDataShape, type IsAny, type Mask, MutationFetcher, type NoUnrecognizedKeys, type OrderPredicate, ReadFetcher, type TAPIVersion, adminAPICredentialsSchema, apiVersionsSchema, baseAuthorsSchema, baseEmailSchema, baseMembersSchema, baseNewsletterSchema, baseOffersSchema, basePagesSchema, basePostsSchema, baseSettingsSchema, baseSiteSchema, baseTagsSchema, baseTiersSchema, browseParamsSchema, contentAPICredentialsSchema, emailOrIdSchema, ghostCodeInjectionSchema, ghostExcerptSchema, ghostFacebookSchema, ghostIdentityInputSchema, ghostIdentitySchema, ghostMetaSchema, ghostMetadataSchema, ghostSocialMediaSchema, ghostTwitterSchema, ghostVisibilitySchema, identitySchema, parseBrowseParams, resolveDebugLogger, schemaWithPickedFields, slugOrIdSchema };
