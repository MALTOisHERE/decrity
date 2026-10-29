---
id: 003
title: Define the Gap Report payload and endpoint contract
label: wayfinder:grilling
status: open
assignee:
blocked_by: []
created: 2026-10-28
---

## Question

What is the exact Gap Report payload shape (field names and types — platform id, timestamp, extension version, and nothing else: no selector text, no page content), what HTTP method and path does it use (e.g. `POST /v1/platform-health`, added to `API_ENDPOINTS` in `packages/shared/src/constants/index.ts`), and does it require auth (the existing `/v1/scan` call includes an optional bearer token — should an anonymous install still be able to send a Gap Report)?

Also decide where and how the client dedupes to at most one report per platform per day: which `chrome.storage` area, and what key, following the existing `STORAGE_KEYS` convention in the same file.
