import { z } from 'zod';
import { DebugOption, APIComposer, BasicFetcher } from '@ts-ghost/core-api';
export { APIVersions, AdminAPICredentials, InferFetcherDataShape, InferResponseDataShape } from '@ts-ghost/core-api';

declare class TSGhostAdminAPI<Version extends `v5.${string}` | `v6.${string}` = any> {
    protected readonly url: string;
    protected readonly key: string;
    protected readonly version: Version;
    protected readonly options?: DebugOption | undefined;
    private httpClientFactory;
    constructor(url: string, key: string, version: Version, options?: DebugOption | undefined);
    get posts(): Pick<APIComposer<"posts", {
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        custom_template: z.ZodNullable<z.ZodString>;
        canonical_url: z.ZodNullable<z.ZodString>;
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
        uuid: z.ZodString;
        mobiledoc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email_only: z.ZodBoolean;
        status: z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">]>;
        email_segment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        frontmatter: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
            monthly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            yearly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodObject<{
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
        }, z.core.$strip>>>;
        newsletter: z.ZodOptional<z.ZodNullable<z.ZodObject<{
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
        }, z.core.$strip>>>;
        count: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            clicks: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            positive_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            negative_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strip>>>;
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
            accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            comment_notifications: z.ZodBoolean;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            free_member_signup_notification: z.ZodBoolean;
            last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mention_notifications: z.ZodOptional<z.ZodBoolean>;
            milestone_notifications: z.ZodOptional<z.ZodBoolean>;
            paid_subscription_canceled_notification: z.ZodBoolean;
            paid_subscription_started_notification: z.ZodBoolean;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
            roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        primary_author: z.ZodObject<{
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
            accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            comment_notifications: z.ZodBoolean;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            free_member_signup_notification: z.ZodBoolean;
            last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mention_notifications: z.ZodOptional<z.ZodBoolean>;
            milestone_notifications: z.ZodOptional<z.ZodBoolean>;
            paid_subscription_canceled_notification: z.ZodBoolean;
            paid_subscription_started_notification: z.ZodBoolean;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
            roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        lexical: z.ZodOptional<z.ZodCatch<z.ZodString>>;
        html: z.ZodOptional<z.ZodCatch<z.ZodString>>;
        plaintext: z.ZodOptional<z.ZodCatch<z.ZodString>>;
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {
        authors: z.ZodOptional<z.ZodLiteral<true>>;
        tags: z.ZodOptional<z.ZodLiteral<true>>;
        tiers: z.ZodOptional<z.ZodLiteral<true>>;
    }, z.ZodObject<{
        title: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        mobiledoc: z.ZodOptional<z.ZodString>;
        lexical: z.ZodOptional<z.ZodString>;
        html: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodString>;
        feature_image_alt: z.ZodOptional<z.ZodString>;
        feature_image_caption: z.ZodOptional<z.ZodString>;
        featured: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">, z.ZodLiteral<"sent">]>>;
        locale: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
        visibility_filter: z.ZodOptional<z.ZodString>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        custom_excerpt: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        email_subject: z.ZodOptional<z.ZodString>;
        custom_template: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        email_only: z.ZodOptional<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            email: z.ZodString;
        }, z.core.$strip>]>>>;
        newsletter: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodOptional<z.ZodLiteral<"html">>;
    }, z.core.$strip>, z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        mobiledoc: z.ZodOptional<z.ZodString>;
        lexical: z.ZodOptional<z.ZodString>;
        html: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodString>;
        feature_image_alt: z.ZodOptional<z.ZodString>;
        feature_image_caption: z.ZodOptional<z.ZodString>;
        featured: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">, z.ZodLiteral<"sent">]>>;
        locale: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
        visibility_filter: z.ZodOptional<z.ZodString>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        custom_excerpt: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        email_subject: z.ZodOptional<z.ZodString>;
        custom_template: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        email_only: z.ZodOptional<z.ZodBoolean>;
        tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            email: z.ZodString;
        }, z.core.$strip>]>>>;
        newsletter: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>;
        updated_at: z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>;
    }, z.core.$strip>, z.ZodObject<{
        newsletter: z.ZodOptional<z.ZodString>;
        email_segment: z.ZodOptional<z.ZodString>;
        force_rerender: z.ZodOptional<z.ZodBoolean>;
        save_revision: z.ZodOptional<z.ZodBoolean>;
        convert_to_lexical: z.ZodOptional<z.ZodBoolean>;
        source: z.ZodOptional<z.ZodLiteral<"html">>;
    }, z.core.$strip>>, "browse" | "read" | "add" | "edit" | "delete">;
    get pages(): Pick<APIComposer<"pages", {
        visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
        custom_template: z.ZodNullable<z.ZodString>;
        canonical_url: z.ZodNullable<z.ZodString>;
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
        uuid: z.ZodString;
        mobiledoc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">]>;
        frontmatter: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tiers: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{
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
            monthly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            yearly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>>;
        count: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            clicks: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            positive_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            negative_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            paid_conversions: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            signups: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, z.core.$strip>>>;
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
            accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            comment_notifications: z.ZodBoolean;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            free_member_signup_notification: z.ZodBoolean;
            last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mention_notifications: z.ZodOptional<z.ZodBoolean>;
            milestone_notifications: z.ZodOptional<z.ZodBoolean>;
            paid_subscription_canceled_notification: z.ZodBoolean;
            paid_subscription_started_notification: z.ZodBoolean;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
            roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>>;
        primary_author: z.ZodObject<{
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
            accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            comment_notifications: z.ZodBoolean;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            free_member_signup_notification: z.ZodBoolean;
            last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            mention_notifications: z.ZodOptional<z.ZodBoolean>;
            milestone_notifications: z.ZodOptional<z.ZodBoolean>;
            paid_subscription_canceled_notification: z.ZodBoolean;
            paid_subscription_started_notification: z.ZodBoolean;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
            roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodString;
                created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>>;
        }, z.core.$strip>;
        lexical: z.ZodOptional<z.ZodCatch<z.ZodString>>;
        html: z.ZodOptional<z.ZodCatch<z.ZodString>>;
        plaintext: z.ZodOptional<z.ZodCatch<z.ZodString>>;
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {
        authors: z.ZodOptional<z.ZodLiteral<true>>;
        tags: z.ZodOptional<z.ZodLiteral<true>>;
        tiers: z.ZodOptional<z.ZodLiteral<true>>;
    }, z.ZodObject<{
        title: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        mobiledoc: z.ZodOptional<z.ZodString>;
        lexical: z.ZodOptional<z.ZodString>;
        html: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodString>;
        feature_image_alt: z.ZodOptional<z.ZodString>;
        feature_image_caption: z.ZodOptional<z.ZodString>;
        featured: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">]>>;
        locale: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
        visibility_filter: z.ZodOptional<z.ZodString>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        updated_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        custom_excerpt: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        custom_template: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            email: z.ZodString;
        }, z.core.$strip>]>>>;
    }, z.core.$strip>, z.ZodObject<{
        source: z.ZodOptional<z.ZodLiteral<"html">>;
    }, z.core.$strip>, z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        slug: z.ZodOptional<z.ZodString>;
        mobiledoc: z.ZodOptional<z.ZodString>;
        lexical: z.ZodOptional<z.ZodString>;
        html: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodString>;
        feature_image_alt: z.ZodOptional<z.ZodString>;
        feature_image_caption: z.ZodOptional<z.ZodString>;
        featured: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">]>>;
        locale: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
        visibility_filter: z.ZodOptional<z.ZodString>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
        custom_excerpt: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        custom_template: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            email: z.ZodString;
        }, z.core.$strip>]>>>;
        updated_at: z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>;
    }, z.core.$strip>, z.ZodObject<{
        force_rerender: z.ZodOptional<z.ZodBoolean>;
        save_revision: z.ZodOptional<z.ZodBoolean>;
        convert_to_lexical: z.ZodOptional<z.ZodBoolean>;
        source: z.ZodOptional<z.ZodLiteral<"html">>;
    }, z.core.$strip>>, "browse" | "read" | "add" | "edit" | "delete">;
    get members(): Pick<APIComposer<"members", {
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
        subscribed: z.ZodBoolean;
        comped: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        email_suppression: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            suppressed: z.ZodBoolean;
            info: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
        newsletters: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
        }, z.core.$strip>>;
    }, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, {}, z.ZodObject<{
        email: z.ZodEmail;
        name: z.ZodOptional<z.ZodString>;
        note: z.ZodOptional<z.ZodString>;
        geolocation: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        products: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            slug: z.ZodString;
        }, z.core.$strip>]>>>;
        newsletters: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>, z.ZodObject<{
            name: z.ZodString;
        }, z.core.$strip>]>>>;
        subscribed: z.ZodOptional<z.ZodBoolean>;
        comped: z.ZodOptional<z.ZodBoolean>;
        stripe_customer_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        send_email: z.ZodOptional<z.ZodBoolean>;
        email_type: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"signin">, z.ZodLiteral<"subscribe">, z.ZodLiteral<"signup">]>>;
    }, z.core.$strip>, any, z.ZodObject<{
        send_email: z.ZodOptional<z.ZodBoolean>;
        email_type: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"signin">, z.ZodLiteral<"subscribe">, z.ZodLiteral<"signup">]>>;
    }, z.core.$strip>>, "browse" | "read" | "add" | "edit" | "delete">;
    get tiers(): Pick<APIComposer<"tiers", {
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
        monthly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        yearly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {
        monthly_price: z.ZodOptional<z.ZodLiteral<true>>;
        yearly_price: z.ZodOptional<z.ZodLiteral<true>>;
        benefits: z.ZodOptional<z.ZodLiteral<true>>;
    }, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        welcome_page_url: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"none">]>>;
        monthly_price: z.ZodOptional<z.ZodNumber>;
        yearly_price: z.ZodOptional<z.ZodNumber>;
        trial_days: z.ZodOptional<z.ZodNumber>;
        benefits: z.ZodOptional<z.ZodArray<z.ZodString>>;
        currency: z.ZodOptional<z.ZodString>;
        active: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, any, any, any>, "browse" | "read">;
    get newsletters(): Pick<APIComposer<"newsletters", {
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
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {}, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sender_name: z.ZodString;
        sender_email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
        sender_reply_to: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
        subscribe_on_signup: z.ZodOptional<z.ZodBoolean>;
        sort_order: z.ZodOptional<z.ZodNumber>;
        header_image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_header_icon: z.ZodOptional<z.ZodBoolean>;
        show_header_title: z.ZodOptional<z.ZodBoolean>;
        title_font_category: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"sans_serif">, z.ZodLiteral<"serif">]>>;
        title_alignment: z.ZodOptional<z.ZodString>;
        show_feature_image: z.ZodOptional<z.ZodBoolean>;
        body_font_category: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"sans_serif">, z.ZodLiteral<"serif">]>>;
        footer_content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        show_badge: z.ZodOptional<z.ZodBoolean>;
        show_header_name: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>, z.ZodObject<{
        opt_in_existing: z.ZodBoolean;
    }, z.core.$strip>, any, any>, "browse" | "read" | "add" | "edit">;
    get offers(): Pick<APIComposer<"offers", {
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
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {}, z.ZodDiscriminatedUnion<[z.ZodObject<{
        name: z.ZodString;
        code: z.ZodString;
        display_title: z.ZodOptional<z.ZodString>;
        display_description: z.ZodOptional<z.ZodString>;
        cadence: z.ZodUnion<readonly [z.ZodLiteral<"year">, z.ZodLiteral<"month">]>;
        amount: z.ZodNumber;
        duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">]>;
        duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        currency_restriction: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
        redemption_count: z.ZodOptional<z.ZodNumber>;
        tier: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"fixed">;
        currency: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
        code: z.ZodString;
        display_title: z.ZodOptional<z.ZodString>;
        display_description: z.ZodOptional<z.ZodString>;
        cadence: z.ZodUnion<readonly [z.ZodLiteral<"year">, z.ZodLiteral<"month">]>;
        amount: z.ZodNumber;
        duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">]>;
        duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        currency_restriction: z.ZodOptional<z.ZodBoolean>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
        redemption_count: z.ZodOptional<z.ZodNumber>;
        tier: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        type: z.ZodLiteral<"percent">;
        currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>], "type">, any, z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
        display_title: z.ZodOptional<z.ZodString>;
        display_description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
    }, z.core.$strip>, any>, "browse" | "read" | "add" | "edit">;
    get tags(): Pick<APIComposer<"tags", {
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
    }, z.ZodUnion<readonly [z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {
        "count.posts": z.ZodOptional<z.ZodLiteral<true>>;
    }, z.ZodObject<{
        name: z.ZodString;
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodURL>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">]>>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        accent_color: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, any, z.ZodObject<{
        slug: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        feature_image: z.ZodOptional<z.ZodURL>;
        visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">]>>;
        meta_title: z.ZodOptional<z.ZodString>;
        meta_description: z.ZodOptional<z.ZodString>;
        og_image: z.ZodOptional<z.ZodString>;
        og_title: z.ZodOptional<z.ZodString>;
        og_description: z.ZodOptional<z.ZodString>;
        twitter_image: z.ZodOptional<z.ZodString>;
        twitter_title: z.ZodOptional<z.ZodString>;
        twitter_description: z.ZodOptional<z.ZodString>;
        codeinjection_head: z.ZodOptional<z.ZodString>;
        codeinjection_foot: z.ZodOptional<z.ZodString>;
        canonical_url: z.ZodOptional<z.ZodString>;
        accent_color: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>, any>, "browse" | "read" | "add" | "edit" | "delete">;
    get users(): Pick<APIComposer<"users", {
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
        accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        comment_notifications: z.ZodBoolean;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        tour: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        free_member_signup_notification: z.ZodBoolean;
        last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mention_notifications: z.ZodOptional<z.ZodBoolean>;
        milestone_notifications: z.ZodOptional<z.ZodBoolean>;
        paid_subscription_canceled_notification: z.ZodBoolean;
        paid_subscription_started_notification: z.ZodBoolean;
        status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
        roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.ZodUnion<readonly [z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>]>, {}, any, any, any, any>, "browse" | "read">;
    get webhooks(): Pick<APIComposer<"webhooks", {
        id: z.ZodString;
        event: z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>;
        target_url: z.ZodURL;
        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        integration_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        last_triggered_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        last_triggered_status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        last_triggered_error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        created_at: z.ZodString;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, {}, z.ZodObject<{
        event: z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>;
        target_url: z.ZodURL;
        name: z.ZodOptional<z.ZodString>;
        secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        integration_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, any, z.ZodObject<{
        event: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>>;
        target_url: z.ZodOptional<z.ZodURL>;
        name: z.ZodOptional<z.ZodString>;
        api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>, any>, "add" | "edit" | "delete">;
    get site(): BasicFetcher<"site", z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        logo: z.ZodNullable<z.ZodString>;
        version: z.ZodString;
        url: z.ZodString;
    }, z.core.$strip>>;
    get settings(): BasicFetcher<"settings", z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodUnion<[z.ZodUnion<[z.ZodNullable<z.ZodString>, z.ZodNullable<z.ZodNumber>]>, z.ZodNullable<z.ZodBoolean>]>;
    }, z.core.$strip>>>;
}

declare const adminPostsSchema: z.ZodObject<{
    visibility: z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"members">, z.ZodLiteral<"none">, z.ZodLiteral<"internal">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>;
    custom_template: z.ZodNullable<z.ZodString>;
    canonical_url: z.ZodNullable<z.ZodString>;
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
    uuid: z.ZodString;
    mobiledoc: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email_only: z.ZodBoolean;
    status: z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">]>;
    email_segment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    frontmatter: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tiers: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
        monthly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        yearly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    email: z.ZodOptional<z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>>;
    newsletter: z.ZodOptional<z.ZodNullable<z.ZodObject<{
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
    }, z.core.$strip>>>;
    count: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        clicks: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        positive_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        negative_feedback: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>>;
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
        accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        comment_notifications: z.ZodBoolean;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        free_member_signup_notification: z.ZodBoolean;
        last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mention_notifications: z.ZodOptional<z.ZodBoolean>;
        milestone_notifications: z.ZodOptional<z.ZodBoolean>;
        paid_subscription_canceled_notification: z.ZodBoolean;
        paid_subscription_started_notification: z.ZodBoolean;
        status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
        roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    primary_author: z.ZodObject<{
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
        accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        comment_notifications: z.ZodBoolean;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        free_member_signup_notification: z.ZodBoolean;
        last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        mention_notifications: z.ZodOptional<z.ZodBoolean>;
        milestone_notifications: z.ZodOptional<z.ZodBoolean>;
        paid_subscription_canceled_notification: z.ZodBoolean;
        paid_subscription_started_notification: z.ZodBoolean;
        status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
        roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    lexical: z.ZodOptional<z.ZodCatch<z.ZodString>>;
    html: z.ZodOptional<z.ZodCatch<z.ZodString>>;
    plaintext: z.ZodOptional<z.ZodCatch<z.ZodString>>;
}, z.core.$strip>;
type Post = z.infer<typeof adminPostsSchema>;
declare const adminPostsCreateSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodOptional<z.ZodString>;
    mobiledoc: z.ZodOptional<z.ZodString>;
    lexical: z.ZodOptional<z.ZodString>;
    html: z.ZodOptional<z.ZodString>;
    feature_image: z.ZodOptional<z.ZodString>;
    feature_image_alt: z.ZodOptional<z.ZodString>;
    feature_image_caption: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">, z.ZodLiteral<"sent">]>>;
    locale: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
    visibility_filter: z.ZodOptional<z.ZodString>;
    meta_title: z.ZodOptional<z.ZodString>;
    meta_description: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
    published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
    custom_excerpt: z.ZodOptional<z.ZodString>;
    codeinjection_head: z.ZodOptional<z.ZodString>;
    codeinjection_foot: z.ZodOptional<z.ZodString>;
    og_image: z.ZodOptional<z.ZodString>;
    og_title: z.ZodOptional<z.ZodString>;
    og_description: z.ZodOptional<z.ZodString>;
    twitter_image: z.ZodOptional<z.ZodString>;
    twitter_title: z.ZodOptional<z.ZodString>;
    twitter_description: z.ZodOptional<z.ZodString>;
    email_subject: z.ZodOptional<z.ZodString>;
    custom_template: z.ZodOptional<z.ZodString>;
    canonical_url: z.ZodOptional<z.ZodString>;
    email_only: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>]>>>;
    newsletter: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>;
}, z.core.$strip>;
type CreatePost = z.infer<typeof adminPostsCreateSchema>;
declare const adminPostsUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    mobiledoc: z.ZodOptional<z.ZodString>;
    lexical: z.ZodOptional<z.ZodString>;
    html: z.ZodOptional<z.ZodString>;
    feature_image: z.ZodOptional<z.ZodString>;
    feature_image_alt: z.ZodOptional<z.ZodString>;
    feature_image_caption: z.ZodOptional<z.ZodString>;
    featured: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"draft">, z.ZodLiteral<"published">, z.ZodLiteral<"scheduled">, z.ZodLiteral<"sent">]>>;
    locale: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"internal">, z.ZodLiteral<"members">, z.ZodLiteral<"paid">, z.ZodLiteral<"tiers">]>>;
    visibility_filter: z.ZodOptional<z.ZodString>;
    meta_title: z.ZodOptional<z.ZodString>;
    meta_description: z.ZodOptional<z.ZodString>;
    published_at: z.ZodOptional<z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>>;
    custom_excerpt: z.ZodOptional<z.ZodString>;
    codeinjection_head: z.ZodOptional<z.ZodString>;
    codeinjection_foot: z.ZodOptional<z.ZodString>;
    og_image: z.ZodOptional<z.ZodString>;
    og_title: z.ZodOptional<z.ZodString>;
    og_description: z.ZodOptional<z.ZodString>;
    twitter_image: z.ZodOptional<z.ZodString>;
    twitter_title: z.ZodOptional<z.ZodString>;
    twitter_description: z.ZodOptional<z.ZodString>;
    email_subject: z.ZodOptional<z.ZodString>;
    custom_template: z.ZodOptional<z.ZodString>;
    canonical_url: z.ZodOptional<z.ZodString>;
    email_only: z.ZodOptional<z.ZodBoolean>;
    tags: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    tiers: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    authors: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        email: z.ZodString;
    }, z.core.$strip>]>>>;
    newsletter: z.ZodOptional<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>;
    updated_at: z.ZodPipe<z.ZodDate, z.ZodTransform<string, Date>>;
}, z.core.$strip>;
type UpdatePost = z.infer<typeof adminPostsUpdateSchema>;

