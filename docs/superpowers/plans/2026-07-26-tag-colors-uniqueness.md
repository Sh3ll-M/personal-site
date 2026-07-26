# Tag Colors Uniqueness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guarantee every distinct tag on the site gets its own color (no more collisions like `n8n`/`necromunda`), with `meta` pinned to the site's white/ink color as a deliberate special case.

**Architecture:** `getTagColor` moves from hashing one tag name into a 6-color palette to indexing a tag's alphabetical position in the *complete* site-wide tag list into an expanded 10-color palette, with a fixed override for `meta`. Because the tag universe can only be computed server-side (it needs `fs`/git access that can't be bundled into the client components tag chips render inside), a new `getAllSiteTags()` is computed once per page and threaded down as a plain prop through `Timeline`/`TimelineEntry`/`ProjectCard` into `TagChip`.

**Tech Stack:** Next.js 14 App Router, TypeScript, vitest. No new npm dependency.

## Global Constraints

- Palette is exactly these 10 hex values, in this exact order (order determines which color a given alphabetical index gets — it must match what was visually approved): `#d9a44a` (amber), `#5fb8b0` (teal), `#9d8cd9` (violet), `#6a9fd8` (blue), `#d98a9e` (rose), `#8f97c9` (slate), `#c2ca73` (citrine), `#c98860` (clay), `#b57fc4` (orchid), `#6bafc7` (harbor).
- `meta` always renders as `#e8e6e1` (the site's ink color), regardless of its alphabetical position — this is the one deliberate manual exception; no other tag gets a manual override.
- Assignment is by a tag's index in the deduplicated, alphabetically sorted list of *every* tag on the site (posts + projects combined) — never a per-page or per-content-type subset. Every call site must pass the complete list.
- No new npm dependency.
- No visual/behavioral change beyond color assignment — same links, same counts, same sizing, same hover behavior (fixed in the prior task: hover only applies to the `href` `<Link>` variant, never the plain `<span>` variant).

---

### Task 1: Expanded palette and index-based color assignment (`lib/tagColors.ts`)

**Files:**
- Modify: `lib/tagColors.ts`
- Modify: `lib/tagColors.test.ts`

**Interfaces:**
- Produces: `getTagColor(tag: string, allTags: string[]): string`, consumed by Task 3's `TagChip` component. This changes the existing signature (previously `getTagColor(tag: string): string`) — Task 3 must call it with the new two-argument form.

- [ ] **Step 1: Replace the test file with the new signature's tests**

Replace the full contents of `lib/tagColors.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getTagColor } from "./tagColors";

const REAL_TAGS = [
  "azure-openai",
  "dax",
  "meta",
  "n8n",
  "necromunda",
  "nextjs",
  "power-bi",
  "power-query",
  "typescript",
];

describe("getTagColor", () => {
  it("returns the same color for the same tag every time", () => {
    expect(getTagColor("n8n", REAL_TAGS)).toBe(getTagColor("n8n", REAL_TAGS));
  });

  it("gives every distinct tag in a realistic 9-tag list a unique color", () => {
    const colors = REAL_TAGS.map((tag) => getTagColor(tag, REAL_TAGS));
    expect(new Set(colors).size).toBe(REAL_TAGS.length);
  });

  it("is not affected by the order of the allTags list", () => {
    const shuffled = [...REAL_TAGS].reverse();
    expect(getTagColor("necromunda", REAL_TAGS)).toBe(getTagColor("necromunda", shuffled));
  });

  it("always assigns 'meta' the site's ink color, regardless of allTags", () => {
    expect(getTagColor("meta", REAL_TAGS)).toBe("#e8e6e1");
    expect(getTagColor("meta", ["meta"])).toBe("#e8e6e1");
  });

  it("does not throw for a tag missing from allTags", () => {
    expect(() => getTagColor("unknown-tag", REAL_TAGS)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tagColors.test.ts`
Expected: FAIL — `getTagColor` currently only takes one argument and hashes rather than indexing, so at minimum the "unique colors" and "meta" tests fail.

- [ ] **Step 3: Replace `lib/tagColors.ts`**

Replace the full contents:

```ts
const PALETTE = [
  "#d9a44a", // amber
  "#5fb8b0", // teal
  "#9d8cd9", // violet
  "#6a9fd8", // blue
  "#d98a9e", // rose
  "#8f97c9", // slate
  "#c2ca73", // citrine
  "#c98860", // clay
  "#b57fc4", // orchid
  "#6bafc7", // harbor
] as const;

const SPECIAL_TAG_COLORS: Record<string, string> = {
  meta: "#e8e6e1",
};

export function getTagColor(tag: string, allTags: string[]): string {
  if (tag in SPECIAL_TAG_COLORS) {
    return SPECIAL_TAG_COLORS[tag];
  }
  const sorted = Array.from(new Set(allTags)).sort();
  const index = sorted.indexOf(tag);
  return PALETTE[(index === -1 ? 0 : index) % PALETTE.length];
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tagColors.test.ts`
Expected: PASS (all 5 cases)

- [ ] **Step 5: Commit**

```bash
git add lib/tagColors.ts lib/tagColors.test.ts
git commit -m "feat: guarantee unique tag colors via global alphabetical index"
```

---

### Task 2: Site-wide tag list (`lib/content/tags.ts`)

**Files:**
- Create: `lib/content/tags.ts`
- Test: `lib/content/tags.test.ts`

**Interfaces:**
- Consumes: `getAllTags` (returns `TagCount[]`, from `@/lib/content/posts`), `getAllProjectTags` (returns `TagCount[]`, from `@/lib/content/projects`). Both already exist and already default to reading real content via `getAllPosts()`/`getAllProjects()` when called with no arguments.
- Produces: `getAllSiteTags(postTags?: TagCount[], projectTags?: TagCount[]): string[]`, consumed by Task 3's 9 page-file updates.

- [ ] **Step 1: Write the failing test**

Create `lib/content/tags.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getAllSiteTags } from "./tags";

describe("getAllSiteTags", () => {
  it("merges post tags and project tags with no duplicates", () => {
    const postTags = [
      { tag: "power-bi", count: 2 },
      { tag: "n8n", count: 1 },
    ];
    const projectTags = [
      { tag: "n8n", count: 1 },
      { tag: "necromunda", count: 1 },
    ];
    expect(getAllSiteTags(postTags, projectTags)).toEqual(["power-bi", "n8n", "necromunda"]);
  });

  it("returns an empty array when there are no tags anywhere", () => {
    expect(getAllSiteTags([], [])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/content/tags.test.ts`
Expected: FAIL — `Cannot find module './tags'` (file doesn't exist yet)

- [ ] **Step 3: Implement `lib/content/tags.ts`**

```ts
import { getAllTags, type TagCount } from "./posts";
import { getAllProjectTags } from "./projects";

export function getAllSiteTags(
  postTags: TagCount[] = getAllTags(),
  projectTags: TagCount[] = getAllProjectTags()
): string[] {
  return Array.from(new Set([...postTags.map((t) => t.tag), ...projectTags.map((t) => t.tag)]));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/content/tags.test.ts`
Expected: PASS (both cases)

- [ ] **Step 5: Commit**

```bash
git add lib/content/tags.ts lib/content/tags.test.ts
git commit -m "feat: add getAllSiteTags combining post and project tags"
```

---

### Task 3: Thread `allTags` through every chip-rendering component and page

This task has no standalone test cycle of its own — `TagChip`'s new required `allTags` prop means the codebase will not typecheck until every consumer (4 shared components + 9 pages) is updated together. Do all of the following steps before running any verification.

**Files:**
- Modify: `components/TagChip.tsx`
- Modify: `components/Timeline.tsx`
- Modify: `components/TimelineEntry.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `app/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/tags/page.tsx`
- Modify: `app/blog/tags/[tag]/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/projects/tags/page.tsx`
- Modify: `app/projects/tags/[tag]/page.tsx`
- Modify: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getTagColor(tag: string, allTags: string[]): string` (Task 1), `getAllSiteTags(): string[]` (Task 2, called with no arguments in every page — always the real, complete site-wide list).
- Produces: nothing consumed by a later task — this is the last task in the plan.

- [ ] **Step 1: `components/TagChip.tsx`** — add the `allTags` prop and pass it through

```tsx
import Link from "next/link";
import type { CSSProperties } from "react";
import { getTagColor } from "@/lib/tagColors";

type TagChipProps = {
  tag: string;
  allTags: string[];
  href?: string;
  count?: number;
  className?: string;
};

const FOCUS_RING_CLASSES =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function TagChip({ tag, allTags, href, count, className = "" }: TagChipProps) {
  const style = { "--tag-color": getTagColor(tag, allTags) } as CSSProperties;
  const colorClasses = `rounded border border-[var(--tag-color)] text-[var(--tag-color)] ${className}`;
  const hoverClasses = "hover:border-diff-add hover:text-ink";

  const content = (
    <>
      {tag}
      {count !== undefined && <span className="text-muted"> ({count})</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} style={style} className={`${colorClasses} ${hoverClasses} ${FOCUS_RING_CLASSES}`}>
        {content}
      </Link>
    );
  }

  return (
    <span style={style} className={colorClasses}>
      {content}
    </span>
  );
}
```

(Only the `type TagChipProps` and the `style` line changed from the current file — the `if (href)`/`return` branches are unchanged, reproduced above for completeness.)

- [ ] **Step 2: `components/Timeline.tsx`** — add and thread `allTags`

```tsx
import { TimelineEntry } from "./TimelineEntry";

type TimelineItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  git: { hash: string; added: number; removed: number };
  tags?: string[];
};

export function Timeline({
  items,
  basePath,
  tagsBasePath,
  allTags,
}: {
  items: TimelineItem[];
  basePath: string;
  /** Base path for tag chip links, e.g. "/blog/tags". Defaults to `${basePath}/tags`. */
  tagsBasePath?: string;
  allTags: string[];
}) {
  const resolvedTagsBasePath = tagsBasePath ?? `${basePath}/tags`;

  return (
    <ul className="relative space-y-8 border-l border-rule pl-2">
      {items.map((item) => (
        <TimelineEntry
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          hash={item.git.hash}
          date={item.date}
          added={item.git.added}
          removed={item.git.removed}
          title={item.title}
          excerpt={item.excerpt}
          tags={item.tags}
          tagsBasePath={resolvedTagsBasePath}
          allTags={allTags}
        />
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: `components/TimelineEntry.tsx`** — add and thread `allTags`

```tsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TagChip } from "./TagChip";

type TimelineEntryProps = {
  href: string;
  hash: string;
  date: string;
  added: number;
  removed: number;
  title: string;
  excerpt: string;
  tags?: string[];
  tagsBasePath?: string;
  allTags: string[];
};

export function TimelineEntry({
  href,
  hash,
  date,
  added,
  removed,
  title,
  excerpt,
  tags,
  tagsBasePath = "/blog/tags",
  allTags,
}: TimelineEntryProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="relative pl-7"
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <span className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-diff-add" />
      <div className="font-mono text-xs text-muted">
        {date} &nbsp;{hash} &nbsp;
        <span className="text-diff-add">+{added}</span> <span className="text-diff-remove">-{removed}</span>
      </div>
      <Link
        href={href}
        className="mt-1 block font-display text-lg font-bold text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
      >
        {title}
      </Link>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
      {tags && tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} allTags={allTags} href={`${tagsBasePath}/${tag}`} className="px-2 py-0.5" />
          ))}
        </div>
      )}
    </motion.li>
  );
}
```

- [ ] **Step 4: `components/ProjectCard.tsx`** — add and thread `allTags`

```tsx
import Link from "next/link";
import { TagChip } from "./TagChip";

