# Tag Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each tag a consistent, subtle color everywhere it appears on the site (timeline entries, project cards, and both tag-index pages), assigned automatically from a small curated palette with zero per-tag maintenance.

**Architecture:** A pure hashing function (`lib/tagColors.ts`) maps a tag string to one of 6 curated hex colors. A new shared `TagChip` component owns the chip markup/styling (color via a CSS variable + Tailwind arbitrary-value classes, so the existing green hover state still wins) and replaces the duplicated inline chip markup in all 4 existing call sites.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (arbitrary-value classes + CSS custom properties), vitest. No new npm dependency.

## Global Constraints

- Palette is exactly these 6 hex colors, in this order: `#d9a44a` (amber), `#5fb8b0` (teal), `#9d8cd9` (violet), `#6a9fd8` (blue), `#d98a9e` (rose), `#8f97c9` (slate). No green/red — reserved for the diff +/- styling.
- Color assignment is automatic (hash-based) — no manually maintained per-tag color table.
- Existing hover behavior (`hover:border-diff-add hover:text-ink`) must be visually unchanged — a tag's own color must not appear on hover.
- No new npm dependency.
- No display/behavior change beyond color — same tags, same links, same counts, same sizing as today.
- No new tests for `TagChip` itself — presentational-only, consistent with this repo's existing precedent of not testing static markup.

---

### Task 1: Tag color hashing (`lib/tagColors.ts`)

**Files:**
- Create: `lib/tagColors.ts`
- Test: `lib/tagColors.test.ts`

**Interfaces:**
- Produces: `getTagColor(tag: string): string`, consumed by Task 2's `TagChip` component.

- [ ] **Step 1: Write the failing test**

Create `lib/tagColors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getTagColor } from "./tagColors";

const PALETTE = ["#d9a44a", "#5fb8b0", "#9d8cd9", "#6a9fd8", "#d98a9e", "#8f97c9"];

describe("getTagColor", () => {
  it("returns the same color for the same tag every time", () => {
    expect(getTagColor("power-bi")).toBe(getTagColor("power-bi"));
  });

  it("always returns a color from the palette", () => {
    const tags = [
      "power-bi",
      "n8n",
      "meta",
      "typescript",
      "necromunda",
      "dax",
      "azure-openai",
      "power-query",
      "nextjs",
    ];
    for (const tag of tags) {
      expect(PALETTE).toContain(getTagColor(tag));
    }
  });

  it("returns a color for an empty string without throwing", () => {
    expect(() => getTagColor("")).not.toThrow();
    expect(PALETTE).toContain(getTagColor(""));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tagColors.test.ts`
Expected: FAIL — `Cannot find module './tagColors'` (file doesn't exist yet)

- [ ] **Step 3: Implement `lib/tagColors.ts`**

```ts
const PALETTE = ["#d9a44a", "#5fb8b0", "#9d8cd9", "#6a9fd8", "#d98a9e", "#8f97c9"] as const;

export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tagColors.test.ts`
Expected: PASS (all 3 cases)

- [ ] **Step 5: Commit**

```bash
git add lib/tagColors.ts lib/tagColors.test.ts
git commit -m "feat: add deterministic per-tag color hashing"
```

---

### Task 2: `TagChip` component and integration into all 4 call sites

**Files:**
- Create: `components/TagChip.tsx`
- Modify: `components/TimelineEntry.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `app/blog/tags/page.tsx`
- Modify: `app/projects/tags/page.tsx`

**Interfaces:**
- Consumes: `getTagColor(tag: string): string` (Task 1).
- Produces: `TagChip({ tag, href?, count?, className? })` — a React component. Not consumed by any later task (this is the last task in the plan).

- [ ] **Step 1: Create `components/TagChip.tsx`**

```tsx
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
```

Note on why color is set via a CSS variable (`style={{ "--tag-color": ... }}`) rather than setting `borderColor`/`color` directly in the `style` prop: an inline style always out-ranks a class-based `:hover` rule regardless of pseudo-state, which would permanently override the `hover:border-diff-add hover:text-ink` classes. Routing the dynamic value through a CSS variable, consumed by the literal (non-interpolated) Tailwind arbitrary-value classes `border-[var(--tag-color)]`/`text-[var(--tag-color)]`, keeps the color on the same specificity tier as the hover classes so the hover variant (emitted later in Tailwind's generated stylesheet) wins on hover — the same mechanism this codebase already uses for `border-rule hover:border-diff-add`.

- [ ] **Step 2: Update `components/TimelineEntry.tsx`**

Replace the tag-rendering block. Before:

```tsx
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`${tagsBasePath}/${tag}`}
              className="rounded border border-rule px-2 py-0.5 hover:border-diff-add hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
