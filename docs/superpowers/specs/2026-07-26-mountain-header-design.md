# Mountain Header — Design

## Context

Matthew saw a reference (a YouTube design demo, "Kestrel" — screenshot saved at `C:\Projects\Claude\Style Ideas\Header Idea 1.png`) with a moody black-and-white photograph of mountain peaks emerging above a sea of clouds, used as a hero background, alongside a small monospace coordinate/metadata block. He liked the "cloud sea" mood and asked for a vector-art mountain range reinterpreting it in the site's own colors, for the homepage hero specifically (not the broader visual redesign already deferred from 2026-07-25).

Explored via the visual brainstorming companion across two rounds: five vector styles were mocked up against the real Hero text (flat layered silhouettes, layered + soft cloud-sea blur, a single dramatic peak, gradient-shaded peaks with richer cloud wisps, and faceted/low-poly rock shading). Matthew chose **A — flat layered silhouettes**: clean, minimal, three stacked jagged ridgelines with no cloud-blur texture.

A photographic (real desaturated photo) alternative was raised and explicitly deferred — Matthew wants to stay with vector art for now and may explore image generation in a later session.

## Goals

- A flat, layered vector mountain-range illustration on the homepage hero, in the chosen "A" style.
- Uses only colors already defined in the site's CSS custom properties — no new hex values introduced.
- Simplifies the existing Hero text: removes the `~/matthew` line entirely, shortens the tagline from "builds things. breaks things. writes it down." to "builds things. breaks things."
- Fades in on load, consistent with the Hero text's existing motion style, respecting `prefers-reduced-motion`.

## Non-goals

- No sitewide header — homepage only, per Matthew's explicit choice.
- No cloud/fog blur texture, no gradient shading, no faceted rock detail — those were the other mocked variants (B–E), not chosen.
- No photographic image — vector illustration only; the photo-realistic route is explicitly deferred to a future session.
- No changes to the small `~/matthew`-adjacent design elsewhere (sidebar branding, nav) — scoped strictly to the homepage Hero section.

## Component structure

**`components/Hero.tsx`** (existing, modified): remove the `~/matthew` `motion.div` entirely; change the tagline text from `"builds things. breaks things. writes it down."` to `"builds things. breaks things."`. No other changes — the heading ("Matthew.") and the existing stagger/fade animation setup are untouched.

**`components/MountainBanner.tsx`** (new): a self-contained illustration component with no props. Renders an `<svg>` with three stacked jagged ridgeline `<polygon>` layers spanning the full width, wrapped in a fixed-aspect-ratio container (so it scales without distorting peak shapes on different viewport widths — using `preserveAspectRatio="xMidYMax slice"` rather than `"none"`, which would stretch the peaks unevenly on narrow mobile viewports). `"use client"`, using the same `framer-motion` + `useReducedMotion` pattern as `Hero.tsx`: fades in and slides up slightly on mount, or renders instantly with no motion when reduced motion is preferred.

**`app/page.tsx`** (modified): renders `<MountainBanner />` directly after `<Hero />`, before the existing "Recent" section.

## Color layering (atmospheric perspective, no new hex values)

Three ridgelines, back-to-front, each reusing an existing CSS custom property:

- **Back ridge** (furthest, hazy): `var(--color-muted)` at low opacity (~15-20%), suggesting distant peaks fading into the sky rather than a hard edge.
- **Mid ridge**: `var(--color-sidebar)`, solid fill.
- **Front ridge** (closest, most contrast against the near-black background): `var(--color-rule)`, solid fill — `rule` is a lighter tone than `sidebar`, so the closest ridge reads with the most contrast, matching how real mountain photography renders nearer terrain with more definition than hazier distant peaks.

The sky behind all three ridges is `var(--color-bg)`, matching the rest of the page — no separate background fill needed.

## Motion

Matches `Hero.tsx`'s existing pattern: a `framer-motion` variant fading in (`opacity: 0 → 1`) and sliding up slightly (`y: 10 → 0`), skipped entirely when `useReducedMotion()` reports a preference for reduced motion (identical short-circuit already used in `Hero.tsx` and `TimelineEntry.tsx`).

## Testing

No new automated tests — this is static/presentational SVG markup with a props-free component, consistent with this repo's existing precedent (see prior specs) of not testing static markup beyond what build + typecheck already cover. Verification is visual: check the homepage in a browser at a few viewport widths (mobile/tablet/desktop) to confirm the ridgelines don't distort, and confirm the fade-in plays once and respects `prefers-reduced-motion` (matching how `Hero.tsx`'s existing animation was verified).
