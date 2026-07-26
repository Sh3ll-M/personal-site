# Content Discovery (Chunk C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an RSS feed, chronological prev/next links between posts, and a tag-matched related-posts block on each blog post.

**Architecture:** Three independent additions on top of existing `lib/content/posts.ts` infrastructure: a hand-rolled RSS 2.0 XML builder served via a Next.js Route Handler, a new `getAdjacentPosts` helper consumed by the post page, and a reuse of the existing `getPostsByTags` + `Timeline` component (already shipped for project pages) on the post page.

**Tech Stack:** Next.js 14 App Router (Route Handlers, file-convention metadata), TypeScript, vitest. No new npm dependency.

## Global Constraints

- RSS 2.0 only — no Atom, no JSON Feed.
- No new npm dependency for any of this.
- Prev/next is pure chronological order (by `getAllPosts()`'s existing newest-first sort) — no tag-awareness, no wraparound at the ends.
- Related posts: no display cap (match any shared tag, show all); if none match, omit the whole section (no heading, no empty-state text).
- RSS item `description` is the post excerpt only, not full rendered content.
- Tests only cover pure logic (`lib/rss.ts`, `getAdjacentPosts`) — no new rendering tests, matching this repo's existing precedent of not testing static/presentational markup.

---

### Task 1: RSS feed builder (`lib/rss.ts`)

**Files:**
- Modify: `lib/metadata.ts` — add `SITE_DESCRIPTION` export
- Modify: `app/layout.tsx:12` — reference `SITE_DESCRIPTION` instead of the inline string
- Create: `lib/rss.ts`
- Test: `lib/rss.test.ts`

**Interfaces:**
- Consumes: `Post` type from `@/lib/content/posts` (`{ slug, title, date, tags, excerpt, content, git }`), `SITE_URL` from `@/lib/site`, `SITE_NAME`/`SITE_DESCRIPTION` from `@/lib/metadata`.
- Produces: `buildRssFeed(posts: Post[]): string`, consumed by Task 2's route handler.

- [ ] **Step 1: Extract `SITE_DESCRIPTION` into `lib/metadata.ts`**

Edit `lib/metadata.ts` to add the export (keep everything else in the file unchanged):

```ts
export const SITE_NAME = "Sh3ll-M";
export const SITE_DESCRIPTION = "Sh3ll-M — CV, blog posts, and project write-ups, rendered as a git commit log.";
```

- [ ] **Step 2: Point `app/layout.tsx` at the new constant**

In `app/layout.tsx`, change:

```ts
import { SITE_NAME } from "@/lib/metadata";
```

to:

```ts
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/metadata";
```

and change the `metadata` object's `description` line from the inline string literal to:

```ts
  description: SITE_DESCRIPTION,
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

Run: `npm test -- metadata.test.ts`
Expected: PASS (this constant isn't asserted on yet, this just confirms the refactor didn't break the existing `buildMetadata` tests)

- [ ] **Step 4: Write the failing test for `buildRssFeed`**

Create `lib/rss.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildRssFeed } from "./rss";
import type { Post } from "./content/posts";

const fakeGit = { hash: "abc123", date: "2026-07-01", added: 10, removed: 0 };

const fakePosts: Post[] = [
  {
    slug: "a-post",
    title: "A Post",
    date: "2026-07-01",
    tags: [],
    excerpt: "First post",
    content: "",
    git: fakeGit,
  },
  {
    slug: "b-post",
    title: "B & <C>",
    date: "2026-07-15",
    tags: [],
    excerpt: 'Second "post"',
    content: "",
    git: fakeGit,
  },
];

