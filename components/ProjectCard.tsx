import Link from "next/link";
import { TagChip } from "./TagChip";

type ProjectCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export function ProjectCard({ slug, title, excerpt, tags }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="block rounded border border-rule p-5 hover:border-diff-add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} className="px-2 py-0.5" />
          ))}
        </div>
      )}
    </Link>
  );
}
