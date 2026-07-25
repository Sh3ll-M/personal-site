# Contact Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent email/GitHub/LinkedIn contact affordance to every page of personal-site, closing the impeccable P0 finding that the site has no way for a visitor to reach out.

**Architecture:** A `CONTACT_LINKS` constant in `lib/site.ts` holds the three URLs. A new `components/ContactIcons.tsx` renders three small inline-SVG icon links reading from that constant. `components/Sidebar.tsx` renders `<ContactIcons />` after its nav list, with the `<aside>` switched to a flex column on desktop so the icon row can be pinned to the bottom via `md:mt-auto`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS. No new npm dependencies.

## Global Constraints

- No new npm dependency — icons are hand-written inline SVG, not a library. (spec: Goals)
- The published email is the alias `hello@sh3ll.co.uk`, never Matthew's real inbox address. (spec: Context, Cloudflare Email Routing)
- GitHub link: `https://github.com/Sh3ll-M`. LinkedIn link: `https://www.linkedin.com/in/matthew-shell-9b8139b/`. (spec: Architecture & data flow)
- No changes to `app/cv/page.tsx` or any other route — this feature only touches `lib/site.ts`, `components/Sidebar.tsx`, and the new `components/ContactIcons.tsx`. (spec: Non-goals)
- No sitewide `focus-visible` audit — only the three new icons get focus-visible styling. (spec: Non-goals)
- No automated tests — static markup with no logic branches; build + typecheck are the verification bar. (spec: Testing)
- Icon color: `text-muted` default, `hover:text-ink` on hover — matches the existing nav-link treatment in `Sidebar.tsx`. Focus ring uses the existing `diff-add` color token (`#3fb374`) for an on-brand accent.

**Note:** Cloudflare Email Routing (the alias forwarding `hello@sh3ll.co.uk` to Matthew's real inbox) is a dashboard/DNS setup step outside this codebase, done separately by Matthew — not part of this plan's tasks.

---

### Task 1: Add `CONTACT_LINKS` to `lib/site.ts`

**Files:**
- Modify: `lib/site.ts`

**Interfaces:**
- Produces: `CONTACT_LINKS: { email: string; github: string; linkedin: string }`, a named export from `lib/site.ts`. `email` is a bare address (no `mailto:` prefix — the consumer in Task 2 adds that). `github` and `linkedin` are full `https://` URLs.

- [ ] **Step 1: Add the constant**

Edit `lib/site.ts` to add the new export below the existing `SITE_URL` export:

```ts
// Single source of truth for the site's public URL. Reads NEXT_PUBLIC_SITE_URL
// so Matthew can point this at a custom domain later without touching code;
// falls back to the live Vercel deployment URL.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://personal-site-ecru-eta-23.vercel.app";

// Contact links shown in the sidebar. The email is a Cloudflare Email
// Routing alias, not Matthew's real inbox address.
export const CONTACT_LINKS = {
  email: "hello@sh3ll.co.uk",
  github: "https://github.com/Sh3ll-M",
  linkedin: "https://www.linkedin.com/in/matthew-shell-9b8139b/",
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes with no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/site.ts
git commit -m "feat: add CONTACT_LINKS constant"
```

---

### Task 2: Create `components/ContactIcons.tsx`

**Files:**
- Create: `components/ContactIcons.tsx`

**Interfaces:**
- Consumes: `CONTACT_LINKS` from `lib/site.ts` (Task 1) — `{ email, github, linkedin }`.
- Produces: `ContactIcons` component (named export, no props) — a `<div>` wrapping three `<a>` icon links. Rendered by `Sidebar.tsx` in Task 3.

- [ ] **Step 1: Write the component**

Create `components/ContactIcons.tsx`:

```tsx
import { CONTACT_LINKS } from "@/lib/site";

const ICON_LINK_CLASSES =
  "text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-diff-add focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-sm";

export function ContactIcons() {
  return (
    <div className="flex items-center gap-4">
      <a
        href={`mailto:${CONTACT_LINKS.email}`}
        aria-label="Email"
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
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </a>
      <a
        href={CONTACT_LINKS.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
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
        >
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
      </a>
      <a
        href={CONTACT_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
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
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </a>
    </div>
  );
}
```

Note on the focus ring: `focus-visible:ring-offset-sidebar` needs Tailwind's `ring-offset-color` utility to resolve the `sidebar` token — this project's `tailwind.config.ts` already extends `colors.sidebar`, so `ring-offset-sidebar` resolves the same way `bg-sidebar` does elsewhere in `Sidebar.tsx`. No config change needed.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes with no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes with no errors or warnings on the new file.

- [ ] **Step 4: Commit**

```bash
git add components/ContactIcons.tsx
git commit -m "feat: add ContactIcons component"
```

---

### Task 3: Wire `ContactIcons` into `Sidebar.tsx`

**Files:**
- Modify: `components/Sidebar.tsx`

**Interfaces:**
- Consumes: `ContactIcons` component (Task 2, no props).

- [ ] **Step 1: Import and render `ContactIcons`, adjust layout for bottom-left pinning on desktop**

Edit `components/Sidebar.tsx`:

```tsx
import Link from "next/link";
import { ContactIcons } from "@/components/ContactIcons";

const NAV_ITEMS = [
  { href: "/", label: "home" },
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/cv", label: "cv" },
];

export function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-rule bg-sidebar px-6 py-5 md:flex md:w-56 md:flex-col md:border-b-0 md:border-r md:py-8">
      <div className="font-display text-xl font-bold text-ink">Matthew</div>
      <div className="mt-1 font-mono text-xs text-muted">builds &amp; breaks things</div>
      <nav className="mt-6 flex gap-4 font-mono text-sm text-muted md:mt-8 md:flex-col md:gap-3">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="transition-colors hover:text-ink">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 md:mt-auto md:pt-8">
        <ContactIcons />
      </div>
    </aside>
  );
}
```

What changed from the current file: `<aside>` gains `md:flex md:flex-col` (turns it into a flex column on desktop so a child can use `mt-auto`); a new wrapper `<div>` around `<ContactIcons />` uses `mt-4` on mobile (plain spacing below the nav row) and `md:mt-auto md:pt-8` on desktop (pushes it to the bottom of the sidebar column, with a bit of padding above it in case content is tall enough that `mt-auto` collapses to a small gap).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes with no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: passes with no errors or warnings.

- [ ] **Step 4: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "feat: render ContactIcons in Sidebar"
```

---

### Task 4: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Check desktop layout**

Open `http://localhost:3000` in a browser at a desktop width (≥768px, the `md:` breakpoint). Confirm:
- The three icons sit at the bottom-left of the left sidebar column, below the nav links, regardless of how tall the page content is (check on `/` and on a long page like a blog post).
- Hovering each icon changes its color from muted gray to the site's ink (near-white) color.
- Tabbing through the page with the keyboard reaches all three icons in order and each shows a visible green focus ring.
- Clicking the email icon opens the system mail client addressed to `hello@sh3ll.co.uk`.
- Clicking GitHub/LinkedIn opens the correct profile in a new tab.

- [ ] **Step 3: Check mobile layout**

Resize the browser below 768px (or use device emulation). Confirm the three icons render as a left-aligned row underneath the nav links, within the horizontal top bar, not overlapping or clipped.

- [ ] **Step 4: Run the full build**

Run: `npm run build`
Expected: succeeds with no errors (this also catches any issue the dev server's fast-refresh might mask).

- [ ] **Step 5: Stop the dev server, confirm no leftover changes**

Run: `git status`
Expected: clean working tree (all three prior tasks already committed).
