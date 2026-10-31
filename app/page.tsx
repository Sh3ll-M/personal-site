import Link from "next/link";
import { getAllPosts } from "@/lib/content/posts";
import { getAllProjects } from "@/lib/content/projects";
import { getAllGangs } from "@/lib/content/gangs";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { GangCard } from "@/components/GangCard";
import { Hero } from "@/components/Hero";
import { buildMetadata, SITE_NAME } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: SITE_NAME,
  description: "Recent posts and projects from Sh3ll-M, presented as a git commit log.",
  path: "/",
});

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);
  const recentProjects = getAllProjects().slice(0, 3);
  const gangs = getAllGangs();
  const allTags = getAllSiteTags();

  return (
    <div>
      <Hero />

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
          <Link href="/blog" className="font-mono text-xs text-diff-add hover:underline">
            all posts
          </Link>
        </div>
        <div className="mt-4">
          <Timeline items={recentPosts} basePath="/blog" allTags={allTags} />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm uppercase tracking-wide text-muted">Projects</h2>
          <Link href="/projects" className="font-mono text-xs text-diff-add hover:underline">
            all projects
          </Link>
        </div>
        <div className="mt-4">
          <Timeline items={recentProjects} basePath="/projects" allTags={allTags} />
        </div>
      </section>

      {gangs.length > 0 && (
        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-sm uppercase tracking-wide text-muted">Gallery</h2>
            <Link href="/gallery" className="font-mono text-xs text-diff-add hover:underline">
              all gangs
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gangs.slice(0, 2).map((gang) => (
              <GangCard
                key={gang.slug}
                slug={gang.slug}
                title={gang.title}
                faction={gang.faction}
                excerpt={gang.excerpt}
                photos={gang.photos}
                coverPosition={gang.coverPosition}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
