# Syntax-Highlighted Code Blocks — Design

## Context

Post/project content renders via `ReactMarkdown` + `remark-gfm`, added in commit `909910b`. Code blocks currently render as plain unstyled text — flagged in the 2026-07-19 planning session as probably the highest-value of the remaining follow-up items, since this is a coding blog. This spec covers item 4 of that follow-up list; items 3 (images), 5 (tags), and 6 (share images) are separate follow-on specs.

## Goals

- Syntax-highlighted code blocks in rendered post/project Markdown, matching languages via fenced-code-block info strings (` ```ts `, ` ```bash `, etc.)
- Visual style consistent with the site's existing git-log aesthetic
- A language badge and a copy-to-clipboard button per code block
- Line numbers for longer snippets

## Non-goals

- No custom Shiki theme tuned to the site's CSS variables — a stock theme is used as-is
- No line-highlighting/diff-annotation syntax (e.g. `{1,3-5}` line ranges) — not needed for current content
- No automated visual/snapshot test coverage — verified manually via the dev server, consistent with how prior UI features on this site were checked

## Architecture & data flow

Add `rehype-pretty-code` (built on Shiki) as a rehype plugin in the `ReactMarkdown` pipeline used by both `app/blog/[slug]/page.tsx` and `app/projects/[slug]/page.tsx`. Both routes are statically generated via `generateStaticParams`, so Shiki's highlighting work happens once at build time; the output is static HTML with no client JS required for the highlighting itself. Pages remain Server Components — only the copy button becomes a small client island.

The `ReactMarkdown` + plugin configuration is currently duplicated identically in both page files. Since this change touches both, it will be consolidated into one shared helper (e.g. `lib/content/markdown.tsx`) exporting a single `<PostMarkdown>` component, rather than continuing to duplicate plugin config in two places.

## Components

- **`lib/content/markdown.tsx`** — shared Markdown rendering component wrapping `ReactMarkdown` with `remark-gfm` and `rehype-pretty-code` configured. Replaces the inline `ReactMarkdown` usage in both page files.
- **`components/CodeBlock.tsx`** — client component (`"use client"`) wrapping each rendered `<pre>` block. Renders a copy button that reads the block's `textContent` on click and shows a brief "Copied" confirmation state (~1.5s) before reverting.
- Line numbers and the language badge do not need their own components — `rehype-pretty-code` exposes the language and per-line data via data attributes on the generated markup (`onVisitLine`/`onVisitHighestLine` hooks), and CSS handles the numbering gutter and badge presentation from those attributes.

## Styling

- **Theme:** Shiki's built-in `github-dark` theme, used as-is — fits the git-log aesthetic already established; no custom theme authoring.
- **Line numbers:** rendered via CSS counters on a data attribute rather than literal leading characters in the DOM, so copying a block's text never includes line-number digits.
- **Language badge:** small tag in the block's top-right corner, styled with the site's existing metadata treatment (`font-mono text-xs text-muted`) for consistency with the date/hash styling already used on post/project headers.
- **Copy button:** sits alongside the language badge; icon-only with a text swap ("Copy" → "Copied") on click, no layout shift.

## Edge cases

- Fenced code blocks with no language in the info string fall back to Shiki's plaintext highlighting; no language badge is shown in that case.
- Clipboard write failures (e.g. `navigator.clipboard` unavailable) are caught; the button silently stays in its default state rather than throwing, since the site is HTTPS-only via Vercel and this is a minor, unlikely edge case.

## Testing

No automated test coverage is planned for the highlighting/rendering output itself — `vitest` in this repo is unit-level and isn't set up for rendering/snapshot tests. Verification is manual: run the dev server, view a post containing fenced code blocks in several languages (including one with no language tag), confirm highlighting, badge, line numbers, and copy button all behave as designed.
