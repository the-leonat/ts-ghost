import Link from "next/link";

import { ghostAdminAPI, ghostContentAPI } from "./ghost";

async function getBlogPosts() {
  const response = await ghostAdminAPI.posts
    .browse()
    .fields({ title: true, slug: true, id: true, status: true })
    .fetch();
  if (!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

async function getSiteSettings() {
  const response = await ghostContentAPI.settings.fetch();
  if (!response.success) {
    throw new Error(response.errors.join(", "));
  }
  return response.data;
}

// Rendered per request, so a build needs no Ghost.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSiteSettings()]);
  return (
    <div>
      <h1>This is a list of posts for {settings.title}:</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link key={post.id} href={post.slug}>
              {post.status === "draft" ? "📜" : "🚀"} {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