describe("buildRssFeed", () => {
  it("includes channel-level fields", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain("<title>Sh3ll-M</title>");
    expect(xml).toContain("<language>en-gb</language>");
    expect(xml).toContain("<link>https://personal-site-ecru-eta-23.vercel.app</link>");
  });

  it("includes one item per post", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml.match(/<item>/g)).toHaveLength(2);
  });

  it("builds an absolute link and permalink guid from the site URL and slug", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain(
      "<link>https://personal-site-ecru-eta-23.vercel.app/blog/a-post</link>"
    );
    expect(xml).toContain(
      '<guid isPermaLink="true">https://personal-site-ecru-eta-23.vercel.app/blog/a-post</guid>'
    );
  });

  it("escapes XML special characters in title and excerpt", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain("<title>B &amp; &lt;C&gt;</title>");
    expect(xml).toContain("Second &quot;post&quot;");
  });

  it("formats pubDate as an RFC 822 string derived from the frontmatter date", () => {
    const xml = buildRssFeed(fakePosts);
    expect(xml).toContain(`<pubDate>${new Date("2026-07-01T00:00:00Z").toUTCString()}</pubDate>`);
  });
});
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test -- rss.test.ts`
Expected: FAIL — `Cannot find module './rss'` (file doesn't exist yet)

- [ ] **Step 6: Implement `lib/rss.ts`**

```ts
import type { Post } from "./content/posts";
import { SITE_URL } from "./site";
import { SITE_NAME, SITE_DESCRIPTION } from "./metadata";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toPubDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function buildRssFeed(posts: Post[]): string {
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${toPubDate(post.date)}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test -- rss.test.ts`
Expected: PASS (all 5 cases)

- [ ] **Step 8: Commit**

```bash
git add lib/rss.ts lib/rss.test.ts lib/metadata.ts app/layout.tsx
git commit -m "feat: add RSS feed builder"
```

---

### Task 2: RSS route, discovery link, and sidebar icon

**Files:**
- Create: `app/rss.xml/route.ts`
- Modify: `app/layout.tsx` — add `alternates.types` to `metadata`
- Modify: `components/ContactIcons.tsx` — add a fourth icon link

**Interfaces:**
- Consumes: `buildRssFeed` and `Post` (Task 1), `getAllPosts` from `@/lib/content/posts`.
- Produces: `GET /rss.xml` endpoint; no new exports consumed by later tasks.

- [ ] **Step 1: Create the route handler**

Create `app/rss.xml/route.ts`:

```ts
import { getAllPosts } from "@/lib/content/posts";
import { buildRssFeed } from "@/lib/rss";

export function GET() {
  const xml = buildRssFeed(getAllPosts());

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
```

- [ ] **Step 2: Add discovery `<link>` to root metadata**

In `app/layout.tsx`, add `alternates` to the `metadata` object (it currently has `metadataBase`, `title`, `description`):

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: {
    types: { "application/rss+xml": "/rss.xml" },
  },
};
```

- [ ] **Step 3: Add the RSS icon to `components/ContactIcons.tsx`**

Add a fourth `<a>` inside the existing wrapper `<div>` in `ContactIcons.tsx`, after the LinkedIn link, reusing `ICON_LINK_CLASSES`:

```tsx
      <a
        href="/rss.xml"
        aria-label="RSS feed"
        className={ICON_LINK_CLASSES}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="block"
          aria-hidden="true"
        >
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
      </a>
```

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev`, then in another shell:

```bash
curl -s http://localhost:3000/rss.xml | head -20
```

Expected: valid-looking RSS XML starting with `<?xml version="1.0" encoding="UTF-8"?>`, containing `<rss version="2.0">` and at least one `<item>`.

Then view page source at `http://localhost:3000/` and confirm a `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` tag is present in `<head>`, and that a 4th icon renders in the sidebar next to the existing contact icons.

Stop the dev server after checking.

- [ ] **Step 5: Run full test suite and typecheck**

Run: `npm run typecheck && npm test`
Expected: PASS, no new failures

- [ ] **Step 6: Commit**

```bash
git add app/rss.xml/route.ts app/layout.tsx components/ContactIcons.tsx
git commit -m "feat: serve RSS feed at /rss.xml with discovery link and sidebar icon"
```

---

### Task 3: `getAdjacentPosts` helper

**Files:**
- Modify: `lib/content/posts.ts` — add `getAdjacentPosts`
- Test: `lib/content/posts.test.ts` — add new `describe` block

**Interfaces:**
- Consumes: `Post[]` (already sorted newest-first by `getAllPosts()`, as used throughout this file).
- Produces: `getAdjacentPosts(slug: string, posts?: Post[]): { previous?: Post; next?: Post }`, consumed by Task 4's post page.

- [ ] **Step 1: Write the failing tests**

Add to `lib/content/posts.test.ts` (below the existing `getPostsByTags` block, reusing the existing `fakePosts` array already defined in this file — newest-first: `c-post` (2026-07-20), `b-post` (2026-07-15), `a-post` (2026-07-01)):

```ts
describe("getAdjacentPosts", () => {
  it("returns both neighbors for a post in the middle", () => {
    const result = getAdjacentPosts("b-post", fakePosts);
    expect(result.previous?.slug).toBe("a-post");
    expect(result.next?.slug).toBe("c-post");
  });

  it("returns no `next` for the newest post", () => {
    const result = getAdjacentPosts("c-post", fakePosts);
    expect(result.next).toBeUndefined();
    expect(result.previous?.slug).toBe("b-post");
  });

  it("returns no `previous` for the oldest post", () => {
    const result = getAdjacentPosts("a-post", fakePosts);
    expect(result.previous).toBeUndefined();
    expect(result.next?.slug).toBe("b-post");
  });

  it("returns neither neighbor when there is only one post", () => {
    const result = getAdjacentPosts("a-post", [fakePosts[0]]);
    expect(result.previous).toBeUndefined();
    expect(result.next).toBeUndefined();
  });
});
```

Also update the import line at the top of the file to include the new function:

```ts
import { getAllPosts, getPostBySlug, getAllTags, getPostsByTag, getPostsByTags, getAdjacentPosts, type Post } from "./posts";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- posts.test.ts`
Expected: FAIL — `getAdjacentPosts is not a function` (or import error)

- [ ] **Step 3: Implement `getAdjacentPosts`**

Add to `lib/content/posts.ts`, after `getPostsByTags`:

```ts
export function getAdjacentPosts(
  slug: string,
  posts: Post[] = getAllPosts()
): { previous?: Post; next?: Post } {
  const index = posts.findIndex((post) => post.slug === slug);
  return {
    previous: posts[index + 1],
    next: index > 0 ? posts[index - 1] : undefined,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- posts.test.ts`
Expected: PASS (all cases, including the pre-existing ones)

- [ ] **Step 5: Commit**

```bash
git add lib/content/posts.ts lib/content/posts.test.ts
git commit -m "feat: add getAdjacentPosts for chronological prev/next navigation"
```

---

### Task 4: Prev/next nav and related-posts block on the post page

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAdjacentPosts` (Task 3), `getPostsByTags` (existing, from `@/lib/content/posts`), `Timeline` component (existing, from `@/components/Timeline`).
- Produces: nothing consumed by later tasks — this is the last task in the plan.

- [ ] **Step 1: Update imports and compute the new data**

In `app/blog/[slug]/page.tsx`, change the imports and add the two new lookups inside `BlogPostPage`, right after the existing `notFound()` check:

```tsx
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getAdjacentPosts, getPostsByTags } from "@/lib/content/posts";
import { PostMarkdown } from "@/lib/content/markdown";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";
```

```tsx
  if (!post) {
    notFound();
  }

  const { previous, next } = getAdjacentPosts(post.slug);
  const relatedPosts = getPostsByTags(post.tags).filter((p) => p.slug !== post.slug);
```

(Note: `notFound()` throws, so TypeScript still needs the non-null assertion pattern already used elsewhere in this file — no change needed there, `post` is narrowed after this point same as before.)

- [ ] **Step 2: Render the prev/next nav row**

Add below the closing `</div>` of `prose-content` (i.e. right after the `<PostMarkdown>` block, before the closing `</article>`):

```tsx
      {(previous || next) && (
        <nav className="mt-10 flex justify-between gap-4 font-mono text-sm text-diff-add">
          {previous ? (
            <Link href={`/blog/${previous.slug}`} className="hover:underline">
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="hover:underline">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
```

Add the `Link` import (not previously used in this file):

```tsx
import Link from "next/link";
```

- [ ] **Step 3: Render the related-posts section**

Add below the prev/next nav, still inside `<article>`:

```tsx
      {relatedPosts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Related posts</h2>
          <div className="mt-4">
            <Timeline items={relatedPosts} basePath="/blog" />
          </div>
        </section>
      )}
```

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev`, then visit a blog post in the browser (e.g. `http://localhost:3000/blog/fred-ai-agent-power-bi-dax`):
- Confirm prev/next links appear (or are correctly absent if this is the only/newest/oldest post) and navigate correctly.
- Confirm the related-posts section appears only when the post shares a tag with another post, and is fully absent otherwise (check a post with no tag overlap, if one exists).

Stop the dev server after checking.

- [ ] **Step 5: Run full test suite, typecheck, and build**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS. (Recall from the `project_personal_site` memory: if this build ever fails locally only on an unrelated `next/og`/`opengraph-image` route with `TypeError: Invalid URL`, that's the known Windows-only `@vercel/og` bug — not caused by this task. This task doesn't touch those routes, so the build should pass cleanly here.)

- [ ] **Step 6: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "feat: add prev/next navigation and related posts to blog post pages"
```
