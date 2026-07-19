# Personal Site — Design

## Context

Matthew wants a personal site to host a CV, write blog posts about projects and interesting tech findings, and eventually store/share files (possibly backed by Google Drive). This spec covers **project one only**: the core site (CV + blog + projects). File storage / Google Drive integration is deliberately out of scope and will be brainstormed as a separate follow-on project once this one is live.

This is a passion/portfolio project, not a quick CV page — Matthew explicitly wants it to be visually distinctive, technically interesting to build, and not look like a templated AI-generated site.

## Goals

- Host an on-page CV
- A blog for project write-ups and tech notes
- A separate Projects section (portfolio-style)
- A visual identity that feels deliberate and specific to Matthew, not a generic template
- A build that's technically satisfying to work on (motion, polish, a real architecture) without over-engineering (no database/auth/CMS needed)

## Non-goals (explicitly out of scope)

- File storage / uploads / Google Drive integration — a separate future project, designed once this one ships
- Blog comments — declined for now
- Embedded interactive widgets inside post content (live demos/code sandboxes) — declined; "interactive/technically impressive" was scoped to site mechanics (motion, transitions, architecture), not post content
- No CMS, no database, no login/admin panel

## Visual design

**Signature concept:** the site is styled around the fact that Matthew thinks in git. Blog posts and projects are presented like commits in a log: a short hash, a diffstat (`+lines`/`-lines`, derived from the post's actual git history, not hand-typed), a commit-message-style title, and a date — arranged as a vertical timeline (dot-and-line, read top to bottom) rather than a plain list of "read more" cards. This is the one deliberately bold element; everything else stays quiet and disciplined around it.

**Mode:** dark by default.

**Palette:**
| Token | Hex | Use |
|---|---|---|
| bg | `#101214` | page background |
| sidebar | `#16181C` | persistent left nav panel |
| ink | `#E8E6E1` | primary text |
| muted | `#8A8F98` | secondary text, metadata |
| rule | `#24272C` | hairline borders, timeline spine |
| diff-add | `#3FB374` | functional only — new/added, never purely decorative |
| diff-remove | `#E0605C` | functional only — removed/old, never purely decorative |

There is no separate "accent" color bolted on for its own sake — diff-add doubles as the one accent, and only appears where it's semantically meaningful (e.g. a recent post, a diffstat).

**Type:**
- Display: a squared-off, technical-feeling grotesk sans (direction: Space Grotesk or similar) — used bold and large, sparingly
- Body: Inter (or comparable), quiet and readable
- Utility/metadata: a monospace face (e.g. IBM Plex Mono) for hashes, dates, diffstats, nav labels

**Layout:** persistent left sidebar (name, tagline, nav: Home / Blog / Projects / CV) across every page. Main content area holds the timeline (Home shows a teaser, `/blog` shows the full log). Single column, generous whitespace — minimalist foundation, brutalist-flavored signature (real structural metadata exposed, not hidden behind decorative cards).

**Motion:** one orchestrated page-load sequence on Home (sidebar + hero settling in), scroll-triggered reveal on timeline entries, subtle hover states on nav/cards. Deliberately restrained — no scattered/ambient effects layered on top. `prefers-reduced-motion` must be respected throughout.

## Architecture & tech stack

- **Framework:** Next.js (App Router)
- **Hosting:** Vercel — zero-config deploys on push, free tier is sufficient, custom domain can be added later (no domain decided yet, not a blocker)
- **Styling:** Tailwind CSS plus the token system above; Framer Motion for the motion described
- **Content model:** Markdown files with frontmatter, no database:
  - `content/posts/*.md` — blog posts
  - `content/projects/*.md` — project write-ups
  - Frontmatter fields: `title`, `date`, `tags`, `excerpt` (hash and diffstat are derived at build time from git history for that file, not authored by hand, so the commit-log metaphor stays honest rather than becoming manual busywork)
- **Content validation:** frontmatter is schema-checked at build time (e.g. Zod); a malformed post fails the build instead of rendering broken
- **No auth, no admin UI, no database** — publishing is `git push` to this repo, which triggers a Vercel deploy

## Pages

| Route | Purpose |
|---|---|
| `/` | Home — name, tagline, sidebar, teaser of most recent timeline entries |
| `/blog` | Full commit-log timeline of all posts, newest first |
| `/blog/[slug]` | Full post — git-flavored meta line (hash/date/diffstat) as a header, then article content |
| `/projects` | Project grid/list — name, short description, tags, links (repo/live demo) |
| `/projects/[slug]` | Project detail — reuses the post article layout |
| `/cv` | On-page CV, styled to match (not just a PDF embed) |
| 404 | Styled to match the theme (e.g. a git-flavored not-found message) rather than a default error page |

Sidebar (Home / Blog / Projects / CV) persists across all routes.

## Content authoring workflow

Write a `.md` file with the frontmatter above, place it under `content/posts/` or `content/projects/`, commit, and push. Vercel builds and deploys automatically. No login screen, no separate editor UI — matches the site's own theme (git-native) and needs no backend beyond the static build.

## Testing / verification approach

This is a static content site with no real application logic, so verification is lightweight rather than a full test suite:
- Build passes (content schema validation catches malformed frontmatter at build time)
- Type-checking passes
- Basic accessibility pass: keyboard navigation through sidebar and timeline, visible focus states, `prefers-reduced-motion` respected
- Responsive check down to mobile — sidebar likely needs to collapse to a top bar or drawer on small screens; exact approach to be decided at implementation time
- No unit test framework needed given the lack of application logic; content correctness is a build-time schema check

## Open items deferred to implementation planning

- Exact mobile sidebar behavior (collapse to top bar vs. drawer)
- Whether/when a custom domain is added
- Real CV content and initial project/post content (to be supplied by Matthew, not fabricated)
