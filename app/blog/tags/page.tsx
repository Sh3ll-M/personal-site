import { TagChip } from "@/components/TagChip";
import { getAllTags } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog Tags",
  description: "Browse Sh3ll-M's blog posts by tag.",
  path: "/blog/tags",
});

export default function BlogTagsPage() {
  const tags = getAllTags();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tags</h1>
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} allTags={allTags} href={`/blog/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
