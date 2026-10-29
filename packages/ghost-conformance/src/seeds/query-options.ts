import { adminApi } from "../live/ghost.ts";
import { must } from "./seed-result.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

/** Letters in the seeded titles and names, so ordering by them has a known answer. */
export const QUERY_LETTERS = ["a", "b", "c", "d", "e"] as const;

/** Five posts (three published, two drafts) and five members, for order, filter, limit and paginate tests. */
export async function seedQueryOptions() {
  const api = adminApi();
  const suffix = uniqueSuffix();
  const posts = [];
  const members = [];
  // Sequential and shuffled: creation order must not be the sort order.
  for (const letter of ["c", "a", "e", "b", "d"] as const) {
    const status = letter === "b" || letter === "d" ? "draft" : "published";
    posts.push(must(await api.posts.add({ title: `Query ${suffix} ${letter}`, status }), "query post"));
    members.push(
      must(
        await api.members.add({
          email: `query-${suffix}-${letter}@conformance.test`,
          name: `Query ${suffix} ${letter}`,
        }),
        "query member",
      ),
    );
  }
  return { suffix, posts, members };
}
