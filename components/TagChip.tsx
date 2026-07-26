import Link from "next/link";
import type { CSSProperties } from "react";
import { getTagColor } from "@/lib/tagColors";

type TagChipProps = {
  tag: string;
  href?: string;
  count?: number;
  className?: string;
};

const FOCUS_RING_CLASSES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function TagChip({ tag, href, count, className = "" }: TagChipProps) {
  const style = { "--tag-color": getTagColor(tag) } as CSSProperties;
  const baseClasses = `rounded border border-[var(--tag-color)] text-[var(--tag-color)] hover:border-diff-add hover:text-ink ${className}`;

  const content = (
    <>
      {tag}
      {count !== undefined && <span className="text-muted"> ({count})</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} style={style} className={`${baseClasses} ${FOCUS_RING_CLASSES}`}>
        {content}
      </Link>
    );
  }

  return (
    <span style={style} className={baseClasses}>
      {content}
    </span>
  );
}
