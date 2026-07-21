import Link from "next/link";
import { getAllProjectTags } from "@/lib/content/projects";

export default function ProjectTagsPage() {
  const tags = getAllProjectTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tags</h1>
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/projects/tags/${tag}`}
              className="rounded border border-rule px-3 py-1 text-muted hover:border-diff-add hover:text-ink"
            >
              {tag} <span className="text-muted">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
