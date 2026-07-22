# Metadata Foundation — Design

## Context

`app/layout.tsx`'s `metadata` export currently sets only `metadataBase`; every one of the site's 10 routes renders with an empty `<title>` and no meta description. This is QoL Chunk A from the 2026-07-21 planning session — agreed to go first since sitemap, social sharing, and search-engine indexing all depend on it. Chunks B (favicon), C (content discovery), and D (CI) are separate follow-on specs.

## Goals

- Every page has a meaningful `<title>` and meta description.
- A sitewide title template so post/project pages read as `"<Post Title> | Sh3ll-M"`.
- `app/sitemap.ts` and `app/robots.ts` so the site is properly crawlable and discoverable.
- Canonical URLs per page (via `alternates.canonical`) to avoid duplicate-content ambiguity.

## Non-goals

- No manual Open Graph *image* wiring — `opengraph-image.tsx` files already exist per post/project (built 2026-07-21) and Next.js picks these up automatically from the route segment; this spec only adds the surrounding text metadata (`title`, `description`, `openGraph.title/description/url`).
- No JSON-LD / structured data — not requested, can be a later addition if SEO needs grow.
- No favicon/site icons — that's Chunk B, blocked on Matthew supplying an image.

## Naming decision

Matthew's real name will appear on the CV page (functionally required there), but the sitewide title template and general site branding use his GitHub handle, **"Sh3ll-M"**, rather than his full name — agreed during brainstorming on 2026-07-22.

## Architecture & data flow

**Shared helper — `lib/metadata.ts`:**

```ts
buildMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata
```

Returns a `Metadata` object with `title`, `description`, `alternates: { canonical: new URL(path, SITE_URL).toString() }`, and `openGraph: { title, description, url }` (the same absolute `url`, not the relative `path`). Centralizing this avoids repeating the canonical-URL-building and OG-field logic across 9 route files, following this repo's existing pattern of small single-purpose `lib/` helpers (`lib/site.ts`, `lib/content/*`).

**Root layout (`app/layout.tsx`):** add to the existing `metadata` export:

```ts
title: { default: "Sh3ll-M", template: "%s | Sh3ll-M" },
description: "Sh3ll-M — CV, blog posts, and project write-ups, rendered as a git commit log."
```

**Per-page metadata (10 routes):**

| Route | Kind | Source |
|---|---|---|
| `/` | static `metadata` | hand-written title/description |
| `/cv` | static `metadata` | hand-written title/description |
| `/blog` | static `metadata` | hand-written title/description |
| `/projects` | static `metadata` | hand-written title/description |
| `/blog/tags` | static `metadata` | hand-written title/description |
| `/projects/tags` | static `metadata` | hand-written title/description |
| `/blog/[slug]` | `generateMetadata` | `getPostBySlug` → title = post title, description = post `excerpt` |
| `/projects/[slug]` | `generateMetadata` | `getProjectBySlug` → title = project title, description = project `excerpt` |
| `/blog/tags/[tag]` | `generateMetadata` | title = `Posts tagged "${tag}"`, description mentions post count |
| `/projects/tags/[tag]` | `generateMetadata` | title = `Projects tagged "${tag}"`, description mentions project count |

All routes call `buildMetadata()` with their respective `title`/`description`/`path`.

**`app/sitemap.ts`:** static routes (`/`, `/cv`, `/blog`, `/projects`) + one entry per post (`getAllPosts()`) and per project (`getAllProjects()`), using each item's frontmatter `date` as `lastModified`. Tag pages (`/blog/tags/*`, `/projects/tags/*`) are deliberately **excluded** from the sitemap — thin/duplicate-content listing pages, standard SEO practice to leave them crawlable via on-page links but not explicitly indexed.

**`app/robots.ts`:** `rules: { userAgent: "*", allow: "/" }`, `sitemap: `${SITE_URL}/sitemap.xml`\`. No disallowed paths yet — revisit when Chunk 2 (login-gated section) exists.

## Edge cases

- Tag pages for a tag with zero matching posts/projects shouldn't occur in practice (tags are only ever derived from existing content via `getAllTags`/`getAllProjectTags`), so no empty-state metadata handling is needed.
- `excerpt` is already a required frontmatter field (`schema.ts`), so no content files need changes to supply post/project descriptions.

## Testing

Following this repo's existing colocated `*.test.ts` convention (e.g. `lib/content/posts.test.ts`):

- `lib/metadata.test.ts` — unit tests for `buildMetadata()`'s output shape given sample inputs.
- `app/sitemap.test.ts` — verifies the generated entry list includes all expected static routes and one entry per post/project, and excludes tag-page URLs.

No automated test for `robots.ts` (trivial static output) or for the per-page `generateMetadata`/`metadata` wiring itself — consistent with this repo's precedent of not adding rendering/snapshot test coverage for page-level output (see the syntax-highlighting spec's Testing section).