```

After:

```tsx
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} href={`${tagsBasePath}/${tag}`} className="px-2 py-0.5" />
          ))}
        </div>
      )}
```

(Note: `text-muted` is dropped from the wrapping `<div>` — it no longer applies to anything, since the chip's own `text-[var(--tag-color)]` now supplies the label color directly instead of inheriting it.)

Add the import at the top of the file, alongside the existing `Link` import:

```tsx
import { TagChip } from "./TagChip";
```

- [ ] **Step 3: Update `components/ProjectCard.tsx`**

Before:

```tsx
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted">
          {tags.map((tag) => (
            <span key={tag} className="rounded border border-rule px-2 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      )}
```

After:

```tsx
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} className="px-2 py-0.5" />
          ))}
        </div>
      )}
```

Add the import at the top of the file:

```tsx
import { TagChip } from "./TagChip";
```

- [ ] **Step 4: Update `app/blog/tags/page.tsx`**

Before:

```tsx
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/blog/tags/${tag}`}
              className="rounded border border-rule px-3 py-1 text-muted hover:border-diff-add hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {tag} <span className="text-muted">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
```

After:

```tsx
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} href={`/blog/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
```

Replace the `Link` import with the `TagChip` import (this file no longer uses `Link` directly once the chip is extracted — check the rest of the file before removing the import; if nothing else in the file uses `Link`, remove it and add `TagChip` instead):

```tsx
import { TagChip } from "@/components/TagChip";
```

- [ ] **Step 5: Update `app/projects/tags/page.tsx`**

Same change as Step 4, using the projects path. Before:

```tsx
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/projects/tags/${tag}`}
              className="rounded border border-rule px-3 py-1 text-muted hover:border-diff-add hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {tag} <span className="text-muted">({count})</span>
            </Link>
          </li>
        ))}
      </ul>
```

After:

```tsx
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} href={`/projects/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
```

Same import swap as Step 4:

```tsx
import { TagChip } from "@/components/TagChip";
```

- [ ] **Step 6: Verify with the dev server**

Run: `npm run dev`, then check in the browser:
- A blog post or project detail page (e.g. `http://localhost:3000/blog/fred-ai-agent-power-bi-dax`) — tag chips under the related-posts/timeline entries show a tinted border and tinted label text (not plain muted), and turn green on hover (same as before).
- The projects listing page (`http://localhost:3000/projects`) — `ProjectCard` tag chips are colored but NOT clickable/hoverable (they're plain `<span>`s, same as before this change).
- `http://localhost:3000/blog/tags` and `http://localhost:3000/projects/tags` — each tag chip shows its color, the `(count)` suffix stays neutral/muted, and hovering still turns the chip green.
- The same tag name (e.g. `power-bi`, which appears on both a post and a project) shows the *same* color in every location it appears.

Stop the dev server after checking.

- [ ] **Step 7: Run full test suite, typecheck, and build**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS. (If `npm run build` fails only on an `opengraph-image` route with `TypeError: Invalid URL`, that's the pre-existing Windows-only `@vercel/og` bug documented in this repo's project history — unrelated to this task. This task doesn't touch those routes.)

- [ ] **Step 8: Commit**

```bash
git add components/TagChip.tsx components/TimelineEntry.tsx components/ProjectCard.tsx app/blog/tags/page.tsx app/projects/tags/page.tsx
git commit -m "feat: add subtle per-tag colors to tag chips"
```
