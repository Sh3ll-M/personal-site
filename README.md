# personal-site

Matthew's personal site — CV, blog, and projects, styled around the idea that the
whole thing is basically git you can read: each post and project renders as a
"commit" with a real hash and diffstat pulled from this repo's own history, laid
out as a vertical timeline.

## What's here

- **Home** — landing page with a teaser of recent posts
- **Blog** (`/blog`) — full timeline of posts, each entry showing a real commit
  hash + diffstat derived from that post's git history
- **Projects** (`/projects`) — portfolio grid, same git-flavored detail pages
- **CV** (`/cv`) — on-page resume (currently placeholder content — swap in the
  real thing before sharing this link around)
- **404** — a git-themed not-found page

## Stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) for styling, with a small dark-mode
  design token layer (palette/type in `app/globals.css` and `tailwind.config.ts`)
- [Framer Motion](https://www.framer.com/motion/) for the page-load and
  scroll-reveal animation (respects `prefers-reduced-motion`)
- Content is plain Markdown with frontmatter (`content/posts/`,
  `content/projects/`), parsed with [gray-matter](https://github.com/jonschlinkert/gray-matter)
  and validated with [Zod](https://zod.dev/) — a malformed post fails the build
  loudly instead of shipping broken
- Post/project content is rendered with a [unified](https://unifiedjs.com/)
  pipeline ([remark-gfm](https://github.com/remarkjs/remark-gfm) +
  [rehype-pretty-code](https://rehype-pretty.pages.dev/) on
  [Shiki](https://shiki.style/) for syntax highlighting)
- [Vitest](https://vitest.dev/) covers the content-loading logic
  (`lib/content/*`) — schema validation, git-metadata parsing, sorting/slug
  derivation
- No database, no auth, no CMS — publishing is `git push`. Deployed on
  [Vercel](https://vercel.com/).

## Writing a post or project

Drop a `.md` file in `content/posts/` or `content/projects/` with frontmatter:

```markdown
---
title: "Post title"
date: "2026-07-19"
tags: ["some", "tags"]
excerpt: "One-line summary shown in the timeline."
---

Body content here.
```

Commit and push — the commit hash and diffstat shown next to the post are
derived automatically from that file's own git history, not hand-typed.

To embed an image in a post, drop the file under
`public/images/posts/<slug>/<filename>` and reference it from the post's
Markdown as `/images/posts/<slug>/<filename>` (standard `![alt](src)` syntax).

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # run the content-pipeline test suite
npm run build     # production build
```

## Background

Design spec and implementation plan for how this was built live under
[`docs/superpowers/`](docs/superpowers/).
