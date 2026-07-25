# Project Related-Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `/projects` into more of a category grid — add three new project entries (Power BI, N8N, Necromunda) and make each project's detail page automatically show blog posts that share a tag with it.

**Architecture:** No schema changes. `Post` and `Project` already share the same base frontmatter shape (`title`, `date`, `tags`, `excerpt`) from `lib/content/schema.ts`. A new `getPostsByTags(tags: string[])` helper in `lib/content/posts.ts` returns any post sharing at least one tag with the given list. The project detail page (`app/projects/[slug]/page.tsx`) calls this with `project.tags` and renders the result through the existing `Timeline` component, with honest empty-state copy when there are no matches yet.

**Tech Stack:** Next.js (App Router) + TypeScript, Zod-validated markdown frontmatter (gray-matter), Vitest.

## Global Constraints

- No new frontmatter field for a "canonical tag" — matching is driven entirely by each project's existing `tags` array.
- No changes to `/blog`, `/blog/tags`, or `/projects/tags` — those are out of scope.
- No repo/demo links except Necromunda's `repoUrl: "https://github.com/Sh3ll-M/necromunda-scenario-generator"` — Power BI and N8N have none.
- New content files use date `"2026-07-25"`.
- Empty-state copy for a project with no related posts is exactly: `No posts yet — check back soon.`
- Full spec: `docs/superpowers/specs/2026-07-25-project-related-posts-design.md`

---

### Task 1: Add `getPostsByTags` helper

**Files:**
- Modify: `lib/content/posts.ts`
- Test: `lib/content/posts.test.ts`

**Interfaces:**
- Consumes: existing `Post` type and `getAllPosts` from `lib/content/posts.ts` (already in this file).
- Produces: `getPostsByTags(tags: string[], posts: Post[] = getAllPosts()): Post[]` — used by Task 3.

- [ ] **Step 1: Write the failing tests**

