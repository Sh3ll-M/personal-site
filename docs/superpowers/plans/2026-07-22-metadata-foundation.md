# Metadata Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every route in the site a real `<title>`/description, a sitewide title template, and `sitemap.xml`/`robots.txt`, per `docs/superpowers/specs/2026-07-22-metadata-foundation-design.md`.

**Architecture:** A shared `lib/metadata.ts` helper (`buildMetadata`) builds a consistent `Metadata` object (title, description, canonical URL, OpenGraph fields) for every page. The root layout sets a title template (`"%s | Sh3ll-M"`). Static routes hand-write `export const metadata`; dynamic routes (`[slug]`, `[tag]`) use `generateMetadata`. `app/sitemap.ts` and `app/robots.ts` use Next.js's file-convention metadata routes.

**Tech Stack:** Next.js 14.2 (App Router, pages use synchronous `params`, not the async-params API from Next 15), TypeScript, Vitest (colocated `*.test.ts`, `environment: "node"`, `@/*` path alias to repo root).

## Global Constraints

- Sitewide brand/title-template suffix is **"Sh3ll-M"** (GitHub handle), not Matthew's full name — decided during brainstorming 2026-07-22. Full name is reserved for the CV page content itself (out of scope for this plan).
- `SITE_URL` (from `lib/site.ts`) has no trailing slash: `https://personal-site-ecru-eta-23.vercel.app` (or `NEXT_PUBLIC_SITE_URL` override).
- Tag pages (`/blog/tags/*`, `/projects/tags/*`) are excluded from `sitemap.ts` — thin/duplicate-content pages.
- No manual OpenGraph *image* wiring — `opengraph-image.tsx` files already exist per post/project and Next.js auto-attaches them.
- Follow this repo's existing dependency-injection test pattern (see `lib/content/posts.test.ts`): functions take optional injected data/fs so tests don't touch the real filesystem or `git`.

---

### Task 1: `lib/metadata.ts` helper

**Files:**
- Create: `lib/metadata.ts`
- Test: `lib/metadata.test.ts`

**Interfaces:**
- Produces: `buildMetadata(input: { title: string; description: string; path: string }): Metadata` — used by every page task below. `path` is a leading-slash route like `"/blog"` or `"/blog/my-post"`; `"/"` for the home page.
- Produces: `SITE_NAME = "Sh3ll-M"` (exported constant), reused by Task 2's title template.

- [ ] **Step 1: Write the failing test**

Create `lib/metadata.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildMetadata, SITE_NAME } from "./metadata";

describe("buildMetadata", () => {
  it("sets title and description verbatim", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.title).toBe("Blog");
    expect(result.description).toBe("All posts.");
  });

  it("builds an absolute canonical URL from the path", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.alternates?.canonical).toBe("https://personal-site-ecru-eta-23.vercel.app/blog");
  });

  it("handles the root path without a double slash", () => {
    const result = buildMetadata({ title: "Home", description: "Homepage.", path: "/" });
    expect(result.alternates?.canonical).toBe("https://personal-site-ecru-eta-23.vercel.app/");
  });

  it("mirrors title/description/url into openGraph", () => {
    const result = buildMetadata({ title: "Blog", description: "All posts.", path: "/blog" });
    expect(result.openGraph).toEqual({
      title: "Blog",
      description: "All posts.",
      url: "https://personal-site-ecru-eta-23.vercel.app/blog",
    });
  });

  it("exports the site name used for the title template", () => {
    expect(SITE_NAME).toBe("Sh3ll-M");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/metadata.test.ts`
Expected: FAIL — `Cannot find module './metadata'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `lib/metadata.ts`:

```ts
import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_NAME = "Sh3ll-M";

export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = new URL(path, SITE_URL).toString();

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/metadata.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/metadata.ts lib/metadata.test.ts
git commit -m "feat: add shared buildMetadata helper"
```

---

### Task 2: Root layout title template and default description

**Files:**
- Modify: `app/layout.tsx:8-10`

**Interfaces:**
- Consumes: `SITE_NAME` from Task 1's `lib/metadata.ts`.

- [ ] **Step 1: Update the metadata export**

In `app/layout.tsx`, add the import and replace the `metadata` export:

```ts
import { SITE_NAME } from "@/lib/metadata";
```

```ts
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Sh3ll-M — CV, blog posts, and project write-ups, rendered as a git commit log.",
};
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add sitewide title template and default description"
```

---

### Task 3: Static page metadata (6 routes)

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/cv/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/projects/page.tsx`
- Modify: `app/blog/tags/page.tsx`
- Modify: `app/projects/tags/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata` from Task 1.

