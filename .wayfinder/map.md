---
label: wayfinder:map
created: 2026-10-28
---

# Platform Protection Gap resilience spec

## Destination

A design spec, ready to hand to the extension team, defining:

1. **Detection** — how TrustLayer notices a platform (ChatGPT, Gemini, Claude, or Copilot) has entered a **Protection Gap**: an observer-driven stability check against that platform's selector(s) in `packages/extension/src/content/platforms/*.ts`, re-arming on in-page SPA navigation (not just once at page load).
2. **User experience** — while a platform is in a Protection Gap, TrustLayer pauses scanning on it, shows a new, distinct `GAP` badge state (not the existing unused `DISABLED` state), and the popup shows a plain-language note.
3. **Team notification** — a content-free **Gap Report** (platform id, timestamp, extension version only) goes to a new API endpoint, deduped client-side to at most once per platform per day.

The fix for a real breakage still ships as a normal code change + Chrome Web Store release — this spec is about noticing and surfacing the break fast, not patching it without a release. See GLOSSARY.md for the Protection Gap / Gap Report terms.

## Notes

- Tracker: local-markdown (this repo, under `.wayfinder/`). Tickets are files in `.wayfinder/tickets/`, linked by filename; "blocking" is a `blocked_by` frontmatter list; "claiming" is an `assignee` frontmatter field.
- Terms are pinned in [GLOSSARY.md](../GLOSSARY.md) (`Protection Gap`, `Gap Report`, plus existing `Platform`/`Selector`/`Verdict`/`Privacy Mode` terms) — use them consistently, not the earlier working names ("broken", "degraded mode", "breakage telemetry").
- Must satisfy existing project constraints (CLAUDE.md): no content storage (Gap Reports carry metadata only, never selector text or page content), minimal permissions, plain-language user-facing copy.
- Relates to existing backlog entries: PROGRESS.md "Known Issues & Blockers → Platform Selectors Fragile" and ROADMAP.md "Critical Risks → Platform UI Changes 🔴" — this map is finding the design those entries currently lack.
- Default: this map produces decisions, not deliverables. No ticket here overrides that — all four are decision tickets, not build tickets.

## Decisions so far

<!-- none yet — map just charted; destination scope itself (small: no remote config, no self-healing; observer-driven detection; distinct badge state; deduped Gap Report to a new endpoint) was settled during charting and is folded into the Destination above rather than listed as a ticket -->

## Not yet specified

- How to validate, before shipping, that Protection Gap detection and the degraded UX actually behave correctly (test/QA plan) — depends on how tickets 001 and 002 resolve.
- Whether and how to update PROGRESS.md's "Platform Selectors Fragile" entry and ROADMAP.md's risk register once this spec is approved.

## Out of scope

- **Remote-fetched selector config** (selectors as data pulled from the API at runtime, patchable without a store review) — ruled out while charting: disproportionate new infra for a pre-launch, solo-dev project. Possible future escalation if store-review turnaround proves too slow in practice, but not part of this destination.
- **Self-healing / DOM-guessing fallback selectors** (auto-locating a replacement input element when the known selector fails) — ruled out while charting: new, riskier detection R&D that none of the project's docs actually ask for; left as a v2.0-style idea, not this destination's job.
