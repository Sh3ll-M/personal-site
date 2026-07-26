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