- [ ] **Step 1: Add metadata to `app/page.tsx`**

Add near the top (after existing imports):

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Home",
  description: "Recent posts and projects from Sh3ll-M, presented as a git commit log.",
  path: "/",
});
```

- [ ] **Step 2: Add metadata to `app/cv/page.tsx`**

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "CV",
  description: "Sh3ll-M's CV — experience, skills, and background.",
  path: "/cv",
});
```

- [ ] **Step 3: Add metadata to `app/blog/page.tsx`**

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog",
  description: "All blog posts from Sh3ll-M, rendered as a git commit log.",
  path: "/blog",
});
```

- [ ] **Step 4: Add metadata to `app/projects/page.tsx`**

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Projects",
  description: "Project write-ups from Sh3ll-M, rendered as a git commit log.",
  path: "/projects",
});
```

- [ ] **Step 5: Add metadata to `app/blog/tags/page.tsx`**

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Blog Tags",
  description: "Browse Sh3ll-M's blog posts by tag.",
  path: "/blog/tags",
});
```

- [ ] **Step 6: Add metadata to `app/projects/tags/page.tsx`**

```ts
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Project Tags",
  description: "Browse Sh3ll-M's projects by tag.",
  path: "/projects/tags",
});
```

- [ ] **Step 7: Verify with typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed with no errors. (If the build fails specifically on the `opengraph-image.tsx` routes with `TypeError: Invalid URL`, that's the known Windows-only `@vercel/og` bug documented in project memory — unrelated to this change; verify those routes via a Vercel preview instead.)

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx app/cv/page.tsx app/blog/page.tsx app/projects/page.tsx app/blog/tags/page.tsx app/projects/tags/page.tsx
git commit -m "feat: add metadata to static pages"
```

---

### Task 4: Post/project detail page metadata

**Files:**
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata` from Task 1, `getPostBySlug`/`getProjectBySlug` (already imported in these files).

- [ ] **Step 1: Add `generateMetadata` to `app/blog/[slug]/page.tsx`**

Add the import and function (place after `generateStaticParams`, before the default export):

```ts
import { buildMetadata } from "@/lib/metadata";
```

```ts
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
```

- [ ] **Step 2: Add `generateMetadata` to `app/projects/[slug]/page.tsx`**

Add the import and function (place after `generateStaticParams`, before the default export):

```ts
import { buildMetadata } from "@/lib/metadata";
```

```ts
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
```

- [ ] **Step 3: Verify with typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed with no errors (same caveat about the `opengraph-image.tsx` Windows bug as Task 3 applies here too, since it affects the same route segments).

- [ ] **Step 4: Commit**

```bash
git add "app/blog/[slug]/page.tsx" "app/projects/[slug]/page.tsx"
git commit -m "feat: add generateMetadata to post/project detail pages"
```

---

### Task 5: Tag page metadata

**Files:**
- Modify: `app/blog/tags/[tag]/page.tsx`
- Modify: `app/projects/tags/[tag]/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata` from Task 1, `getPostsByTag`/`getProjectsByTag` (already imported in these files).

- [ ] **Step 1: Add `generateMetadata` to `app/blog/tags/[tag]/page.tsx`**

Add the import and function (place after `generateStaticParams`, before the default export):

```ts
import { buildMetadata } from "@/lib/metadata";
```

```ts
export function generateMetadata({ params }: { params: { tag: string } }) {
  const posts = getPostsByTag(params.tag);

  return buildMetadata({
    title: `Posts tagged "${params.tag}"`,
    description: `${posts.length} post${posts.length === 1 ? "" : "s"} tagged "${params.tag}" on Sh3ll-M.`,
    path: `/blog/tags/${params.tag}`,
  });
}
```

- [ ] **Step 2: Add `generateMetadata` to `app/projects/tags/[tag]/page.tsx`**

Add the import and function (place after `generateStaticParams`, before the default export):

```ts
import { buildMetadata } from "@/lib/metadata";
```

```ts
export function generateMetadata({ params }: { params: { tag: string } }) {
  const projects = getProjectsByTag(params.tag);

  return buildMetadata({
    title: `Projects tagged "${params.tag}"`,
    description: `${projects.length} project${projects.length === 1 ? "" : "s"} tagged "${params.tag}" on Sh3ll-M.`,
    path: `/projects/tags/${params.tag}`,
  });
}
```

- [ ] **Step 3: Verify with typecheck and build**

Run: `npm run typecheck && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/blog/tags/[tag]/page.tsx" "app/projects/tags/[tag]/page.tsx"
git commit -m "feat: add generateMetadata to tag pages"
```

---

### Task 6: `app/sitemap.ts`

**Files:**
- Create: `app/sitemap.ts`
- Test: `app/sitemap.test.ts`

**Interfaces:**
- Consumes: `Post` (from `@/lib/content/posts`), `Project` (from `@/lib/content/projects`), `SITE_URL` (from `@/lib/site`).
- Produces: `buildSitemap(posts: Post[], projects: Project[]): MetadataRoute.Sitemap` (exported for the test); default export `sitemap()` is Next's file-convention entry point calling `buildSitemap(getAllPosts(), getAllProjects())`.

- [ ] **Step 1: Write the failing test**

Create `app/sitemap.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildSitemap } from "./sitemap";
import type { Post } from "@/lib/content/posts";
import type { Project } from "@/lib/content/projects";

