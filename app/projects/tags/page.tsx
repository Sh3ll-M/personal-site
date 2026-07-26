import { TagChip } from "@/components/TagChip";
import { getAllProjectTags } from "@/lib/content/projects";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Project Tags",
  description: "Browse Sh3ll-M's projects by tag.",
  path: "/projects/tags",
});

export default function ProjectTagsPage() {
  const tags = getAllProjectTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tags</h1>
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} href={`/projects/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