declare const adminAuthorsSchema: z.ZodObject<{
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
    accessibility: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comment_notifications: z.ZodBoolean;
    created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    free_member_signup_notification: z.ZodBoolean;
    last_seen: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    mention_notifications: z.ZodOptional<z.ZodBoolean>;
    milestone_notifications: z.ZodOptional<z.ZodBoolean>;
    paid_subscription_canceled_notification: z.ZodBoolean;
    paid_subscription_started_notification: z.ZodBoolean;
    status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"invited">, z.ZodLiteral<"locked">]>;
    roles: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
type Author = z.infer<typeof adminAuthorsSchema>;

declare const adminTiersSchema: z.ZodObject<{
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
    monthly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    yearly_price_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
type Tiers = z.infer<typeof adminTiersSchema>;
declare const adminTiersCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    welcome_page_url: z.ZodOptional<z.ZodString>;
    visibility: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"public">, z.ZodLiteral<"none">]>>;
    monthly_price: z.ZodOptional<z.ZodNumber>;
    yearly_price: z.ZodOptional<z.ZodNumber>;
    trial_days: z.ZodOptional<z.ZodNumber>;
    benefits: z.ZodOptional<z.ZodArray<z.ZodString>>;
    currency: z.ZodOptional<z.ZodString>;
    active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;

