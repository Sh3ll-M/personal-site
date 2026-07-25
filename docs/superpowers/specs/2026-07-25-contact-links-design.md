# Contact Links — Design

## Context

The `impeccable` design review run on 2026-07-24 flagged (P0) that the site has zero contact affordance anywhere — no email, GitHub, or LinkedIn link on any of the six routes. A visitor who reads a blog post or checks the CV has no way to follow up. This spec closes that gap with a small, persistent set of contact icons in `Sidebar.tsx`, plus a Cloudflare Email Routing alias so the real inbox address is never published.

## Goals

- A visible, persistent contact affordance (email, GitHub, LinkedIn) on every page.
- The published email address is a redirect alias, not Matthew's real inbox address.
- No new npm dependency — three fixed icons don't justify pulling in an icon library.

## Non-goals

- No contact form / backend — the site has no database or API routes today (see `project_personal_site` memory), and a `mailto:` alias fully satisfies "a visitor can reach out."
- No changes to the CV page — Matthew is separately reconsidering whether to keep it; out of scope here.
- No sitewide `focus-visible` audit — the broader P3 finding (no focus states anywhere) is a separate, larger cleanup. This spec only gives the three new icons their own focus-visible styling, as baseline hygiene for newly written interactive elements.

## Cloudflare Email Routing (external setup, not code)

Matthew enables Email Routing for `sh3ll.co.uk` in the Cloudflare dashboard, creates a custom address `hello@sh3ll.co.uk` forwarding to his real inbox, and verifies the destination address via Cloudflare's confirmation email. Cloudflare adds the required MX/TXT records itself; these coexist with the existing flattened root CNAME (`sh3ll.co.uk → 134a94904c77b835.vercel-dns-017.com`) without conflict, since Cloudflare's CNAME flattening at the apex allows other record types (MX, TXT) alongside it.

## Architecture & data flow

**Config (`lib/site.ts`):** add alongside the existing `SITE_URL` export, following the same single-source-of-truth pattern:

```ts
export const CONTACT_LINKS = {
  email: "hello@sh3ll.co.uk",
  github: "https://github.com/Sh3ll-M",
  linkedin: "https://www.linkedin.com/in/matthew-shell-9b8139b/",
};
```

**New component (`components/ContactIcons.tsx`):** renders three `<a>` elements (mailto link + two external links), each wrapping a small hand-written inline SVG (~16px, `text-muted`, `hover:text-ink` — matching the existing nav-link hover treatment) with an `aria-label` (icon-only links need accessible text) and a visible `focus-visible:ring-2` state. GitHub and LinkedIn links get `target="_blank" rel="noopener noreferrer"`; the mailto link doesn't need either.

**Placement (`components/Sidebar.tsx`):** `<ContactIcons />` renders after the existing `<nav>` block.
- Desktop (`md:`): the `<aside>` becomes `md:flex md:flex-col`; `ContactIcons`'s wrapper gets `md:mt-auto`, pinning it to the bottom-left of the vertical sidebar column (the `<aside>` already stretches to the row's full height via the parent body's default flex `align-items: stretch`, so `mt-auto` has room to push against).
- Mobile: the sidebar is a horizontal top bar, not a tall column, so "bottom" doesn't apply — the icons render as a plain row underneath the nav links, left-aligned, no special positioning needed.

## Edge cases

- `mailto:` links have no loading/error state to handle — the browser/OS handles missing mail client configuration, outside this site's control.
- External link security (`rel="noopener noreferrer"`) is the only real risk here (reverse tabnabbing); both external links get it.

## Testing

Static markup with no logic branches — consistent with this repo's precedent (see the metadata-foundation spec's Testing section) of not adding rendering tests for page-level/presentational output with nothing meaningful to assert beyond "it renders." Build + typecheck already cover that.
