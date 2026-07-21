import { TimelineEntry } from "./TimelineEntry";

type TimelineItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  git: { hash: string; added: number; removed: number };
  tags?: string[];
};

export function Timeline({
  items,
  basePath,
  tagsBasePath,
}: {
  items: TimelineItem[];
  basePath: string;
  /** Base path for tag chip links, e.g. "/blog/tags". Defaults to `${basePath}/tags`. */
  tagsBasePath?: string;
}) {
  const resolvedTagsBasePath = tagsBasePath ?? `${basePath}/tags`;

  return (
    <ul className="relative space-y-8 border-l border-rule pl-2">
      {items.map((item) => (
        <TimelineEntry
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          hash={item.git.hash}
          date={item.date}
          added={item.git.added}
          removed={item.git.removed}
          title={item.title}
          excerpt={item.excerpt}
          tags={item.tags}
          tagsBasePath={resolvedTagsBasePath}
        />
      ))}
    </ul>
  );
}
