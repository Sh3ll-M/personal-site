import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";
import { Hero } from "@/components/Hero";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Home",
  description: "Recent posts and projects from Sh3ll-M, presented as a git commit log.",
  path: "/",
});

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      <Hero />

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" />
      </div>
    </div>
  );
}