declare const adminMembersCreateSchema: z.ZodObject<{
    email: z.ZodEmail;
    name: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
    geolocation: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    products: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        slug: z.ZodString;
    }, z.core.$strip>]>>>;
    newsletters: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>, z.ZodObject<{
        name: z.ZodString;
    }, z.core.$strip>]>>>;
    subscribed: z.ZodOptional<z.ZodBoolean>;
    comped: z.ZodOptional<z.ZodBoolean>;
    stripe_customer_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
declare const adminMembersSchema: z.ZodObject<{
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
    subscribed: z.ZodBoolean;
    comped: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    email_suppression: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        suppressed: z.ZodBoolean;
        info: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    newsletters: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>;
    }, z.core.$strip>>;
}, z.core.$strip>;
type Member = z.infer<typeof adminMembersSchema>;

declare const adminNewsletterCreateSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sender_name: z.ZodString;
    sender_email: z.ZodOptional<z.ZodNullable<z.ZodEmail>>;
    sender_reply_to: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
    subscribe_on_signup: z.ZodOptional<z.ZodBoolean>;
    sort_order: z.ZodOptional<z.ZodNumber>;
    header_image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_header_icon: z.ZodOptional<z.ZodBoolean>;
    show_header_title: z.ZodOptional<z.ZodBoolean>;
    title_font_category: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"sans_serif">, z.ZodLiteral<"serif">]>>;
    title_alignment: z.ZodOptional<z.ZodString>;
    show_feature_image: z.ZodOptional<z.ZodBoolean>;
    body_font_category: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"sans_serif">, z.ZodLiteral<"serif">]>>;
    footer_content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    show_badge: z.ZodOptional<z.ZodBoolean>;
    show_header_name: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;

