# Projects as categories: related-posts linking + 3 new project entries

## Problem

The `/projects` page currently has exactly one entry ("Personal Site"), which
describes the site recursively. Meanwhile `/blog` has real posts (e.g. the
Power BI / Azure OpenAI write-up) with no connection back to a project. The
site's "projects" and "blog" collections are structurally identical
(same frontmatter shape, same tag infrastructure) but functionally
disconnected.

Matthew wants projects to behave more like categories: a small number of
project "boxes" (Personal Site, Power BI, N8N, Necromunda, ...) where each
project's page shows the blog posts relevant to it, without hand-maintaining
a list of which posts belong where.

## Goals

- Add three new project entries: Power BI, N8N, Necromunda.
- A project's detail page shows the blog posts related to it, driven
  automatically by shared tags — publishing a future post tagged
  `power-bi` should make it appear under the Power BI project with zero
  additional bookkeeping.
- A post may relate to more than one project (a post can carry tags
  belonging to multiple projects' tag sets).
- Projects with no related posts yet (true today for N8N and Necromunda)
  show honest empty-state copy, not a fake placeholder.

## Non-goals

- No change to `/blog`, `/blog/tags`, or `/projects/tags` — those keep
  working exactly as they do today, scoped to their own collection.
- No new frontmatter field for "canonical tag" — see mechanism below.
- No visual redesign of the project grid/card — out of scope, a separate
  visual pass is planned later.
- No repo/demo links for Power BI or N8N (none exist yet).

## Mechanism: shared tags, no schema change

`Post` and `Project` already share the same base `frontmatterSchema`
(`lib/content/schema.ts`), which includes a required `tags: string[]`.
Rather than adding a new "canonical tag" field to the project schema, a
project's own `tags` array **is** the matching criteria: a post is
"related" to a project if it shares **any** tag with that project's `tags`.

This requires one new helper in `lib/content/posts.ts`, alongside the
existing `getPostsByTag`:

```ts
export function getPostsByTags(tags: string[], posts: Post[] = getAllPosts()): Post[] {
  return posts.filter((post) => post.tags.some((tag) => tags.includes(tag)));
}
```

The existing Power BI post already has
`tags: ["power-bi", "power-query", "azure-openai"]`. Giving the new Power
BI project `tags: ["power-bi"]` makes it show up automatically.

## New content files

Three new files under `content/projects/`, following the existing
frontmatter shape (`title`, `date`, `tags`, `excerpt`, plus optional
`repoUrl`/`demoUrl` from the project-specific schema extension in
`lib/content/projects.ts`). Dates use today (2026-07-25); real git
hash/diffstat are derived automatically from each file's own commit
history the same way all existing content is, once committed.

**`content/projects/power-bi.md`**
```
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

**`content/projects/n8n.md`**
```
---
title: "Automation Workflows in N8N"
date: "2026-07-25"
tags: ["n8n"]
excerpt: "Self-hosted automation experiments and workflows built in n8n."
---

A collection of self-hosted automation workflows built in n8n. See the
posts below as they're published.
```

**`content/projects/necromunda.md`**
```
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

The existing `example-project.md` ("Personal Site") is untouched — it
remains a genuine, real entry (this site really is a project), just no
longer the only one.

## Project detail page: "Related posts" section

`app/projects/[slug]/page.tsx` gains a new block below the existing
write-up (`PostMarkdown` content), reusing the existing `Timeline`
component (already used on `/blog` and `/blog/tags/[tag]`):

```tsx
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
```

where `relatedPosts = getPostsByTags(project.tags)`. This keeps the
heading hierarchy correct (`<h1>` project title → `<h2>` "Related posts"),
consistent with the heading-skip fix already applied to `ProjectCard`.

## Testing

- Unit test for `getPostsByTags` in `lib/content/posts.test.ts`, mirroring
  the existing `getPostsByTag` tests: matches on any shared tag, returns
  empty array when nothing matches, handles a project with multiple tags.
- No test changes needed for `getAllProjects`/schema — the three new files
  use the existing, already-validated frontmatter shape.
- Manual/visual check via the browser: `/projects` shows 4 cards; the
  Power BI project page shows the existing Azure OpenAI post under
  "Related posts"; N8N and Necromunda project pages show the empty-state
  copy.

## Open questions

None — Matthew approved this design as presented, including the draft
excerpt/body copy above (editable later, it's just content).
