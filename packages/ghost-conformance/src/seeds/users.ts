// Seeds staff users over SQL: one with a full profile and a suspended one.

import type { LiveGhost } from "../ghost/admin-client.ts";
import { uniqueSuffix } from "./helpers.ts";
import { createdBy, ghostId, insert, mysqlExec, raw } from "./sql.ts";

/** Every nullable profile field, set on the seeded staff user; the suspended user leaves them null. */
export const STAFF_PROFILE = {
  profile_image: "https://example.com/staff-profile.png",
  cover_image: "https://example.com/staff-cover.png",
  bio: "Seeded staff bio",
  website: "https://example.com",
  location: "Berlin",
  facebook: "seededstaff",
  twitter: "@seededstaff",
  threads: "@seededstaff",
  bluesky: "seededstaff.bsky.social",
  mastodon: "@seededstaff@mastodon.social",
  tiktok: "@seededstaff",
  youtube: "@seededstaff",
  instagram: "seededstaff",
  linkedin: "seededstaff",
  accessibility: '{"nightShift":true}',
  meta_title: "Staff meta title",
  meta_description: "Staff meta description",
  // Ghost stores the admin onboarding tour as a JSON string.
  tour: '["getting-started"]',
};

/** The API can't create staff users (invites need email), so this is SQL: a full one and a suspended one. */
export async function seedUsers(ghost: LiveGhost) {
  const suffix = uniqueSuffix();
  const user = (kind: string) => ({
    id: ghostId(),
    email: `${kind}-${suffix}@conformance.test`,
    slug: `${kind}-${suffix}`,
  });
  const [staff, suspended] = [user("staff"), user("suspended")];
  const row = (u: typeof staff, name: string, status: string) => ({
    id: u.id,
    name: `${name} ${suffix}`,
    slug: u.slug,
    password: "x",
    email: u.email,
    status,
    created_at: raw("NOW()"),
    ...createdBy(ghost.version),
  });
  const contributor = raw("(SELECT id FROM roles WHERE name = 'Contributor')");
  await mysqlExec(ghost.composeProject, [
    insert("users", [
      {
        ...row(staff, "Seeded Staff", "active"),
        last_seen: raw("NOW()"),
        updated_at: raw("NOW()"),
        ...STAFF_PROFILE,
      },
    ]),
    insert("users", [row(suspended, "Suspended", "inactive")]),
    insert(
      "roles_users",
      [staff, suspended].map((u) => ({ id: ghostId(), role_id: contributor, user_id: u.id })),
    ),
  ]);
  return { staff, suspended };
}
