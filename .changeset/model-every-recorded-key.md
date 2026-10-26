---
"@ts-ghost/admin-api": minor
"@ts-ghost/core-api": minor
---

Keys Ghost 6.72 sends that the schemas did not model are now kept instead of stripped, all as optional or nullable fields, so no existing type narrows:

- Authors and users: `bluesky`, `instagram`, `linkedin`, `mastodon`, `threads`, `tiktok`, `youtube`; on the admin side also `donation_notifications`, `gift_subscription_notifications`, `recommendation_notifications`, and `tour` on post and page authors.
- Site: `icon`, `cover_image`, `accent_color`, `locale`, `timezone`, `site_uuid`, `allow_external_signup`.
- Newsletters: the design settings (`title_font_weight`, `background_color`, `header_background_color`, `post_title_color`, `section_title_color`, `divider_color`, `button_color`, `button_corners`, `button_style`, `link_color`, `link_style`, `image_corners`) and the `show_excerpt`, `show_latest_posts`, `show_post_title_section`, `show_comment_cta`, `show_subscription_details`, `show_share_button` and `feedback_enabled` flags.
- A post's `email`: `track_clicks`, `feedback_enabled`, `post_id`, `newsletter_id`, `source_type`, `csd_email_count`.
- Pages: `show_title_and_feature_image`.
- Members: `uuid`, `unsubscribe_url`, `attribution`, `current_subscription`, `can_comment`, `commenting`, `enable_comment_notifications`, `enable_updates_and_announcements`; subscriptions gain `plan`, `next_payment`, `offer_redemptions`, `attribution`, `trial_start_at`, `trial_end_at`, `discount_start`, `discount_end` and `price.tier`; tiers gain `expiry_at`, and in `@ts-ghost/core-api` also `monthly_price_id` and `yearly_price_id`.

`@ts-ghost/core-api` also exports `baseSubscriptionsSchema` and the new `baseAttributionSchema`, and adds `sparseInclude()`: an include key that is sent but does not make its relation required, for a relation Ghost leaves out of a record that has none.
