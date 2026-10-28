// Unknown keys awaiting a client schema fix (Ghost 6.72). Each resource's "carries no key the client's
// schema lacks" test.fails owns its keys; drop them here when that test turns green.

const MEMBER = [
  "attribution",
  "can_comment",
  "commenting",
  "current_subscription",
  "enable_comment_notifications",
  "enable_updates_and_announcements",
  "tiers",
  "unsubscribe_url",
  "uuid",
];
const SUBSCRIPTION = [
  "attribution",
  "discount_end",
  "discount_start",
  "next_payment",
  "offer.created_at",
  "offer.last_redeemed",
  "offer.redemption_type",
  "offer_redemptions",
  "plan",
  "price.tier",
  "tier.expiry_at",
  "tier.monthly_price_id",
  "tier.yearly_price_id",
  "trial_end_at",
  "trial_start_at",
];
const OFFER = ["created_at", "last_redeemed", "redemption_type"];

export const PENDING_KEYS: string[] = [
  ...MEMBER.map((k) => `members[].${k}`),
  ...SUBSCRIPTION.map((k) => `members[].subscriptions[].${k}`),
  ...OFFER.map((k) => `offers[].${k}`),
];
