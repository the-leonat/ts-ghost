import * as zod_v4_core from 'zod/v4/core';
import * as zod from 'zod';
import { z } from 'zod';
import { DebugOption, APIComposer, BasicFetcher } from '@ts-ghost/core-api';
export { APIVersions, BrowseFetcher, BrowseParams, ContentAPICredentials, InferFetcherDataShape, InferResponseDataShape, ReadFetcher } from '@ts-ghost/core-api';

declare enum BrowseEndpointType {
    authors = "authors",
    tiers = "tiers",
    posts = "posts",
    pages = "pages",
    tags = "tags",
    settings = "settings"
}
declare class TSGhostContentAPI<Version extends `v5.${string}` | `v6.${string}` = any> {
    protected readonly url: string;
    protected readonly key: string;
    protected readonly version: Version;
    protected readonly options?: DebugOption | undefined;
    private HTTPClientFactoryFactory;
    constructor(url: string, key: string, version: Version, options?: DebugOption | undefined);
    get authors(): Pick<APIComposer<"authors", {
        name: zod.ZodString;
        profile_image: zod.ZodNullable<zod.ZodString>;
        cover_image: zod.ZodNullable<zod.ZodString>;
        bio: zod.ZodNullable<zod.ZodString>;
        website: zod.ZodNullable<zod.ZodString>;
        location: zod.ZodNullable<zod.ZodString>;
        facebook: zod.ZodNullable<zod.ZodString>;
        twitter: zod.ZodNullable<zod.ZodString>;
        count: zod.ZodOptional<zod.ZodObject<{
            posts: zod.ZodNumber;
        }, zod_v4_core.$strip>>;
        url: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        meta_title: zod.ZodNullable<zod.ZodString>;
        meta_description: zod.ZodNullable<zod.ZodString>;
        slug: zod.ZodString;
        id: zod.ZodString;
    }, zod.ZodUnion<readonly [zod.ZodObject<{
        slug: zod.ZodString;
    }, zod_v4_core.$strip>, zod.ZodObject<{
        id: zod.ZodString;
    }, zod_v4_core.$strip>]>, {
        "count.posts": zod.ZodOptional<zod.ZodLiteral<true>>;
    }, any, any, any, any>, "browse" | "read">;
    get tiers(): Pick<APIComposer<"tiers", {
        name: zod.ZodString;
        description: zod.ZodNullable<zod.ZodString>;
        active: zod.ZodBoolean;
        type: zod.ZodUnion<readonly [zod.ZodLiteral<"free">, zod.ZodLiteral<"paid">]>;
        welcome_page_url: zod.ZodNullable<zod.ZodString>;
        created_at: zod.ZodString;
        updated_at: zod.ZodNullable<zod.ZodString>;
        stripe_prices: zod.ZodPipe<zod.ZodOptional<zod.ZodArray<zod.ZodNumber>>, zod.ZodTransform<number[], number[] | undefined>>;
        monthly_price: zod.ZodPipe<zod.ZodOptional<zod.ZodNullable<zod.ZodNumber>>, zod.ZodTransform<number | null, number | null | undefined>>;
        yearly_price: zod.ZodPipe<zod.ZodOptional<zod.ZodNullable<zod.ZodNumber>>, zod.ZodTransform<number | null, number | null | undefined>>;
        benefits: zod.ZodArray<zod.ZodString>;
        visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
        currency: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        trial_days: zod.ZodDefault<zod.ZodNumber>;
        slug: zod.ZodString;
        id: zod.ZodString;
    }, zod.ZodUnion<readonly [zod.ZodObject<{
        slug: zod.ZodString;
    }, zod_v4_core.$strip>, zod.ZodObject<{
        id: zod.ZodString;
    }, zod_v4_core.$strip>]>, {
        monthly_price: zod.ZodOptional<zod.ZodLiteral<true>>;
        yearly_price: zod.ZodOptional<zod.ZodLiteral<true>>;
        benefits: zod.ZodOptional<zod.ZodLiteral<true>>;
    }, any, any, any, any>, "browse" | "read">;
    get posts(): Pick<APIComposer<"posts", {
        visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
        custom_template: zod.ZodNullable<zod.ZodString>;
        canonical_url: zod.ZodNullable<zod.ZodString>;
        authors: zod.ZodOptional<zod.ZodArray<zod.ZodObject<{
            name: zod.ZodString;
            profile_image: zod.ZodNullable<zod.ZodString>;
            cover_image: zod.ZodNullable<zod.ZodString>;
            bio: zod.ZodNullable<zod.ZodString>;
            website: zod.ZodNullable<zod.ZodString>;
            location: zod.ZodNullable<zod.ZodString>;
            facebook: zod.ZodNullable<zod.ZodString>;
            twitter: zod.ZodNullable<zod.ZodString>;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
            url: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod_v4_core.$strip>>>;
        tags: zod.ZodOptional<zod.ZodArray<zod.ZodObject<{
            name: zod.ZodString;
            description: zod.ZodNullable<zod.ZodString>;
            feature_image: zod.ZodNullable<zod.ZodString>;
            visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
            canonical_url: zod.ZodNullable<zod.ZodString>;
            accent_color: zod.ZodNullable<zod.ZodString>;
            url: zod.ZodString;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            twitter_image: zod.ZodNullable<zod.ZodString>;
            twitter_title: zod.ZodNullable<zod.ZodString>;
            twitter_description: zod.ZodNullable<zod.ZodString>;
            og_image: zod.ZodNullable<zod.ZodString>;
            og_title: zod.ZodNullable<zod.ZodString>;
            og_description: zod.ZodNullable<zod.ZodString>;
            codeinjection_head: zod.ZodNullable<zod.ZodString>;
            codeinjection_foot: zod.ZodNullable<zod.ZodString>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
        }, zod_v4_core.$strip>>>;
        primary_author: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            name: zod.ZodString;
            profile_image: zod.ZodNullable<zod.ZodString>;
            cover_image: zod.ZodNullable<zod.ZodString>;
            bio: zod.ZodNullable<zod.ZodString>;
            website: zod.ZodNullable<zod.ZodString>;
            location: zod.ZodNullable<zod.ZodString>;
            facebook: zod.ZodNullable<zod.ZodString>;
            twitter: zod.ZodNullable<zod.ZodString>;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
            url: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod_v4_core.$strip>>>;
        primary_tag: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            name: zod.ZodString;
            description: zod.ZodNullable<zod.ZodString>;
            feature_image: zod.ZodNullable<zod.ZodString>;
            visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
            canonical_url: zod.ZodNullable<zod.ZodString>;
            accent_color: zod.ZodNullable<zod.ZodString>;
            url: zod.ZodString;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            twitter_image: zod.ZodNullable<zod.ZodString>;
            twitter_title: zod.ZodNullable<zod.ZodString>;
            twitter_description: zod.ZodNullable<zod.ZodString>;
            og_image: zod.ZodNullable<zod.ZodString>;
            og_title: zod.ZodNullable<zod.ZodString>;
            og_description: zod.ZodNullable<zod.ZodString>;
            codeinjection_head: zod.ZodNullable<zod.ZodString>;
            codeinjection_foot: zod.ZodNullable<zod.ZodString>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
        }, zod_v4_core.$strip>>>;
        url: zod.ZodString;
        excerpt: zod.ZodCatch<zod.ZodString>;
        reading_time: zod.ZodDefault<zod.ZodOptional<zod.ZodNumber>>;
        created_at: zod.ZodString;
        updated_at: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        published_at: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        access: zod.ZodBoolean;
        comments: zod.ZodBoolean;
        email_subject: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        twitter_image: zod.ZodNullable<zod.ZodString>;
        twitter_title: zod.ZodNullable<zod.ZodString>;
        twitter_description: zod.ZodNullable<zod.ZodString>;
        og_image: zod.ZodNullable<zod.ZodString>;
        og_title: zod.ZodNullable<zod.ZodString>;
        og_description: zod.ZodNullable<zod.ZodString>;
        codeinjection_head: zod.ZodNullable<zod.ZodString>;
        codeinjection_foot: zod.ZodNullable<zod.ZodString>;
        title: zod.ZodString;
        html: zod.ZodCatch<zod.ZodString>;
        plaintext: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        comment_id: zod.ZodNullable<zod.ZodString>;
        feature_image: zod.ZodNullable<zod.ZodString>;
        feature_image_alt: zod.ZodNullable<zod.ZodString>;
        feature_image_caption: zod.ZodNullable<zod.ZodString>;
        featured: zod.ZodBoolean;
        custom_excerpt: zod.ZodNullable<zod.ZodString>;
        meta_title: zod.ZodNullable<zod.ZodString>;
        meta_description: zod.ZodNullable<zod.ZodString>;
        slug: zod.ZodString;
        id: zod.ZodString;
    }, zod.ZodUnion<readonly [zod.ZodObject<{
        slug: zod.ZodString;
    }, zod_v4_core.$strip>, zod.ZodObject<{
        id: zod.ZodString;
    }, zod_v4_core.$strip>]>, {
        authors: zod.ZodOptional<zod.ZodLiteral<true>>;
        tags: zod.ZodOptional<zod.ZodLiteral<true>>;
    }, any, any, any, any>, "browse" | "read">;
    get pages(): Pick<APIComposer<"pages", {
        visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
        custom_template: zod.ZodNullable<zod.ZodString>;
        canonical_url: zod.ZodNullable<zod.ZodString>;
        authors: zod.ZodOptional<zod.ZodArray<zod.ZodObject<{
            name: zod.ZodString;
            profile_image: zod.ZodNullable<zod.ZodString>;
            cover_image: zod.ZodNullable<zod.ZodString>;
            bio: zod.ZodNullable<zod.ZodString>;
            website: zod.ZodNullable<zod.ZodString>;
            location: zod.ZodNullable<zod.ZodString>;
            facebook: zod.ZodNullable<zod.ZodString>;
            twitter: zod.ZodNullable<zod.ZodString>;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
            url: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod_v4_core.$strip>>>;
        tags: zod.ZodOptional<zod.ZodArray<zod.ZodObject<{
            name: zod.ZodString;
            description: zod.ZodNullable<zod.ZodString>;
            feature_image: zod.ZodNullable<zod.ZodString>;
            visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
            canonical_url: zod.ZodNullable<zod.ZodString>;
            accent_color: zod.ZodNullable<zod.ZodString>;
            url: zod.ZodString;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            twitter_image: zod.ZodNullable<zod.ZodString>;
            twitter_title: zod.ZodNullable<zod.ZodString>;
            twitter_description: zod.ZodNullable<zod.ZodString>;
            og_image: zod.ZodNullable<zod.ZodString>;
            og_title: zod.ZodNullable<zod.ZodString>;
            og_description: zod.ZodNullable<zod.ZodString>;
            codeinjection_head: zod.ZodNullable<zod.ZodString>;
            codeinjection_foot: zod.ZodNullable<zod.ZodString>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
        }, zod_v4_core.$strip>>>;
        primary_author: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            name: zod.ZodString;
            profile_image: zod.ZodNullable<zod.ZodString>;
            cover_image: zod.ZodNullable<zod.ZodString>;
            bio: zod.ZodNullable<zod.ZodString>;
            website: zod.ZodNullable<zod.ZodString>;
            location: zod.ZodNullable<zod.ZodString>;
            facebook: zod.ZodNullable<zod.ZodString>;
            twitter: zod.ZodNullable<zod.ZodString>;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
            url: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        }, zod_v4_core.$strip>>>;
        primary_tag: zod.ZodOptional<zod.ZodNullable<zod.ZodObject<{
            name: zod.ZodString;
            description: zod.ZodNullable<zod.ZodString>;
            feature_image: zod.ZodNullable<zod.ZodString>;
            visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
            canonical_url: zod.ZodNullable<zod.ZodString>;
            accent_color: zod.ZodNullable<zod.ZodString>;
            url: zod.ZodString;
            count: zod.ZodOptional<zod.ZodObject<{
                posts: zod.ZodNumber;
            }, zod_v4_core.$strip>>;
            twitter_image: zod.ZodNullable<zod.ZodString>;
            twitter_title: zod.ZodNullable<zod.ZodString>;
            twitter_description: zod.ZodNullable<zod.ZodString>;
            og_image: zod.ZodNullable<zod.ZodString>;
            og_title: zod.ZodNullable<zod.ZodString>;
            og_description: zod.ZodNullable<zod.ZodString>;
            codeinjection_head: zod.ZodNullable<zod.ZodString>;
            codeinjection_foot: zod.ZodNullable<zod.ZodString>;
            meta_title: zod.ZodNullable<zod.ZodString>;
            meta_description: zod.ZodNullable<zod.ZodString>;
            slug: zod.ZodString;
            id: zod.ZodString;
        }, zod_v4_core.$strip>>>;
        url: zod.ZodString;
        excerpt: zod.ZodCatch<zod.ZodString>;
        reading_time: zod.ZodDefault<zod.ZodOptional<zod.ZodNumber>>;
        created_at: zod.ZodString;
        updated_at: zod.ZodString;
        published_at: zod.ZodString;
        access: zod.ZodBoolean;
        comments: zod.ZodBoolean;
        email_subject: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        twitter_image: zod.ZodNullable<zod.ZodString>;
        twitter_title: zod.ZodNullable<zod.ZodString>;
        twitter_description: zod.ZodNullable<zod.ZodString>;
        og_image: zod.ZodNullable<zod.ZodString>;
        og_title: zod.ZodNullable<zod.ZodString>;
        og_description: zod.ZodNullable<zod.ZodString>;
        codeinjection_head: zod.ZodNullable<zod.ZodString>;
        codeinjection_foot: zod.ZodNullable<zod.ZodString>;
        title: zod.ZodString;
        html: zod.ZodCatch<zod.ZodString>;
        plaintext: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
        comment_id: zod.ZodNullable<zod.ZodString>;
        feature_image: zod.ZodNullable<zod.ZodString>;
        feature_image_alt: zod.ZodNullable<zod.ZodString>;
        feature_image_caption: zod.ZodNullable<zod.ZodString>;
        featured: zod.ZodBoolean;
        custom_excerpt: zod.ZodNullable<zod.ZodString>;
        meta_title: zod.ZodNullable<zod.ZodString>;
        meta_description: zod.ZodNullable<zod.ZodString>;
        slug: zod.ZodString;
        id: zod.ZodString;
    }, zod.ZodUnion<readonly [zod.ZodObject<{
        slug: zod.ZodString;
    }, zod_v4_core.$strip>, zod.ZodObject<{
        id: zod.ZodString;
    }, zod_v4_core.$strip>]>, {
        authors: zod.ZodOptional<zod.ZodLiteral<true>>;
        tags: zod.ZodOptional<zod.ZodLiteral<true>>;
    }, any, any, any, any>, "browse" | "read">;
    get tags(): Pick<APIComposer<"tags", {
        name: zod.ZodString;
        description: zod.ZodNullable<zod.ZodString>;
        feature_image: zod.ZodNullable<zod.ZodString>;
        visibility: zod.ZodUnion<readonly [zod.ZodLiteral<"public">, zod.ZodLiteral<"members">, zod.ZodLiteral<"none">, zod.ZodLiteral<"internal">, zod.ZodLiteral<"paid">, zod.ZodLiteral<"tiers">]>;
        canonical_url: zod.ZodNullable<zod.ZodString>;
        accent_color: zod.ZodNullable<zod.ZodString>;
        url: zod.ZodString;
        count: zod.ZodOptional<zod.ZodObject<{
            posts: zod.ZodNumber;
        }, zod_v4_core.$strip>>;
        twitter_image: zod.ZodNullable<zod.ZodString>;
        twitter_title: zod.ZodNullable<zod.ZodString>;
        twitter_description: zod.ZodNullable<zod.ZodString>;
        og_image: zod.ZodNullable<zod.ZodString>;
        og_title: zod.ZodNullable<zod.ZodString>;
        og_description: zod.ZodNullable<zod.ZodString>;
        codeinjection_head: zod.ZodNullable<zod.ZodString>;
        codeinjection_foot: zod.ZodNullable<zod.ZodString>;
        meta_title: zod.ZodNullable<zod.ZodString>;
        meta_description: zod.ZodNullable<zod.ZodString>;
        slug: zod.ZodString;
        id: zod.ZodString;
    }, zod.ZodUnion<readonly [zod.ZodObject<{
        slug: zod.ZodString;
    }, zod_v4_core.$strip>, zod.ZodObject<{
        id: zod.ZodString;
    }, zod_v4_core.$strip>]>, {
        "count.posts": zod.ZodOptional<zod.ZodLiteral<true>>;
    }, any, any, any, any>, "browse" | "read">;
    get settings(): BasicFetcher<"settings", zod.ZodObject<{
        title: zod.ZodString;
        description: zod.ZodString;
        logo: zod.ZodNullable<zod.ZodString>;
        icon: zod.ZodNullable<zod.ZodString>;
        accent_color: zod.ZodNullable<zod.ZodString>;
        cover_image: zod.ZodNullable<zod.ZodString>;
        facebook: zod.ZodNullable<zod.ZodString>;
        twitter: zod.ZodNullable<zod.ZodString>;
        lang: zod.ZodString;
        timezone: zod.ZodString;
        codeinjection_head: zod.ZodNullable<zod.ZodString>;
        codeinjection_foot: zod.ZodNullable<zod.ZodString>;
        navigation: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            url: zod.ZodString;
        }, zod_v4_core.$strip>>;
        secondary_navigation: zod.ZodArray<zod.ZodObject<{
            label: zod.ZodString;
            url: zod.ZodString;
        }, zod_v4_core.$strip>>;
        meta_title: zod.ZodNullable<zod.ZodString>;
        meta_description: zod.ZodNullable<zod.ZodString>;
        og_image: zod.ZodNullable<zod.ZodString>;
        og_title: zod.ZodNullable<zod.ZodString>;
        og_description: zod.ZodNullable<zod.ZodString>;
        twitter_image: zod.ZodNullable<zod.ZodString>;
        twitter_title: zod.ZodNullable<zod.ZodString>;
        twitter_description: zod.ZodNullable<zod.ZodString>;
        members_support_address: zod.ZodString;
        url: zod.ZodString;
    }, zod_v4_core.$strip>>;
}

