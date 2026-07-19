import { getAllPosts } from "@/lib/content/posts";
import { Timeline } from "@/components/Timeline";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <div>
      <div className="font-mono text-xs text-muted">~/matthew</div>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink">Matthew.</h1>
      <p className="mt-2 font-mono text-sm text-muted">builds things. breaks things. writes it down.</p>

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" />
      </div>
    </div>
  );
}