/**
 * There are other rules here that may be problematic unions
 * cadence: "year" | "month"
 * duration: "once" | "forever" | "repeating" => "repeating" when cadence is "month"
 * duration_in_months: number is only available when `duration` is "repeating"
 *
 * We could type all of that out, but it may complexify the readability and not be helpful ?
 */
declare const adminOffersCreateSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    display_title: z.ZodOptional<z.ZodString>;
    display_description: z.ZodOptional<z.ZodString>;
    cadence: z.ZodUnion<readonly [z.ZodLiteral<"year">, z.ZodLiteral<"month">]>;
    amount: z.ZodNumber;
    duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">]>;
    duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    currency_restriction: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
    redemption_count: z.ZodOptional<z.ZodNumber>;
    tier: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"fixed">;
    currency: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    display_title: z.ZodOptional<z.ZodString>;
    display_description: z.ZodOptional<z.ZodString>;
    cadence: z.ZodUnion<readonly [z.ZodLiteral<"year">, z.ZodLiteral<"month">]>;
    amount: z.ZodNumber;
    duration: z.ZodUnion<readonly [z.ZodLiteral<"once">, z.ZodLiteral<"forever">, z.ZodLiteral<"repeating">]>;
    duration_in_months: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    currency_restriction: z.ZodOptional<z.ZodBoolean>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
    redemption_count: z.ZodOptional<z.ZodNumber>;
    tier: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    type: z.ZodLiteral<"percent">;
    currency: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>], "type">;
