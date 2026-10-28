import type { Member, Post, TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { fetchAllPages } from "../../utils/fetch-all-pages";

export const fetchAllBlogPosts = (ghost: TSGhostAdminAPI): Promise<(Post & { html: string | null })[]> =>
  fetchAllPages(
    ghost.posts
      .browse({
        filter: "html:-null",
        order: "published_at DESC,updated_at DESC",
      })
      .formats({ html: true })
      .paginate(),
  );

export const fetchAllMembers = (ghost: TSGhostAdminAPI): Promise<Member[]> =>
  fetchAllPages(ghost.members.browse().paginate());
