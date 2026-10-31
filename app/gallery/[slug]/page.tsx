import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllGangs, getGangBySlug } from "@/lib/content/gangs";
import { PostMarkdown } from "@/lib/content/markdown";
import { Gallery } from "@/components/Gallery";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllGangs().map((gang) => ({ slug: gang.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const gang = getGangBySlug(params.slug);

  if (!gang) {
    return buildMetadata({
      title: "Not Found",
      description: "This gang doesn't exist.",
      path: `/gallery/${params.slug}`,
    });
  }

  return buildMetadata({
    title: gang.title,
    description: gang.excerpt,
    path: `/gallery/${gang.slug}`,
  });
}

export default function GangPage({ params }: { params: { slug: string } }) {
  const gang = getGangBySlug(params.slug);

  if (!gang) {
    notFound();
  }

  return (
    <article>
      <div className="font-mono text-xs text-muted">
        {gang.date} &nbsp;{gang.git.hash} &nbsp;
        <span className="text-diff-add">+{gang.photos.length} photos</span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-3xl font-bold text-ink">{gang.title}</h1>
        <span className="font-mono text-sm text-diff-add">{gang.faction}</span>
      </div>

      <div className="mt-3 font-mono text-sm">
        <Link href="/gallery" className="text-muted hover:text-ink">
          ‹ gallery
        </Link>
      </div>

      {gang.content.trim() && (
        <div className="prose-content mt-6 text-ink">
          <PostMarkdown content={gang.content} />
        </div>
      )}

      <Gallery photos={gang.photos} title={gang.title} />
    </article>
  );
}