type ProjectCardProps = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  allTags: string[];
};

export function ProjectCard({ slug, title, excerpt, tags, allTags }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="block rounded border border-rule p-5 hover:border-diff-add focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{excerpt}</p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs">
          {tags.map((tag) => (
            <TagChip key={tag} tag={tag} allTags={allTags} className="px-2 py-0.5" />
          ))}
        </div>
      )}
    </Link>
  );
}
```

- [ ] **Step 5: `app/page.tsx`** — compute and pass `allTags`

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { Hero } from "@/components/Hero";
import { buildMetadata, SITE_NAME } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: SITE_NAME,
  description: "Recent posts and projects from Sh3ll-M, presented as a git commit log.",
  path: "/",
});

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);
  const allTags = getAllSiteTags();

  return (
    <div>
      <Hero />

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" allTags={allTags} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: `app/blog/page.tsx`** — compute and pass `allTags`

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog",
  description: "All blog posts from Sh3ll-M, rendered as a git commit log.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Blog</h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" allTags={allTags} />
      </div>
    </div>
  );
}
```

- [ ] **Step 7: `app/blog/tags/page.tsx`** — compute and pass `allTags` directly to `TagChip`

```tsx
import { TagChip } from "@/components/TagChip";
import { getAllTags } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog Tags",
  description: "Browse Sh3ll-M's blog posts by tag.",
  path: "/blog/tags",
});

export default function BlogTagsPage() {
  const tags = getAllTags();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tags</h1>
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} allTags={allTags} href={`/blog/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 8: `app/blog/tags/[tag]/page.tsx`** — compute and pass `allTags`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

