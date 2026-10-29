---
id: 002
title: Design the GAP badge state and popup copy
label: wayfinder:prototype
status: open
assignee:
blocked_by: []
created: 2026-10-28
---

## Question

What should the new `GAP` badge state look like (color, icon/text, alongside the existing `CLEAN`/`SUSPICIOUS`/`THREAT`/`DISABLED` states in `packages/shared/src/constants/index.ts`), and what exact plain-language popup copy should show when a platform is in a Protection Gap?

It must read as visibly distinct from the existing (unused) `DISABLED` state — "I turned protection off" vs. "it stopped working here and we've been notified" are different situations and must not be confused — and must avoid jargon per CLAUDE.md's plain-language rule (no "selector", "endpoint", etc. in user-facing copy). Mock up the badge and popup states and react to them directly rather than deciding from description alone.
