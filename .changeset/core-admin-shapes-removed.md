---
"@ts-ghost/core-api": major
---

The Admin API response shapes leave core-api; each schema target owns its shapes in admin-api. Removed: `baseAuthorsSchema`, `baseEmailSchema`, `baseMembersShape`, `baseMembersSchema`, `baseNewsletterSchema`, `baseOffersSchema`, `basePagesSchema`, `basePostsSchema`, `baseSettingsSchema`, `baseSiteSchema`, `baseSubscriptionsSchema`, `baseAttributionSchema`, `baseTagsSchema` and `baseTiersSchema`. Use admin-api's exports instead (`adminPostsSchema`, `adminPagesSchema`, `adminMembersSchema`, `adminAuthorsSchema`, `adminNewsletterSchema`, `adminTiersSchema`, …) or `adminSchemas[target]` for offers, tags, site and the rest. The building blocks (`ghostIdentitySchema`, `ghostMetadataSchema`, `ghostVisibilitySchema`, `ghostCodeInjectionSchema`, `ghostSocialMediaSchema`, …) stay.
