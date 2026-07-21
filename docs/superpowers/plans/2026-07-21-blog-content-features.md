# Blog Content Features Implementation Plan

**Goal:** Three independent content/discovery features for the blog: (1) styled,
storage-conventioned images in post Markdown, (2) tag-based browsing for posts
(with a trivial extension to projects), (3) dynamic per-post OG share images.

**Architecture:** No pipeline or schema changes needed for images — `remark`/`rehype`
already emits plain `<img>` from `![alt](src)` syntax; this is pure CSS + a
storage convention. Tags reuse the existing `tags: string[]` frontmatter field
already validated by the shared `frontmatterSchema`; new pure functions in
`lib/content/posts.ts` aggregate/filter, consumed by new static routes under
`app/blog/tags/`. OG images use Next's built-in `opengraph-image.tsx` file
convention (`next/og`'s `ImageResponse`), which renders independently of the
site's own font loader/CSS — a system font stack standing in for the site's
type is an explicit, accepted trade-off per the constraints below.

**Tech Stack:** No new dependencies for Tasks 1–2. Task 3 uses `next/og`
(bundled with Next 14, no install needed). Also adding `eslint` +
`eslint-config-next` as devDependencies purely so `npm run lint` can run
non-interactively — the previous feature (syntax highlighting) explicitly
skipped lint because `next lint` prompts to scaffold a config on first run;
since this plan's verification requires lint to pass, that gap needs closing
first.

## Global Constraints

- Do not route images through `next/image` — content HTML is injected via
  `dangerouslySetInnerHTML`, so a plain styled `<img>` is correct and consistent.
- Tag chip styling must reuse the existing mono/muted/bordered convention
  already used for diffstat text and `ProjectCard`'s tag chips — no new visual
  language introduced.
- `metadataBase` must read from an env var with the live `vercel.app` URL as
  fallback default, never hardcoded in more than one place.
- OG images don't need to pixel-match site fonts (`next/og` can't use
  `next/font`) — a generic serif/mono system stack is acceptable.
- Blog is the core scope for tags and OG images; projects gets the same
  treatment only if it's a trivial, low-risk extension of the same helpers —
  it must not block finishing/verifying the blog versions.

---

### Task 0: Tooling — non-interactive ESLint config

**Files:** Modify `package.json`; Create `.eslintrc.json`

- [ ] Install `eslint` + `eslint-config-next` as devDependencies (versions
      matching the installed `next@14.2.x` line).
- [ ] Add `.eslintrc.json`: `{ "extends": "next/core-web-vitals" }`.
- [ ] Verify `npm run lint` runs non-interactively and completes (clean or with
      fixable/ignorable warnings only) against the current, unmodified tree
      before starting feature work, so any new lint failures later are
      attributable to this plan's changes.
- [ ] Commit as its own small commit (tooling, not a feature).

---

### Task 1: Images embedded in blog posts

**Files:**
- Modify: `app/globals.css` (add `.prose-content img` rules)
- Modify: `lib/content/markdown.tsx` (export `renderMarkdown` for direct testing,
  if not already exported)
- Create: `lib/content/markdown.test.ts`
- Create: `public/images/posts/.gitkeep` (directory convention placeholder)
- Modify: `README.md` (one sentence documenting the convention)

