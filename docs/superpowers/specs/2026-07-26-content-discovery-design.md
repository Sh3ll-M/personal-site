# Content Discovery (Chunk C) — Design

## Context

Chunk C from the QoL/foundation backlog (see `project_personal_site` memory, agreed 2026-07-21): an RSS feed for the blog, prev/next navigation between posts, and a "related posts" block at the bottom of each post. All three build on infrastructure that already exists — `getAllPosts()`'s sort order, the tag-matching helpers (`getPostsByTag`/`getPostsByTags`), and the `Timeline` component already used for the projects pages' "Related posts" section.

## Goals

- A discoverable RSS 2.0 feed at `/rss.xml`, with `<head>` auto-discovery and a visible icon.
- Prev/next links on each post, ordered chronologically (newest ↔ oldest), matching the timeline's own ordering.
- A "related posts" block on each post, reusing the exact tag-matching + `Timeline` pattern already shipped for projects.
- No new npm dependency for any of this.

## Non-goals

- No Atom or JSON Feed — RSS 2.0 alone, per the project's existing bias toward the simplest thing that works over covering every format "since it's free."
- No tag-aware prev/next (i.e. "next post with this tag") — pure chronological order only.
- No display cap on related posts — matches the uncapped behavior already shipped on project pages.
- No empty-state message when a post has no related posts — the section is omitted entirely (unlike the project pages' "No posts yet" text, which reads fine on a project but awkward at the end of an article).

## 1. RSS feed

The site description currently only exists as an inline string literal in `app/layout.tsx`'s `metadata.description`. It gains a home as `SITE_DESCRIPTION` in `lib/metadata.ts` (alongside the existing `SITE_NAME`), and `app/layout.tsx` is updated to reference it instead of repeating the literal — a small targeted fix so the RSS feed doesn't duplicate a string that would otherwise drift.

**`lib/rss.ts`** exports `buildRssFeed(posts: Post[]): string`, producing an RSS 2.0 document:

- `<channel>`: `title` (`SITE_NAME`), `link` (`SITE_URL`), `description` (`SITE_DESCRIPTION`), `language` (`en-gb`), `lastBuildDate` (build-time `new Date().toUTCString()`).
- One `<item>` per post (already sorted newest-first by `getAllPosts()`): `title`, `link` (`${SITE_URL}/blog/${slug}`), `description` (the post's `excerpt`), `pubDate` (frontmatter `date`, parsed as UTC midnight via `new Date(`${date}T00:00:00Z`).toUTCString()` to avoid local-timezone drift), `guid` (same as `link`, `isPermaLink="true"`).
- An internal `escapeXml(value: string)` helper escapes `&`, `<`, `>`, `"` before interpolating any post-supplied string (title, excerpt) into the XML.

**`app/rss.xml/route.ts`**: a Route Handler (`export function GET()`) that calls `getAllPosts()` + `buildRssFeed()` and returns the string with `Content-Type: application/rss+xml; charset=utf-8`.

**Discovery**: `app/layout.tsx`'s `metadata` gains `alternates: { types: { "application/rss+xml": "/rss.xml" } }`, which Next.js renders as the `<link rel="alternate" type="application/rss+xml">` tag.

**Visible link**: a small hand-written RSS icon (same visual treatment as `ContactIcons.tsx` — Feather-style inline SVG, `ICON_LINK_CLASSES`, `aria-label="RSS feed"`) added as a fourth item inside `ContactIcons.tsx`'s row. It isn't strictly a "contact" method, but it belongs in the same sidebar icon row and doesn't justify its own component + wrapper just to keep the name pure.

## 2. Prev/next links

**`lib/content/posts.ts`** gains `getAdjacentPosts(slug: string, posts: Post[] = getAllPosts()): { previous?: Post; next?: Post }`. Since `posts` is already sorted newest-first, for the post at index `i`: `previous` (older) is `posts[i + 1]`, `next` (newer) is `posts[i - 1]`. Either side is `undefined` at the ends of the list — no wraparound.

**`app/blog/[slug]/page.tsx`** renders a nav row below the article body: left side links to `previous` (if present) labeled "← {previous.title}", right side links to `next` (if present) labeled "{next.title} →". If neither exists (only one post total), the row is omitted.

## 3. Related posts block

Reuses `getPostsByTags(post.tags, posts)` (already in `lib/content/posts.ts`), filtered to exclude the current post's own slug. Rendered via the existing `Timeline` component, in a `<section>` below the prev/next nav, with the same `"Related posts"` heading style as the project pages (`app/projects/[slug]/page.tsx`). If the filtered list is empty, the entire `<section>` is omitted — no heading, no placeholder text.

## Testing

- `lib/rss.test.ts`: channel fields present, one `<item>` per post, XML-escaping of a title/excerpt containing `&`/`<`, `pubDate` format.
- `lib/content/posts.test.ts`: new cases for `getAdjacentPosts` — first post (no `previous`), last post (no `next`), a middle post (both present), and the single-post case (neither present).
- No new tests for the prev/next or related-posts *rendering* — consistent with this repo's existing precedent (see the contact-links and metadata-foundation specs) of not testing static/presentational markup beyond what build + typecheck already cover.
