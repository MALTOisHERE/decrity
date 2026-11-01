---
id: 002
title: Design the GAP badge state and popup copy
label: wayfinder:prototype
status: closed
assignee: claude
blocked_by: []
created: 2026-10-28
closed: 2026-11-01
---

## Question

What should the new `GAP` badge state look like (color, icon/text, alongside the existing `CLEAN`/`SUSPICIOUS`/`THREAT`/`DISABLED` states in `packages/shared/src/constants/index.ts`), and what exact plain-language popup copy should show when a platform is in a Protection Gap?

It must read as visibly distinct from the existing (unused) `DISABLED` state — "I turned protection off" vs. "it stopped working here and we've been notified" are different situations and must not be confused — and must avoid jargon per CLAUDE.md's plain-language rule (no "selector", "endpoint", etc. in user-facing copy). Mock up the badge and popup states and react to them directly rather than deciding from description alone.

## Resolution

**Variant A, "inline banner."** Settings stay fully visible and usable underneath; the explanation is visible the moment the popup opens, no tap required.

Prototype (3 variants, kept for reference): [prototype-gap-state.html](../../packages/extension/src/popup/prototype-gap-state.html). Not wired into the real app; move to a throwaway branch and drop from main when this is actually implemented.

**Badge** (`packages/shared/src/constants/index.ts`): add a `GAP` entry to `BADGE_COLORS` (`#2F6F78`, a deep teal, distinct from the existing green/amber/red/gray) and `BADGE_TEXT` (`~`). Chosen over amber/red tones specifically so it never reads as a content-danger signal, and over gray so it is never confused with the existing unused `DISABLED` state; a `~` is a different stroke-shape from the existing check/bang/warning/circle glyphs, signaling "a different kind of status" (tool health, not a content verdict) at a glance.

**Popup**: a status pill next to the logo reading "Catching up" (teal tint `#E6F1F2` background, `#1D4C54` text, small `~` mark), plus a left-accented banner below the header:

> This site changed in a way we haven't caught up with yet. We're on it. Everything else stays protected.

with a "What happened?" link for more detail. No jargon ("selector", "endpoint", etc.) anywhere in the copy, per CLAUDE.md.

**Rejected**: Variant B (full takeover, forces a "Got it" click before settings are visible) contradicts the destination's own "silent disablement" framing, which this map already settled, blocking isn't the intended experience here. Variant C (collapsed row, explanation hidden behind a tap) was the closest runner-up but cuts against the plain-language, explain-don't-hide ethos the rest of the product already follows.
