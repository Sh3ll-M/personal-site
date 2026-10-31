import Link from "next/link";
import type { GangPhoto } from "@/lib/content/gangs";

type GangCardProps = {
  slug: string;
  title: string;
  faction: string;
  excerpt: string;
  photos: GangPhoto[];
  coverPosition?: "top" | "center" | "bottom";
};

export function GangCard({ slug, title, faction, excerpt, photos, coverPosition = "center" }: GangCardProps) {
  const cover = photos[0];

  return (
    <Link
      href={`/gallery/${slug}`}
      className="group block overflow-hidden rounded border border-rule transition-colors hover:border-diff-add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      {cover && (
        <div className="aspect-[4/3] overflow-hidden border-b border-rule bg-sidebar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.thumb}
            alt={`${title} gang`}
            loading="lazy"
            style={{ objectPosition: coverPosition }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <span className="shrink-0 font-mono text-xs text-muted">{photos.length} photos</span>
        </div>
        <div className="mt-0.5 font-mono text-xs text-diff-add">{faction}</div>
        <p className="mt-2 text-sm text-muted">{excerpt}</p>
      </div>
    </Link>
  );
}
