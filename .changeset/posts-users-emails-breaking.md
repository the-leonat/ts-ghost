---
"@ts-ghost/core-api": major
"@ts-ghost/admin-api": major
---

Posts, pages, users and post emails now parse what Ghost 6 sends. Breaking output types:

- A post's `email.from`, `email.source` and `email.updated_at` (`baseEmailSchema`) are `string | null`. Ghost sends null on a failed email, and one such post made the whole `posts.browse()` fail. The email also has `post_id`, `newsletter_id` (`string | null`), `source_type`, `track_clicks` and `feedback_enabled`, which every Ghost 6 sends, and `csd_email_count` (optional).
- A post's `status` adds `sent`: an email-only post Ghost has emailed. Before, reading one failed (PhilDL/ts-ghost#320).
- A user's and an author's `status` adds `inactive` (a suspended user) and `warn-1` to `warn-4`, next to `active`, `invited` and `locked`. Before, a post by a suspended author failed to parse.
- A user's `tour` is the `string` Ghost stores (a JSON array of seen steps), not a `boolean`. Authors carry it too.
- Users and authors have `bluesky`, `instagram`, `linkedin`, `mastodon`, `threads`, `tiktok` and `youtube` (`string | null`), `donation_notifications` and `recommendation_notifications`, which every Ghost 6 sends, and `gift_subscription_notifications` (optional: Ghost 6.0 lacks it).
