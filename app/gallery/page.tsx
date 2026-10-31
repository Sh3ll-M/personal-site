import { getAllGangs } from "@/lib/content/gangs";
import { GangCard } from "@/components/GangCard";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Gallery",
  description: "Painted miniatures: Necromunda gangs and other hobby projects.",
  path: "/gallery",
});

export default function GalleryPage() {
  const gangs = getAllGangs();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Gallery</h1>
      <p className="mt-2 text-sm text-muted">Painted miniatures, a gang at a time.</p>

      {gangs.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gangs.map((gang) => (
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
      ) : (
        <p className="mt-6 text-sm text-muted">No gangs yet. Check back soon.</p>
      )}
    </div>
  );
}