Add this `describe` block to the end of `lib/content/posts.test.ts` (it already has `fakePosts` defined above — reuse it, don't redeclare):

```ts
describe("getPostsByTags", () => {
  it("returns posts that share at least one tag with the given list", () => {
    expect(getPostsByTags(["meta"], fakePosts).map((p) => p.slug)).toEqual(["a-post"]);
  });

  it("returns posts matching any of several tags, no duplicates", () => {
    expect(getPostsByTags(["git", "meta"], fakePosts).map((p) => p.slug)).toEqual([
      "a-post",
      "b-post",
    ]);
  });

  it("returns an empty array when no post matches any given tag", () => {
    expect(getPostsByTags(["nonexistent"], fakePosts)).toEqual([]);
  });

  it("returns an empty array when given an empty tag list", () => {
    expect(getPostsByTags([], fakePosts)).toEqual([]);
  });
});
```

Update the import at the top of `lib/content/posts.test.ts` from:

```ts
import { getAllPosts, getPostBySlug, getAllTags, getPostsByTag, type Post } from "./posts";
```

to:

```ts
import { getAllPosts, getPostBySlug, getAllTags, getPostsByTag, getPostsByTags, type Post } from "./posts";
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/content/posts.test.ts`
Expected: FAIL — `getPostsByTags is not a function` (or similar, since it doesn't exist yet).

- [ ] **Step 3: Implement `getPostsByTags`**

In `lib/content/posts.ts`, add this function after the existing `getPostsByTag`:

```ts
export function getPostsByTags(tags: string[], posts: Post[] = getAllPosts()): Post[] {
  return posts.filter((post) => post.tags.some((tag) => tags.includes(tag)));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/content/posts.test.ts`
Expected: PASS, all tests in the file green.

- [ ] **Step 5: Commit**

```bash
git add lib/content/posts.ts lib/content/posts.test.ts
git commit -m "feat: add getPostsByTags helper for cross-linking posts to projects"
```

---

### Task 2: Add three new project content files

**Files:**
- Create: `content/projects/power-bi.md`
- Create: `content/projects/n8n.md`
- Create: `content/projects/necromunda.md`

**Interfaces:**
- Consumes: existing `Project` frontmatter shape from `lib/content/projects.ts` (`title`, `date`, `tags`, `excerpt`, optional `repoUrl`/`demoUrl`) — no code changes in this task, content only.
- Produces: three project entries that `getAllProjects()` (used by Task 3, the projects grid, and the sitemap) will pick up automatically since it reads every `.md` file in `content/projects/`.

- [ ] **Step 1: Create `content/projects/power-bi.md`**

```markdown
---
title: "Working with Microsoft BI"
date: "2026-07-25"
tags: ["power-bi"]
excerpt: "A running log of Power BI dashboards, reports, and integrations."
---

Posts about building and extending Power BI dashboards and reports —
including experiments wiring in Azure OpenAI for lightweight analysis.
See the posts below as they're published.
```

- [ ] **Step 2: Create `content/projects/n8n.md`**

```markdown
---
title: "Automation Workflows in N8N"
date: "2026-07-25"
tags: ["n8n"]
excerpt: "Self-hosted automation experiments and workflows built in n8n."
---

A collection of self-hosted automation workflows built in n8n. See the
posts below as they're published.
```

- [ ] **Step 3: Create `content/projects/necromunda.md`**

```markdown
---
title: "Hobby Project - Necromunda Scenario Generator"
date: "2026-07-25"
tags: ["necromunda"]
excerpt: "A scenario generator for Necromunda: Underhive, built as a hobby project."
repoUrl: "https://github.com/Sh3ll-M/necromunda-scenario-generator"
---

A scenario generator for tabletop Necromunda campaigns — see the repo for
the code, and the posts below for write-ups as they happen.
```

- [ ] **Step 4: Verify the new files parse correctly**

Run: `npx vitest run lib/content/projects.test.ts`
Expected: PASS (this test file uses fake fs data, so it won't touch the new
files directly — this step just confirms nothing in the projects loader
broke). Then run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add content/projects/power-bi.md content/projects/n8n.md content/projects/necromunda.md
git commit -m "feat: add Power BI, N8N, and Necromunda project entries"
```

---

### Task 3: Show related posts on the project detail page

**Files:**
- Modify: `app/projects/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPostsByTags` from `lib/content/posts.ts` (Task 1), `Timeline` component from `@/components/Timeline` (existing — accepts `items: TimelineItem[]` where `TimelineItem` needs `slug`, `title`, `excerpt`, `date`, `git: { hash, added, removed }`, optional `tags` — `Post` already satisfies this shape exactly).
- Produces: no new exports — this is a leaf page component.

- [ ] **Step 1: Update imports and compute related posts**

In `app/projects/[slug]/page.tsx`, change the top imports from:

```tsx
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { PostMarkdown } from "@/lib/content/markdown";
import { buildMetadata } from "@/lib/metadata";
```

to:

```tsx
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/lib/content/projects";
import { getPostsByTags } from "@/lib/content/posts";
import { PostMarkdown } from "@/lib/content/markdown";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/metadata";
```

Then, inside `ProjectPage`, after the existing `if (!project) { notFound(); }` check, add:

```tsx
  const relatedPosts = getPostsByTags(project.tags);
```

- [ ] **Step 2: Render the "Related posts" section**

Replace the closing of the `<article>` — change:

```tsx
      <div className="prose-content mt-6 text-ink">
        <PostMarkdown content={project.content} />
      </div>
    </article>
  );
}
```

to:

```tsx
      <div className="prose-content mt-6 text-ink">
        <PostMarkdown content={project.content} />
      </div>
      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wide text-muted">Related posts</h2>
        {relatedPosts.length > 0 ? (
          <div className="mt-4">
            <Timeline items={relatedPosts} basePath="/blog" />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">No posts yet — check back soon.</p>
        )}
      </section>
    </article>
  );
}
```

- [ ] **Step 3: Verify types and existing tests still pass**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npx vitest run`
Expected: all existing test files still pass (this task adds no new test
file — the underlying `getPostsByTags` logic is already covered by
Task 1's tests, and this page has no existing test file to extend,
consistent with the rest of `app/**/page.tsx` in this codebase).

- [ ] **Step 4: Commit**

```bash
git add app/projects/[slug]/page.tsx
git commit -m "feat: show related posts on project detail pages"
```

---

### Task 4: Manual visual verification

**Files:** none (verification only)

**Interfaces:** none — this task consumes the finished feature from Tasks 1-3.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background)

- [ ] **Step 2: Check `/projects` shows all four cards**

Navigate to `http://localhost:3000/projects` in the browser. Expected:
four cards — Personal Site, Working with Microsoft BI, Automation
Workflows in N8N, Hobby Project - Necromunda Scenario Generator — each
with an `<h2>` title (verify via browser inspection or accessibility
tree, not just visually, since this is where the earlier heading-skip fix
lives).

- [ ] **Step 3: Check the Power BI project page shows the existing post**

Navigate to `http://localhost:3000/projects/power-bi`. Expected: a
"Related posts" heading followed by a Timeline entry for "Calling Azure
OpenAI from Power BI" (the existing post, which carries the `power-bi`
tag).

- [ ] **Step 4: Check N8N and Necromunda show the empty state**

Navigate to `http://localhost:3000/projects/n8n` and
`http://localhost:3000/projects/necromunda`. Expected on both: a "Related
posts" heading followed by the text `No posts yet — check back soon.`
(no Timeline, no error).

- [ ] **Step 5: Check the Necromunda repo link renders**

On `http://localhost:3000/projects/necromunda`, expected: a "repo" link
near the top pointing to
`https://github.com/Sh3ll-M/necromunda-scenario-generator`. Confirm Power
BI and N8N pages show no repo/demo links (neither has one).

No commit for this task — it's verification of Tasks 1-3, which are
already committed.
