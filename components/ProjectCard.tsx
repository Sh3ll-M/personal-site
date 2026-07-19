import Link from "next/link";

type ProjectCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
};

export function ProjectCard({ slug, title, excerpt, tags }: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="block rounded border border-rule p-5 hover:border-diff-add">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {tags.map((tag) => (
            <span key={tag} className="rounded border border-rule px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
