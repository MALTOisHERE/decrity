---
id: 004
title: Decide whether the privacy policy must disclose Gap Reports
label: wayfinder:grilling
status: closed
assignee: claude
blocked_by: [003]
created: 2026-10-28
closed: 2026-11-01
---

## Question

Given the final Gap Report payload and endpoint contract (ticket 003), does TrustLayer's privacy policy — still pending per PROGRESS.md's v1.0 "Documentation" week — need to disclose this new data flow, and if so, what should that disclosure say? Must stay consistent with DOC.md Section 10 and the project's "no content storage" guarantee: a Gap Report carries no selector text or page content, only platform id, timestamp, and extension version.

## Resolution

**Disclose, with its own named row** — not folded into a vague "diagnostic data" sentence. A Gap Report carries no content and is arguably not personal data under most privacy regimes, so this isn't a legal necessity; it's chosen because TrustLayer's own pitch is protection from data harvesting, and staying vague about its own outgoing data — however minimal — would cut against that.

This decision carries into two documents, both as follow-on work, not done by this ticket:

1. **DOC.md Section 10's data handling table** gets a new row, same shape as its existing rows:

   | Data type  | Stored? | Where    | Retention |
   |------------|---------|----------|-----------|
   | Gap Report (platform id, timestamp, extension version) | Yes | Postgres | 30 days |

   30 days, not the 90 days used for content hash/verdict/platform: a Gap Report is a purely operational signal (did the team get notified, did they ship a fix) with no per-user or historical value once that's happened, so it doesn't need the longer window those other rows use.

2. **The privacy policy itself** (not yet written — PROGRESS.md "Documentation," Week 7) needs one plain-language entry, no jargon per CLAUDE.md:

   > When a supported AI site changes in a way we haven't caught up with yet, your browser tells us which site, when, and which version of TrustLayer you have, so our team can fix it quickly. We never see what you typed or any page content. This information is kept for 30 days.

**Not done by this ticket**: actually editing DOC.md's table or writing the privacy policy file — the map's "Not yet specified" section already flags doc updates as a separate open item, and the privacy policy itself has no file to edit yet. This resolution is the exact row and copy to carry forward when that work happens.
