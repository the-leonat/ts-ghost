import { defineGhostObject, type GhostFieldTable } from "./targets";

/** The Ghost 6 minor the v6-latest target matches; the drift job moves it with the pin. */
export const GHOST_LATEST = "6.72";

/**
 * When each response field appeared (`since`) in Ghost 6, or the first minor without it (`until`), keyed
 * `"<schema>.<field>"`. Unlisted fields are sent by Ghost 5.last and every 6.x. Maintained by the drift job.
 */
export const GHOST_FIELDS = {
  "admin.authors.gift_subscription_notifications": { since: "6.39" },
  "admin.authors.gift_subscription_purchase_notification": { since: "6.28", until: "6.39" },
  "admin.authors.gift_subscription_redemption_notification": { since: "6.28", until: "6.29" },
  "admin.email_recipients.email": { until: "6.38" },
  "admin.members.can_comment": { since: "6.16" },
  "admin.members.commenting": { since: "6.16" },
  "admin.members.current_subscription": { since: "6.45" },
  "admin.members.custom_fields": { since: "6.53", until: "6.62" },
  "admin.members.enable_comment_notifications": { since: "6.45" },
  "admin.members.enable_updates_and_announcements": { since: "6.46" },
  "admin.members.metafields": { since: "6.62" },
  "admin.newsletters.show_share_button": { since: "6.23" },
  "email.csd_email_count": { since: "6.7" },
  "offers.redemption_type": { since: "6.13" },
  "site.timezone": { since: "6.67" },
  "subscriptions.discount_end": { since: "6.16" },
  "subscriptions.discount_start": { since: "6.16" },
  "subscriptions.next_payment": { since: "6.16" },
  "subscriptions.offer_redemptions": { since: "6.20" },
} as const satisfies GhostFieldTable;

/** Builds a response object for a target from its full shape, by GHOST_FIELDS. */
export const ghostObject = defineGhostObject(GHOST_FIELDS);

/**
 * A response hook for a v6-latest client: warns once when Ghost's `content-version` names another minor than
 * GHOST_LATEST, since the exact types may not fit it. It never fails a result, strict mode included.
 */
export function warnOnceOffLatest(latest: string = GHOST_LATEST) {
  let warned = false;
  return (response: Response) => {
    const sent = /^v?(\d+\.\d+)/.exec(response.headers.get("content-version") ?? "")?.[1];
    if (warned || !sent || sent === latest) return;
    warned = true;
    console.warn(
      `@ts-ghost: Ghost v${sent} answered a client on the v6-latest schema, which matches Ghost ${latest}; ` +
        `types may not fit. Use "v6.x" without { schema: "latest" } for any Ghost 6.`,
    );
  };
}