export function generateMetadata({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag);

  return buildMetadata({
    title: `Posts tagged "${params.tag}"`,
    description: `${posts.length} post${posts.length === 1 ? "" : "s"} tagged "${params.tag}" on Sh3ll-M.`,
    path: `/blog/tags/${encodeURIComponent(params.tag)}`,
  });
}

export default function BlogTagPage({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag);

  if (posts.length === 0) {
    notFound();
  }

  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Posts tagged{" "}
        <Link
          href="/blog"
          className="text-diff-add hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
          title="Clear filter"
        >
          {params.tag}
        </Link>
      </h1>
      <div className="mt-6">
        <Timeline items={posts} basePath="/blog" allTags={allTags} />
      </div>
    </div>
  );
}
```

- [ ] **Step 9: `app/blog/[slug]/page.tsx`** — compute and pass `allTags` to the related-posts `Timeline`

Only the two spots shown change (imports and the `allTags` line + prop); everything else in this file (the `previous`/`next` nav, metadata functions) is unchanged. Full file after the change:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getAdjacentPosts, getPostsByTags } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { PostMarkdown } from "@/lib/content/markdown";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return buildMetadata({
      title: "Not Found",
      description: "This post doesn't exist.",
      path: `/blog/${params.slug}`,
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = getAdjacentPosts(post.slug, posts);
  const relatedPosts = getPostsByTags(post.tags, posts).filter((p) => p.slug !== post.slug);
  const allTags = getAllSiteTags();

  return (
    <article>
      <div className="font-mono text-xs text-muted">
        {post.date} &nbsp;{post.git.hash} &nbsp;
        <span className="text-diff-add">+{post.git.added}</span>{" "}
        <span className="text-diff-remove">-{post.git.removed}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">{post.title}</h1>
      <div className="prose-content mt-6 text-ink">
        <PostMarkdown content={post.content} />
      </div>
      {(previous || next) && (
        <nav
          aria-label="Post navigation"
          className="mt-10 flex justify-between gap-4 font-mono text-sm text-diff-add"
        >
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
      {relatedPosts.length > 0 && (
        <section className="mt-10">
          <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Related posts</h2>
          <div className="mt-4">
            <Timeline items={relatedPosts} basePath="/blog" allTags={allTags} />
          </div>
        </section>
      )}
    </article>
  );
}
```

