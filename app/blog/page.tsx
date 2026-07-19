import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" />
      </div>
    </div>
  );
}
