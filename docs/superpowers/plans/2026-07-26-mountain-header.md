# Mountain Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a flat, layered vector mountain-range illustration below the homepage Hero, and simplify the Hero's text (drop the `~/matthew` line, shorten the tagline).

**Architecture:** `Hero.tsx` loses its `~/matthew` line and gets a shorter tagline. A new, self-contained `MountainBanner.tsx` renders a 3-layer jagged-ridgeline SVG using only existing Tailwind color utilities (`fill-muted`, `fill-sidebar`, `fill-rule`), wrapped in a fixed-aspect-ratio container so it scales without distorting on any viewport width, with a `framer-motion` fade-in matching `Hero.tsx`'s existing pattern. `app/page.tsx` renders it directly after `<Hero />`.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, framer-motion (already a dependency). No new npm dependency.

## Global Constraints

- Only existing color tokens: `muted`, `sidebar`, `rule` (via Tailwind's `fill-*` utilities) — no new hex values anywhere.
- Back ridge (furthest): `fill-muted` at reduced opacity (use Tailwind's `opacity-20` utility — the closest standard step to the spec's "~15-20%"). Mid ridge: `fill-sidebar`, solid. Front ridge (closest, most contrast): `fill-rule`, solid.
- The SVG must not distort on different viewport widths — use a fixed-aspect-ratio wrapper and `preserveAspectRatio="xMidYMax slice"`, not `"none"`.
- Motion fades in and slides up slightly, matching `Hero.tsx`'s existing `hidden`/`show` variant pattern exactly, and is skipped when `useReducedMotion()` reports a preference for reduced motion.
- No new automated tests — static/presentational component, consistent with this repo's existing precedent.

---

### Task 1: Simplify Hero text

**Files:**
- Modify: `components/Hero.tsx`

**Interfaces:** None — this task has no interface other tasks depend on.

- [ ] **Step 1: Replace the full contents of `components/Hero.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };

  const item = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div initial="hidden" animate="show" variants={container}>
      <motion.h1 variants={item} className="font-display text-4xl font-bold text-ink">
        Matthew.
      </motion.h1>
      <motion.p variants={item} className="mt-2 font-mono text-sm text-muted">
        builds things. breaks things.
      </motion.p>
    </motion.div>
  );
}
```

(Changes from the current file: the `~/matthew` `motion.div` is removed entirely; `h1`'s `mt-2` class is dropped since it's now the first child with nothing above it to space from; the tagline text drops `" writes it down."`.)

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev`, visit `http://localhost:3000/`:
- Confirm the `~/matthew` line is gone.
- Confirm the tagline reads "builds things. breaks things." (no third clause).
- Confirm the heading and tagline still fade in on load (reload the page and watch).

Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: simplify Hero text for the new mountain header"
```

---

### Task 2: Mountain banner illustration

**Files:**
- Create: `components/MountainBanner.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `MountainBanner` — a props-free React component, rendered once by `app/page.tsx`. Not consumed by any other task.

- [ ] **Step 1: Create `components/MountainBanner.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function MountainBanner() {
  const reduceMotion = useReducedMotion();

  const variants = {
    hidden: reduceMotion ? {} : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="mt-10 aspect-[1600/380] w-full overflow-hidden"
      initial="hidden"
      animate="show"
      variants={variants}
    >
      <svg viewBox="0 0 1600 380" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <polygon
          className="fill-muted opacity-20"
          points="0,240 120,190 260,230 380,160 520,220 660,180 800,235 950,170 1100,225 1250,185 1400,230 1600,200 1600,380 0,380"
        />
        <polygon
          className="fill-sidebar"
          points="0,300 150,250 300,290 450,230 600,285 760,240 900,295 1080,235 1230,280 1400,255 1600,290 1600,380 0,380"
        />
        <polygon
          className="fill-rule"
          points="0,340 200,300 380,330 560,280 740,325 920,290 1100,335 1300,305 1600,335 1600,380 0,380"
        />
      </svg>
    </motion.div>
  );
}
```

- [ ] **Step 2: Wire it into `app/page.tsx`**

Full file after the change:

```tsx
import { getAllPosts } from "@/lib/content/posts";
import { getAllSiteTags } from "@/lib/content/tags";
import { Timeline } from "@/components/Timeline";
import { Hero } from "@/components/Hero";
import { MountainBanner } from "@/components/MountainBanner";
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
      <MountainBanner />

      <h2 className="mt-12 font-display text-sm uppercase tracking-wide text-muted">Recent</h2>
      <div className="mt-4">
        <Timeline items={recentPosts} basePath="/blog" allTags={allTags} />
      </div>
    </div>
  );
}
```

(Only the new import and the `<MountainBanner />` line are added; `getAllSiteTags`/`allTags`/`Timeline` usage is unchanged from the current file.)

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS, no errors.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS — no new tests were added, but confirm nothing existing broke.

- [ ] **Step 5: Verify with the dev server at multiple viewport widths**

Run: `npm run dev`, visit `http://localhost:3000/`:
- Desktop width (~1400px+): confirm three visibly distinct ridgeline layers render below the Hero text — a faint, low-opacity back ridge, a solid mid ridge, and a solid, higher-contrast front ridge, using the site's existing dark tones (no bright/saturated colors).
- Resize the browser down to a narrow/mobile width (~375px): confirm the peaks stay proportionate (don't stretch or squish into oddly wide/flat shapes) — the fixed aspect ratio should just show a cropped slice of the same artwork, not a distorted one.
- Reload the page and confirm the banner fades in alongside (or just after) the Hero text, not appearing instantly with a jarring pop.

Stop the dev server after checking.

- [ ] **Step 6: Run the production build**

Run: `npm run build`
Expected: PASS. (If it fails only on an `opengraph-image` route with `TypeError: Invalid URL`, that's the pre-existing Windows-only `@vercel/og` bug documented in this repo's project history — unrelated to this task. This task doesn't touch those routes.)

- [ ] **Step 7: Commit**

```bash
git add components/MountainBanner.tsx app/page.tsx
git commit -m "feat: add layered vector mountain banner to homepage hero"
```
