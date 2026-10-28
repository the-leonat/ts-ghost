import type { Post, TSGhostContentAPI } from "@ts-ghost/content-api";

import { fetchAllPages } from "../../utils/fetch-all-pages";

export const fetchAllBlogPosts = (ghost: TSGhostContentAPI): Promise<Post[]> =>
  fetchAllPages(
    ghost.posts
      .browse()
      .include({
        authors: true,
        tags: true,
      })
      .paginate(),
  );