- [ ] **Step 10: `app/projects/page.tsx`** — compute and pass `allTags` to each `ProjectCard`

```tsx
import { getAllProjects } from "@/lib/content/projects";
import { getAllSiteTags } from "@/lib/content/tags";
import { ProjectCard } from "@/components/ProjectCard";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Projects",
  description: "Project write-ups from Sh3ll-M, rendered as a git commit log.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getAllProjects();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Projects</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            title={project.title}
            excerpt={project.excerpt}
            tags={project.tags}
            allTags={allTags}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 11: `app/projects/tags/page.tsx`** — compute and pass `allTags` directly to `TagChip`

```tsx
import { TagChip } from "@/components/TagChip";
import { getAllProjectTags } from "@/lib/content/projects";
import { getAllSiteTags } from "@/lib/content/tags";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Project Tags",
  description: "Browse Sh3ll-M's projects by tag.",
  path: "/projects/tags",
});

export default function ProjectTagsPage() {
  const tags = getAllProjectTags();
  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Tags</h1>
      <ul className="mt-6 flex flex-wrap gap-3 font-mono text-sm">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <TagChip tag={tag} allTags={allTags} href={`/projects/tags/${tag}`} count={count} className="px-3 py-1" />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 12: `app/projects/tags/[tag]/page.tsx`** — compute and pass `allTags` to each `ProjectCard`

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjectTags, getProjectsByTag } from "@/lib/content/projects";
import { getAllSiteTags } from "@/lib/content/tags";
import { ProjectCard } from "@/components/ProjectCard";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllProjectTags().map(({ tag }) => ({ tag }));
}

export function generateMetadata({ params }: { params: { tag: string } }) {
  const projects = getProjectsByTag(params.tag);

  return buildMetadata({
    title: `Projects tagged "${params.tag}"`,
    description: `${projects.length} project${projects.length === 1 ? "" : "s"} tagged "${params.tag}" on Sh3ll-M.`,
    path: `/projects/tags/${encodeURIComponent(params.tag)}`,
  });
}

