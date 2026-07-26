# Tag Colors — Design

## Context

Tag chips currently render identically everywhere they appear — a plain muted-bordered chip with no visual distinction between tag identities — in 4 places: `TimelineEntry.tsx` (post/project timeline entries), `ProjectCard.tsx` (project grid), and both `app/blog/tags/page.tsx` and `app/projects/tags/page.tsx` (tag index pages). Matthew wants subtle per-tag color so a tag is visually recognizable at a glance without reading it, while staying in keeping with the site's dark git-log aesthetic. Explored via the visual brainstorming companion: three treatments were mocked up against real post titles/tags (tinted outline only, subtle background tint, neutral chip with a color-swatch dot) — the tinted-outline treatment was chosen.

## Goals

- Each tag gets a consistent color everywhere it appears on the site (blog and project tags share one palette/hash — a tag with the same name always looks the same).
- The color treatment stays subtle: tinted border + tinted label text, no background fill.
- New tags need zero maintenance — no per-tag lookup table to keep updating as posts/projects are added.
- Existing hover behavior (border/text turn the site's green accent on hover, signaling "clickable") is preserved unchanged.
- Fix the 4-way duplication of chip markup while touching it, rather than adding color logic to each copy separately.

## Non-goals

- No manually-curated per-tag color mapping — automatic hash-based assignment only (see Approaches discussed in-session: manual mapping gives more control but needs upkeep every time a new tag name appears; explicitly rejected).
- No change to which pages show tags, no display cap, no new tag metadata (e.g. categories) — purely a visual treatment of the existing tag strings.
- No broader visual redesign — this stays within the current dark git-log theme; the "Style Ideas" redesign direction discussed 2026-07-25 remains explicitly deferred.

## Palette & color assignment

`lib/tagColors.ts` exports:

```ts
const PALETTE = ["#d9a44a", "#5fb8b0", "#9d8cd9", "#6a9fd8", "#d98a9e", "#8f97c9"] as const;
// amber, teal, violet, blue, rose, slate

export function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}
```

Green and red are deliberately excluded from the palette — both are already reserved for the diff +/- styling used throughout the site (git-log hash/date lines, hover accent). The hash is reduced modulo the palette length on every iteration, so it's always non-negative and never needs a separate `Math.abs`. Tag counts exceeding the palette size (6) simply cycle — acceptable at this site's current and expected scale (~10-20 tags).

## `TagChip` component

New `components/TagChip.tsx`:

```ts
type TagChipProps = {
  tag: string;
  href?: string;
  count?: number;
  className?: string;
};
```

- **Color:** `getTagColor(tag)` is set as a CSS custom property via `style={{ "--tag-color": color }}`, consumed by the literal (non-interpolated) Tailwind arbitrary-value classes `border-[var(--tag-color)]` and `text-[var(--tag-color)]`. This is required rather than setting `borderColor`/`color` directly via the `style` prop: an inline style always out-ranks a class-based `:hover` rule regardless of pseudo-state, which would permanently override the hover color change described below. Using a CSS variable + Tailwind arbitrary-value class keeps the color on the same specificity tier as the hover utility, so ordering in the generated stylesheet (hover variants are emitted after base utilities) decides the winner on hover — the same base-class-plus-hover-class mechanism already used elsewhere in this codebase (e.g. `border-rule hover:border-diff-add`).
- **Hover:** unchanged from today — `hover:border-diff-add hover:text-ink` stays a fixed Tailwind class, not tag-colored, so hovering any chip signals "clickable" the same way every other interactive element on the site does.
- **Rendering mode:** if `href` is provided, renders a `<Link>` (used by `TimelineEntry`, both tag-index pages); otherwise renders a plain `<span>` (used by `ProjectCard`, which is already nested inside its own `<Link>` and can't nest another).
- **Count:** if `count` is provided, renders `" ("+count+")"` in a separate `text-muted` span, exactly as the tag-index pages render it today — the count stays neutral-colored, only the tag label itself is tinted.
- **Sizing:** the component owns border/radius/color/hover; `className` carries whatever padding variant the caller already uses (`px-2 py-0.5` for timeline/card chips, `px-3 py-1` for tag-index chips) so visual sizing is unchanged. Font size/family continue to come from each caller's existing wrapping element, as today.

## Integration

All 4 existing chip call sites swap their inline `<Link>`/`<span>` markup for `<TagChip .../>`:

- `components/TimelineEntry.tsx`: `<TagChip tag={tag} href={\`${tagsBasePath}/${tag}\`} className="px-2 py-0.5" />` per tag.
- `components/ProjectCard.tsx`: `<TagChip tag={tag} className="px-2 py-0.5" />` (no `href`).
- `app/blog/tags/page.tsx` / `app/projects/tags/page.tsx`: `<TagChip tag={tag} href={\`/blog/tags/${tag}\`} count={count} className="px-3 py-1" />` (project version uses `/projects/tags/${tag}`).

Each file's existing focus-ring classes on the chip move into `TagChip` itself (shared, since every `href` variant needs the same focus-visible treatment); the non-`href` `ProjectCard` variant has no focus ring, since a non-interactive `<span>` isn't a focus target.

## Testing

`lib/tagColors.test.ts`: `getTagColor` is deterministic (same tag input twice returns the same color) and always returns a value present in the exported palette. No new tests for `TagChip` itself — presentational-only, consistent with this repo's existing precedent (see prior specs) of not testing static/interactive-but-logic-free markup beyond what build + typecheck already cover.

## Revision: guaranteed uniqueness (same session, before merge)

After seeing the shipped hash-based palette live, Matthew noticed `n8n` and `necromunda` collided (both landed on the same hash bucket) and asked for every tag to be visually distinct — reversing the "colors may cycle/collide once tags exceed the palette" trade-off accepted above. This section supersedes the hash-based parts of "Palette & color assignment" above; the rest of the design (treatment, hover behavior, `TagChip`'s rendering modes, integration call sites) is unchanged.

**New trade-off, confirmed with Matthew:** uniqueness requires knowing every tag on the site, not just hashing one tag name in isolation — so "zero maintenance forever" no longer holds. Once distinct tags exceed the palette size, a new color needs adding by hand. Accepted as worthwhile for guaranteed-unique colors today.

**Expanded palette (10 colors, 6 unchanged + 4 new)**, still excluding hues near the diff-add green (~152°) and diff-remove red (~4°):

```ts
const PALETTE = [
  "#d9a44a", // amber (existing)
  "#5fb8b0", // teal (existing)
  "#9d8cd9", // violet (existing)
  "#6a9fd8", // blue (existing)
  "#d98a9e", // rose (existing)
  "#8f97c9", // slate (existing)
  "#c2ca73", // citrine (new)
  "#c98860", // clay (new)
  "#b57fc4", // orchid (new)
  "#6bafc7", // harbor (new, spare headroom beyond today's 9 tags)
] as const;
```

**Assignment changes from a per-string hash to a global alphabetical index.** `getTagColor(tag: string, allTags: string[]): string` sorts `allTags` (deduplicated), finds `tag`'s index in that sorted list, and returns `PALETTE[index % PALETTE.length]`. This guarantees uniqueness as long as the total distinct tag count doesn't exceed the palette size (10 today, for 9 actual tags). `allTags` must be the *complete* site-wide tag universe every time — a per-page or per-content-type subset would misassign colors — so a new `getAllSiteTags(): string[]` (in `lib/content/tags.ts`, merging `getAllTags()` from `lib/content/posts.ts` and `getAllProjectTags()` from `lib/content/projects.ts`, deduplicated) becomes the single source of truth, computed once per page render and threaded down to every chip.

**One deliberate manual exception: `meta`.** Matthew asked for the `meta` tag specifically to render in the site's own ink/white color (`#e8e6e1`, the same token used for headings and body text) rather than a rotating hue — it marks posts about the site itself, not a topic, so it reads better as a neutral/system marker. `getTagColor` checks a small fixed override (`{ meta: "#e8e6e1" }`) before falling through to the palette-by-index logic. This is a narrow, named exception for one specific tag with a stated semantic reason, not a return to general per-tag manual mapping (which remains rejected for every other tag, per the original Non-goals).

**Why this needs a bigger refactor than "just change the palette":** tag chips render inside `TimelineEntry`, a `"use client"` component (needed for its framer-motion fade-in animation). Client components can't import the content-loading functions in `lib/content/posts.ts`/`lib/content/projects.ts` (they use Node's `fs`/`child_process`, which can't be bundled for the browser). So `getAllSiteTags()` can only ever be called server-side, in each page component — it cannot be called from inside `TagChip` itself. The site-wide tag list has to be computed once per page and passed down as a plain string-array prop through `Timeline` → `TimelineEntry` → `TagChip`, and through `ProjectCard` → `TagChip`, to every one of the 9 page files that render a `Timeline`, `ProjectCard`, or `TagChip` directly (`app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/blog/tags/page.tsx`, `app/blog/tags/[tag]/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`, `app/projects/tags/page.tsx`, `app/projects/tags/[tag]/page.tsx`). `lib/tagColors.ts` itself stays pure (no `fs`/`child_process`), so it's safe to keep importing directly into the client-bundled `TagChip`/`TimelineEntry` — only the *tag enumeration* is server-only, not the color math.

**Confirmed via the visual companion:** the expanded palette (all 10 swatches) and the corrected `n8n`/`necromunda` pair (now blue/rose) were shown as chip mockups against real post/project titles before being locked in; the `meta`-in-white treatment was shown as a follow-up mockup and approved separately.