**Design decisions:**
- Rounding matches `pre` (`0.375em`), border matches `pre`/`blockquote`
  (`1px solid var(--color-rule)`), `max-width: 100%; height: auto`, `margin: 1em auto`
  block-centered (image is centered when narrower than the content column;
  full-width images just fill it — `margin: ... auto` handles both since the
  image's own intrinsic width caps it).
- Storage convention: `public/images/posts/<slug>/<filename>`, referenced as
  `/images/posts/<slug>/<filename>` from markdown. A `.gitkeep` under
  `public/images/posts/` establishes the directory since there's no real image
  yet to commit.

- [ ] Add `.prose-content img` CSS.
- [ ] Export `renderMarkdown` from `lib/content/markdown.tsx` for direct unit
      testing (mirrors how other `lib/content` modules export their core
      functions for tests — `PostMarkdown` itself is an async Server Component
      and awkward to unit test directly).
- [ ] Add `lib/content/markdown.test.ts`: asserts `![alt](src)` renders an
      `<img>` tag with matching `src`/`alt` attributes.
- [ ] Add `public/images/posts/.gitkeep`.
- [ ] Add one sentence to `README.md`'s "Writing a post or project" section
      documenting the image path convention.
- [ ] Commit.

---

### Task 2: Tag-based browsing/filtering

**Files:**
- Modify: `components/Timeline.tsx`, `components/TimelineEntry.tsx` (accept/render `tags`)
- Modify: `lib/content/posts.ts` (add `getAllTags`, `getPostsByTag` helpers)
- Create: `lib/content/posts.test.ts` additions (new `describe` blocks)
- Create: `app/blog/tags/page.tsx`, `app/blog/tags/[tag]/page.tsx`
- Stretch (only if trivial): `lib/content/projects.ts` tag helpers +
  `app/projects/tags/page.tsx`, `app/projects/tags/[tag]/page.tsx`

**Design decisions:**
- Tag chips render as small `<Link>`s, not plain `<span>`s (chips are
  navigational here, unlike `ProjectCard`'s current decorative-only chips) —
  same visual treatment (mono, muted, bordered, `rounded`, `px-2 py-0.5`) but
  `hover:border-diff-add hover:text-ink` to signal interactivity, consistent
  with existing link/hover conventions elsewhere (e.g. `ProjectCard`'s
  `hover:border-diff-add`).
  own the link — a listing page like `/blog` doesn't need every entry's tags
  to be individually clickable away from the post itself, but tags **are**
  the point of this feature, so `TimelineItem`/`TimelineEntry` gets an
  optional `tags?: string[]` prop and renders chips when present and non-empty;
  callers that don't pass tags see no change in output.
- Tag URL slugging: tags are already free-form strings in frontmatter
  (`"nextjs"`, `"typescript"`, `"meta"` — all already lowercase/hyphen-safe in
  existing content); route param is the raw tag string, not re-slugified,
  since introducing a separate slugify layer isn't asked for and existing tags
  don't need it. `generateStaticParams` derives params from real tag values so
  this is exercised at build time regardless.
- `getAllTags`: returns `{ tag: string; count: number }[]` sorted alphabetically
  (simplest deterministic order, no spec preference given).
- `getPostsByTag`: filters `getAllPosts()` by exact tag match (case-sensitive,
  matching how tags are already compared nowhere else in the codebase — no
  existing normalization to be consistent with).

- [ ] Add `getAllTags(posts?)`/`getPostsByTag(tag, posts?)` to `lib/content/posts.ts`,
      taking posts as an optional injected param (default `getAllPosts()`) so
      tests can pass fixture arrays directly — simpler than threading the full
      `fsImpl` fixture through for pure aggregation logic.
- [ ] Unit tests for both helpers in `lib/content/posts.test.ts`.
- [ ] Extend `TimelineItem`/`Timeline`/`TimelineEntry` with optional `tags`.
- [ ] `app/blog/tags/page.tsx`: lists all tags + counts, links to
      `/blog/tags/<tag>`.
- [ ] `app/blog/tags/[tag]/page.tsx` + `generateStaticParams`: reuses
      `Timeline`, filtered.
- [ ] If trivial: mirror for projects reusing the same helper shape (separate
      `getAllProjectTags`/`getProjectsByTag` in `projects.ts`, since posts and
      projects are already parallel-but-separate modules with no shared base
      — don't introduce one now just for this).
- [ ] Commit.

---

### Task 3: Dynamic per-post OG images

**Files:**
- Create: `app/blog/[slug]/opengraph-image.tsx`
- Modify: `app/layout.tsx` (add `metadata.metadataBase`)
- Stretch (only if trivial): `app/projects/[slug]/opengraph-image.tsx`

**Design decisions:**
- `metadataBase` reads `process.env.NEXT_PUBLIC_SITE_URL`, falling back to the
  live `https://personal-site-ecru-eta-23.vercel.app` default — this is the
  one place that URL is hardcoded; nowhere else in the codebase references it.
- OG image layout: dark `--color-bg` background, hash + date top in muted mono,
  title large/bold, excerpt below in muted body-ish weight, `+added -removed`
  diffstat bottom in the same green/red — i.e. visually the same information
  hierarchy as the post page header, recomposed for a 1200×630 share card.
- Size 1200×630 (standard OG dimensions), per Next's `opengraph-image` convention.
- Font: system stack (`ui-sans-serif, system-ui, ...` for prose text,
  `ui-monospace, ...` for hash/date/diffstat) since `next/font` isn't usable
  inside `ImageResponse`.

- [ ] `app/blog/[slug]/opengraph-image.tsx` with `size`, `contentType`,
      `generateStaticParams` (mirrors the post page's), default export
      returning `ImageResponse`.
- [ ] `metadataBase` in `app/layout.tsx`.
- [ ] If trivial: mirror for `app/projects/[slug]/opengraph-image.tsx`.
- [ ] No vitest coverage expected for the image file — verified via
      `npm run build` succeeding (per constraints).
- [ ] Commit.

---

### Final verification

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test`
- [ ] `npm run build` — see "Known issue" below; passes except for the two
      new `opengraph-image` routes, which fail **only on this local Windows
      machine** due to a confirmed upstream bug, not anything in this branch.

All must pass clean before handing off for review. Fix forward on any failure;
if something can't be reasonably fixed, stop and report rather than working
around it with a hack.

---

## Known issue: `npm run build` fails locally on Windows for the two `opengraph-image` routes

**Not a bug in this branch's code.** `next/og`'s `ImageResponse` (Node.js
runtime, the default for `opengraph-image` files) loads its bundled fallback
font via `fs.readFileSync(fileURLToPath(path.join(import.meta.url, "../noto-sans-v27-latin-regular.ttf")))`
inside `next/dist/compiled/@vercel/og/index.node.js`. `path.join` on win32
converts the `file://` URL's forward slashes to backslashes and collapses the
`file://` scheme, producing a string `fileURLToPath` rejects with
`TypeError: Invalid URL` — this crashes as soon as the module is loaded,
before any of our own code runs, and reproduces even with `PostMarkdown`,
Timeline/tags, and everything else in this branch untouched. Confirmed via a
targeted web search that this is a known, currently **open** upstream issue —
[vercel/next.js#77164](https://github.com/vercel/next.js/issues/77164) — still
present as of Next 15.2.2-canary, i.e. not something fixable by bumping the
Next.js version in this repo.

Isolation performed to confirm scope: temporarily moved both
`opengraph-image.tsx` files out of the tree and reran `npm run build` — the
other 14 routes (including everything from Tasks 1 and 2, plus the new
`metadataBase`) built clean with zero errors. Restored both files; rebuilt;
only those same two routes fail, with an identical stack trace each time.

**Switching `export const runtime = "edge"` was tried and reverted** — the
edge runtime avoids this specific bug (it loads the font via
`fetch(new URL(...))` instead of `path.join`), but `getPostBySlug`/
`getAllPosts` (and the project equivalents) depend on `node:fs` and
`node:child_process` (via `lib/content/git-meta.ts`'s `execSync` git calls),
neither of which the edge runtime supports — webpack fails to bundle them at
all under edge. There is no version of this route that is both edge-runtime
and able to read post content and real git metadata, so edge is not a viable
fix here.

**Why this isn't expected to block the actual deploy:** Vercel's build
environment is Linux, where `path.join` uses forward slashes and the same
`fileURLToPath` call succeeds — the bug is specifically a Windows
path-separator issue, not a logic error in `next/og` or in this code. The
component logic, types, and `generateStaticParams` wiring are otherwise
verified correct (typecheck, lint, and the fact that build succeeds for every
other route confirm nothing else regressed).

**Not fixed by patching `node_modules` (e.g. `patch-package`)** — that would
work, but modifying third-party package internals is a bigger, more
opinionated change than this plan's scope, and something Matthew should
decide on rather than have applied silently while he's away.

**Recommendation for Matthew:** verify these two routes render correctly
either by building on Linux/WSL, or by pushing this branch to a preview
deploy on Vercel (do **not** merge to `master` first) and checking
`/blog/<slug>/opengraph-image` and `/projects/<slug>/opengraph-image` render
as expected there before merging.