type OffersCreate = z.infer<typeof adminOffersCreateSchema>;
declare const adminOffersUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    display_title: z.ZodOptional<z.ZodString>;
    display_description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"active">, z.ZodLiteral<"archived">]>>;
}, z.core.$strip>;

declare const ghostEventTypes: z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>;
type GhostWebhookEventTypes = z.infer<typeof ghostEventTypes>;
declare const adminWebhookSchema: z.ZodObject<{
    id: z.ZodString;
    event: z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>;
    target_url: z.ZodURL;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    integration_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    last_triggered_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    last_triggered_status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    last_triggered_error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    created_at: z.ZodString;
    updated_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
declare const adminWebhookCreateSchema: z.ZodObject<{
    event: z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>;
    target_url: z.ZodURL;
    name: z.ZodOptional<z.ZodString>;
    secret: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    integration_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
declare const adminWebhookUpdateSchema: z.ZodObject<{
    event: z.ZodOptional<z.ZodUnion<readonly [z.ZodLiteral<"site.changed">, z.ZodLiteral<"post.added">, z.ZodLiteral<"post.deleted">, z.ZodLiteral<"post.edited">, z.ZodLiteral<"post.published">, z.ZodLiteral<"post.published.edited">, z.ZodLiteral<"post.unpublished">, z.ZodLiteral<"post.scheduled">, z.ZodLiteral<"post.unscheduled">, z.ZodLiteral<"post.rescheduled">, z.ZodLiteral<"page.added">, z.ZodLiteral<"page.deleted">, z.ZodLiteral<"page.edited">, z.ZodLiteral<"page.published">, z.ZodLiteral<"page.published.edited">, z.ZodLiteral<"page.unpublished">, z.ZodLiteral<"page.scheduled">, z.ZodLiteral<"page.unscheduled">, z.ZodLiteral<"page.rescheduled">, z.ZodLiteral<"tag.added">, z.ZodLiteral<"tag.edited">, z.ZodLiteral<"tag.deleted">, z.ZodLiteral<"post.tag.attached">, z.ZodLiteral<"post.tag.detached">, z.ZodLiteral<"page.tag.attached">, z.ZodLiteral<"page.tag.detached">, z.ZodLiteral<"member.added">, z.ZodLiteral<"member.edited">, z.ZodLiteral<"member.deleted">]>>;
    target_url: z.ZodOptional<z.ZodURL>;
    name: z.ZodOptional<z.ZodString>;
    api_version: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;

export { type Author, type CreatePost, type GhostWebhookEventTypes, type Member, type OffersCreate, type Post, TSGhostAdminAPI, type Tiers, type UpdatePost, adminAuthorsSchema, adminMembersCreateSchema, adminMembersSchema, adminNewsletterCreateSchema, adminOffersCreateSchema, adminOffersUpdateSchema, adminPostsCreateSchema, adminPostsSchema, adminPostsUpdateSchema, adminTiersCreateSchema, adminTiersSchema, adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema, ghostEventTypes };