export default function ProjectTagPage({ params }: { params: { tag: string } }) {
  const projects = getProjectsByTag(params.tag);

  if (projects.length === 0) {
    notFound();
  }

  const allTags = getAllSiteTags();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">
        Projects tagged{" "}
        <Link
          href="/projects"
          className="text-diff-add hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
          title="Clear filter"
        >
          {params.tag}
        </Link>
      </h1>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            slug={project.slug}
            title={project.title}
            excerpt={project.excerpt}
            tags={project.tags}
            allTags={allTags}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 13: `app/projects/[slug]/page.tsx`** — compute and pass `allTags` to the related-posts `Timeline`

```tsx
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { getPostsByTags } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { PostMarkdown } from "@/lib/content/markdown";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    return buildMetadata({
      title: "Not Found",
      description: "This project doesn't exist.",
      path: `/projects/${params.slug}`,
    });
  }

  return buildMetadata({
    title: project.title,
    description: project.excerpt,
    path: `/projects/${project.slug}`,
  });
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = getProjectBySlug(params.slug);

  if (!project) {
    notFound();
  }

  const relatedPosts = getPostsByTags(project.tags);
  const allTags = getAllSiteTags();

  return (
    <article>
      <div className="font-mono text-xs text-muted">
        {project.date} &nbsp;{project.git.hash} &nbsp;
        <span className="text-diff-add">+{project.git.added}</span>{" "}
        <span className="text-diff-remove">-{project.git.removed}</span>
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink">{project.title}</h1>
      <div className="mt-4 flex gap-4 font-mono text-sm text-diff-add">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            repo
          </a>
        )}
        {project.demoUrl && (
          <a href={project.demoUrl} target="_blank" rel="noreferrer">
            demo
          </a>
        )}
      </div>
      <div className="prose-content mt-6 text-ink">
        <PostMarkdown content={project.content} />
      </div>
      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Related posts</h2>
        {relatedPosts.length > 0 ? (
          <div className="mt-4">
            <Timeline items={relatedPosts} basePath="/blog" allTags={allTags} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No posts yet — check back soon.</p>
        )}
      </section>
    </article>
  );
}
```

- [ ] **Step 14: Run typecheck**

Run: `npm run typecheck`
Expected: PASS, no errors. (This is the first point at which the codebase compiles again since Step 1 — if anything is missing an `allTags` prop, this fails here.)

- [ ] **Step 15: Run the full test suite**

Run: `npm test`
Expected: PASS, all existing tests plus Task 1/2's new tests.

- [ ] **Step 16: Verify with the dev server**

Run: `npm run dev`, then check in the browser:
- `/` and `/blog` — timeline entries' tag chips are colored; `n8n` (on the FRED post) and `necromunda` no longer share a color anywhere (necromunda only appears on the projects side, but confirm by comparing `/blog`'s `n8n` chip color against `/projects`' `necromunda` chip color — they must differ).
- `/blog/hello-world` — the `meta` tag chip renders in white/ink color (`#e8e6e1`), not one of the 10 palette hues.
- `/projects` — `ProjectCard` chips are colored, still non-interactive (no hover color change, confirmed in the prior task).
- `/blog/tags` and `/projects/tags` — every tag chip has a distinct color; `power-bi` (which appears on both a post and a project) shows the *same* color in both `/blog/tags` and `/projects/tags`.
- A post or project detail page with related content (e.g. a post tagged `power-bi`) — the related-posts `Timeline` renders chips with the same colors as everywhere else.

Stop the dev server after checking.

- [ ] **Step 17: Run the production build**

Run: `npm run build`
Expected: PASS. (If it fails only on an `opengraph-image` route with `TypeError: Invalid URL`, that's the pre-existing Windows-only `@vercel/og` bug documented in this repo's project history — unrelated to this task.)

- [ ] **Step 18: Commit**

```bash
git add components/TagChip.tsx components/Timeline.tsx components/TimelineEntry.tsx components/ProjectCard.tsx app/page.tsx app/blog/page.tsx app/blog/tags/page.tsx "app/blog/tags/[tag]/page.tsx" "app/blog/[slug]/page.tsx" app/projects/page.tsx app/projects/tags/page.tsx "app/projects/tags/[tag]/page.tsx" "app/projects/[slug]/page.tsx"
git commit -m "feat: thread site-wide tag list through chip components for unique colors"
```
