import { TimelineEntry } from "./TimelineEntry";

type TimelineItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  git: { hash: string; added: number; removed: number };
};

export function Timeline({ items, basePath }: { items: TimelineItem[]; basePath: string }) {
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
        />
      ))}
    </ul>
  );
}