const fakeGit = { hash: "abc123", date: "2026-07-01", added: 10, removed: 0 };

const fakePosts: Post[] = [
  { slug: "a-post", title: "A Post", date: "2026-07-01", tags: [], excerpt: "A", content: "", git: fakeGit },
];

const fakeProjects: Project[] = [
  { slug: "a-project", title: "A Project", date: "2026-07-02", tags: [], excerpt: "A", content: "", git: fakeGit },
];

describe("buildSitemap", () => {
  it("includes the static routes", () => {
    const urls = buildSitemap(fakePosts, fakeProjects).map((entry) => entry.url);
    expect(urls).toEqual(
      expect.arrayContaining([
        "https://personal-site-ecru-eta-23.vercel.app/",
        "https://personal-site-ecru-eta-23.vercel.app/cv",
        "https://personal-site-ecru-eta-23.vercel.app/blog",
        "https://personal-site-ecru-eta-23.vercel.app/projects",
      ])
    );
  });

  it("includes one entry per post, using its date as lastModified", () => {
    const sitemap = buildSitemap(fakePosts, fakeProjects);
    const entry = sitemap.find((e) => e.url === "https://personal-site-ecru-eta-23.vercel.app/blog/a-post");
    expect(entry?.lastModified).toBe("2026-07-01");
  });

  it("includes one entry per project, using its date as lastModified", () => {
    const sitemap = buildSitemap(fakePosts, fakeProjects);
    const entry = sitemap.find((e) => e.url === "https://personal-site-ecru-eta-23.vercel.app/projects/a-project");
    expect(entry?.lastModified).toBe("2026-07-02");
  });

  it("excludes tag pages", () => {
    const urls = buildSitemap(fakePosts, fakeProjects).map((entry) => entry.url);
    expect(urls.some((url) => url.includes("/tags"))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/sitemap.test.ts`
Expected: FAIL — `Cannot find module './sitemap'` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts, type Post } from "@/lib/content/posts";
import { getAllProjects, type Project } from "@/lib/content/projects";

export function buildSitemap(posts: Post[], projects: Project[]): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/cv` },
    { url: `${SITE_URL}/blog` },
    { url: `${SITE_URL}/projects` },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: project.date,
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(getAllPosts(), getAllProjects());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/sitemap.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/sitemap.ts app/sitemap.test.ts
git commit -m "feat: add sitemap.xml generation"
```

---

### Task 7: `app/robots.ts`

**Files:**
- Create: `app/robots.ts`

**Interfaces:**
- Consumes: `SITE_URL` from `@/lib/site`.

- [ ] **Step 1: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/robots.ts
git commit -m "feat: add robots.txt generation"
```

---

### Task 8: Full verification and push

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass, including the new `lib/metadata.test.ts` and `app/sitemap.test.ts`.

- [ ] **Step 2: Run lint and typecheck**

Run: `npm run lint && npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: succeeds. (If it fails only on the two `opengraph-image.tsx` routes with `TypeError: Invalid URL`, that's the pre-existing Windows-only `@vercel/og` bug — confirm the rest of the build succeeded and note this is expected, per project memory.)

- [ ] **Step 4: Manual spot-check via dev server**

Run: `npm run dev` (in the background), then in a browser or via `curl`:
- View source on `/`, `/blog`, `/blog/<a-real-slug>`, `/blog/tags/<a-real-tag>` and confirm `<title>` reads `"<Page Title> | Sh3ll-M"` and a `<meta name="description">` is present.
- `curl http://localhost:3000/robots.txt` — confirm it lists `Allow: /` and a `Sitemap:` line.
- `curl http://localhost:3000/sitemap.xml` — confirm it lists the static routes plus one `<url>` per post/project, and no `/tags` URLs.

Stop the dev server once confirmed.

- [ ] **Step 5: Push to origin**

```bash
git push
```
