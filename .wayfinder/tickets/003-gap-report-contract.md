---
id: 003
title: Define the Gap Report payload and endpoint contract
label: wayfinder:grilling
status: closed
assignee: claude
blocked_by: []
created: 2026-10-28
closed: 2026-11-01
---

## Question

What is the exact Gap Report payload shape (field names and types — platform id, timestamp, extension version, and nothing else: no selector text, no page content), what HTTP method and path does it use (added to `API_ENDPOINTS` in `packages/shared/src/constants/index.ts`), and does it require auth (the existing `/v1/scan` call includes an optional bearer token — should an anonymous install still be able to send a Gap Report)?

Also decide where and how the client dedupes to at most one report per platform per day: which `chrome.storage` area, and what key, following the existing `STORAGE_KEYS` convention in the same file.

## Resolution

**Endpoint**: `POST /v1/gap-report`, added to `API_ENDPOINTS` as `GAP_REPORT`. The ticket's original working name, `/v1/platform-health`, was rejected on review: `GLOSSARY.md` explicitly lists "platform health check" as a term to avoid for Gap Report, and that avoid-list exists to keep one name for one concept across the API, the code, and the spec. A future, genuinely different health signal can get its own endpoint name when it exists — that's not a reason to blur this one now.

**Payload** (new `GapReportAPI` namespace in `packages/shared/src/types/api.ts`, alongside `ScanAPI`):

```typescript
export namespace GapReportAPI {
  export interface Request {
    source: SupportedPlatform  // matches ScanAPI.Request's field name for the same concept
    timestamp: number          // ms epoch, matches ScanRequest.timestamp
    extensionVersion: string   // from manifest.json, e.g. "1.0.0"
  }

  export interface Response {
    received: boolean
  }
}
```

No content, no selector text, no page data — matches CLAUDE.md's no-content-storage rule exactly as the destination required.

**Auth**: not required. An anonymous, never-signed-in install (common in Privacy Mode) must still be able to report a gap — that's exactly the population otherwise invisible to the team. This mirrors `/v1/scan`'s and `/v1/report`'s actual current behavior in this codebase: `report.ts` doesn't check a token today (`userId = 'anonymous'` is hardcoded as a placeholder), so Gap Reports aren't introducing a new anonymous-access precedent, just continuing the existing one. If a bearer token happens to be present (signed-in user), the extension may still send it, but the API must accept the request without one.

**Client-side dedupe** (`packages/extension`, following `STORAGE_KEYS` convention in `packages/shared/src/constants/index.ts`):

- Storage area: `chrome.storage.local` (matches where `AUTH_TOKEN`/`USER_ID`/`SETTINGS` already live).
- One new key, `GAP_REPORTS: 'trustlayer_gap_reports'`, holding a single object map rather than one key per platform — mirrors how `SETTINGS` already stores one JSON blob under one key:
  ```typescript
  type GapReportLog = Partial<Record<SupportedPlatform, number>> // platform -> last-reported-at (ms epoch)
  ```
- Before sending, the background worker checks `Date.now() - (log[platform] ?? 0) < 86400000` (24h); if true, skip sending and don't touch the stored timestamp. On a successful send, write `log[platform] = Date.now()`.
- No separate rate limit needed server-side beyond the existing general `RATE_LIMITS.API_REQUESTS_PER_MINUTE` — the client-side daily dedupe already keeps volume per install negligible.
