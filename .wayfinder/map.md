---
label: wayfinder:map
created: 2026-10-28
---

# Platform Protection Gap resilience spec

## Destination

A design spec, ready to hand to the extension team, defining:

1. **Detection** — how Decrity notices a platform (ChatGPT, Gemini, Claude, or Copilot) has entered a **Protection Gap**: an observer-driven stability check against that platform's selector(s) in `packages/extension/src/content/platforms/*.ts`, re-arming on in-page SPA navigation (not just once at page load).
2. **User experience** — while a platform is in a Protection Gap, Decrity pauses scanning on it, shows a new, distinct `GAP` badge state (not the existing unused `DISABLED` state), and the popup shows a plain-language note.
3. **Team notification** — a content-free **Gap Report** (platform id, timestamp, extension version only) goes to a new API endpoint, deduped client-side to at most once per platform per day.

The fix for a real breakage still ships as a normal code change + Chrome Web Store release — this spec is about noticing and surfacing the break fast, not patching it without a release. See GLOSSARY.md for the Protection Gap / Gap Report terms.

## Notes

- Tracker: local-markdown (this repo, under `.wayfinder/`). Tickets are files in `.wayfinder/tickets/`, linked by filename; "blocking" is a `blocked_by` frontmatter list; "claiming" is an `assignee` frontmatter field.
- Terms are pinned in [GLOSSARY.md](../GLOSSARY.md) (`Protection Gap`, `Gap Report`, plus existing `Platform`/`Selector`/`Verdict`/`Privacy Mode` terms) — use them consistently, not the earlier working names ("broken", "degraded mode", "breakage telemetry").
- Must satisfy existing project constraints (CLAUDE.md): no content storage (Gap Reports carry metadata only, never selector text or page content), minimal permissions, plain-language user-facing copy.
- Relates to existing backlog entries: PROGRESS.md "Known Issues & Blockers → Platform Selectors Fragile" and ROADMAP.md "Critical Risks → Platform UI Changes 🔴" — this map is finding the design those entries currently lack.
- Default: this map produces decisions, not deliverables. No ticket here overrides that — all four are decision tickets, not build tickets.

## Decisions so far

- [001: Calibrate Protection Gap detection timing against the real platforms](tickets/001-calibrate-gap-detection-timing.md): debounce 800ms, max-wait 8s, re-arm on SPA navigation kept (defensive, not directly observed); calibrated from real DevTools probes on ChatGPT/Gemini/Claude (Copilot unmeasured, no test account).
- [002: Design the GAP badge state and popup copy](tickets/002-gap-badge-and-popup-design.md): inline-banner layout (Variant A); teal `#2F6F78` badge/pill with a `~` mark, settings stay visible underneath; rejected a full-takeover variant as inconsistent with "silent disablement."
- [003: Define the Gap Report payload and endpoint contract](tickets/003-gap-report-contract.md): `POST /v1/gap-report` (matches the `Gap Report` glossary term; an earlier draft name, `/v1/platform-health`, was rejected for clashing with GLOSSARY.md's own avoid-list); payload is `{ source, timestamp, extensionVersion }` only; no auth required (anonymous installs must still be able to report); client dedupes via one `chrome.storage.local` key (`decrity_gap_reports`, a per-platform object map) to at most once per platform per 24h.

- [004: Decide whether the privacy policy must disclose Gap Reports](tickets/004-privacy-policy-disclosure.md): yes, with its own named data-table row (not a vague "diagnostic data" sentence) — 30-day retention, shorter than the 90 days used for content hash/verdict/platform since a Gap Report has no per-user value once the team's been notified. Exact DOC.md table row and privacy-policy copy are written in the ticket; editing DOC.md and writing the privacy policy file itself are still follow-on work, not done here.

## Not yet specified

- How to validate, before shipping, that Protection Gap detection and the degraded UX actually behave correctly (test/QA plan) — depends on how tickets 001 and 002 resolve.
- Whether and how to update PROGRESS.md's "Platform Selectors Fragile" entry and ROADMAP.md's risk register once this spec is approved.
- Actually applying ticket 004's resolution to DOC.md Section 10's data handling table and to the privacy policy once that file exists.

## Out of scope

- **Remote-fetched selector config** (selectors as data pulled from the API at runtime, patchable without a store review) — ruled out while charting: disproportionate new infra for a pre-launch, solo-dev project. Possible future escalation if store-review turnaround proves too slow in practice, but not part of this destination.
- **Self-healing / DOM-guessing fallback selectors** (auto-locating a replacement input element when the known selector fails) — ruled out while charting: new, riskier detection R&D that none of the project's docs actually ask for; left as a v2.0-style idea, not this destination's job.
