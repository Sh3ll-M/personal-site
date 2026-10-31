"use client";

import { useCallback, useEffect, useState } from "react";
import type { GangPhoto } from "@/lib/content/gangs";

type GalleryProps = {
  photos: GangPhoto[];
  title: string;
};

export function Gallery({ photos, title }: GalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const show = useCallback(
    (next: number) => setOpenIndex(((next % photos.length) + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
      else if (e.key === "ArrowLeft")
        setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, photos.length, close]);

  if (photos.length === 0) {
    return <p className="mt-6 text-sm text-muted">No photos yet — check back soon.</p>;
  }

  return (
    <>
      <div className="mt-6 gap-3 [column-fill:_balance] columns-2 md:columns-3 [&>*]:mb-3">
        {photos.map((photo, i) => (
          <button
            key={photo.thumb}
            type="button"
            onClick={() => show(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
            className="block w-full overflow-hidden rounded border border-rule transition-colors hover:border-diff-add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumb}
              alt={`${title} — photo ${i + 1}`}
              loading="lazy"
              className="block w-full"
            />
          </button>
        ))}
      </div>

      {isOpen && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo viewer`}
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 font-mono text-sm text-muted hover:text-ink"
          >
            esc ✕
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(openIndex - 1);
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-6 font-mono text-2xl text-muted hover:text-ink md:left-6"
          >
            ‹
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[openIndex].full}
            alt={`${title} — photo ${openIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded border border-rule object-contain"
          />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show(openIndex + 1);
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-6 font-mono text-2xl text-muted hover:text-ink md:right-6"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">
            {openIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
