import { getAllPosts } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog",
  description: "All blog posts from Sh3ll-M, rendered as a git commit log.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" allTags={allTags} />
      </div>
    </div>
  );
}