declare const authorsSchema: z.ZodObject<{
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
type Author = z.infer<typeof authorsSchema>;
declare const ghostFetchAuthorsSchema: z.ZodObject<{
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
    authors: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strip>>;
}, z.core.$strip>;
declare const authorsIncludeSchema: z.ZodObject<{
    "count.posts": z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;

declare const pagesSchema: z.ZodObject<{
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
    excerpt: z.ZodCatch<z.ZodString>;
    reading_time: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    published_at: z.ZodString;
    access: z.ZodBoolean;
    comments: z.ZodBoolean;
    email_subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    html: z.ZodCatch<z.ZodString>;
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
type Page = z.infer<typeof pagesSchema>;
declare const pagesIncludeSchema: z.ZodObject<{
    authors: z.ZodOptional<z.ZodLiteral<true>>;
    tags: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
type PagesIncludeSchema = z.infer<typeof pagesIncludeSchema>;

declare const postsSchema: z.ZodObject<{
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
    excerpt: z.ZodCatch<z.ZodString>;
    reading_time: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    published_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    access: z.ZodBoolean;
    comments: z.ZodBoolean;
    email_subject: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    twitter_image: z.ZodNullable<z.ZodString>;
    twitter_title: z.ZodNullable<z.ZodString>;
    twitter_description: z.ZodNullable<z.ZodString>;
    og_image: z.ZodNullable<z.ZodString>;
    og_title: z.ZodNullable<z.ZodString>;
    og_description: z.ZodNullable<z.ZodString>;
    codeinjection_head: z.ZodNullable<z.ZodString>;
    codeinjection_foot: z.ZodNullable<z.ZodString>;
    title: z.ZodString;
    html: z.ZodCatch<z.ZodString>;
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
type Post = z.infer<typeof postsSchema>;
declare const postsIncludeSchema: z.ZodObject<{
    authors: z.ZodOptional<z.ZodLiteral<true>>;
    tags: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
type PostsIncludeSchema = z.infer<typeof postsIncludeSchema>;

declare const tagsSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    feature_image: z.ZodNullable<z.ZodString>;
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    canonical_url: z.ZodNullable<z.ZodString>;
    accent_color: z.ZodNullable<z.ZodString>;
    url: z.ZodString;
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
type Tag = z.infer<typeof tagsSchema>;
declare const tagsIncludeSchema: z.ZodObject<{
    "count.posts": z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;

declare const tiersSchema: z.ZodObject<{
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
    benefits: z.ZodArray<z.ZodString>;
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    trial_days: z.ZodDefault<z.ZodNumber>;
    slug: z.ZodString;
    id: z.ZodString;
}, z.core.$strip>;
type Tier = z.infer<typeof tiersSchema>;
declare const tiersIncludeSchema: z.ZodObject<{
    monthly_price: z.ZodOptional<z.ZodLiteral<true>>;
    yearly_price: z.ZodOptional<z.ZodLiteral<true>>;
    benefits: z.ZodOptional<z.ZodLiteral<true>>;
}, z.core.$strip>;
type TiersIncludeSchema = z.infer<typeof tiersIncludeSchema>;

declare const settingsSchema: z.ZodObject<{
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
type Settings = z.infer<typeof settingsSchema>;

declare const twitter: (username: string) => string;
declare const facebook: (username: string) => string;

export { type Author, type AuthorsIncludeSchema, BrowseEndpointType, type Page, type PagesIncludeSchema, type Post, type PostsIncludeSchema, type Settings, TSGhostContentAPI, type Tag, type TagsIncludeSchema, type Tier, type TiersIncludeSchema, authorsIncludeSchema, authorsSchema, facebook, ghostFetchAuthorsSchema, pagesIncludeSchema, pagesSchema, postsIncludeSchema, postsSchema, settingsSchema, tagsIncludeSchema, tagsSchema, tiersIncludeSchema, tiersSchema, twitter };
