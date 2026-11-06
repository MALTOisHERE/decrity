---
id: 005
title: Define the manual QA/test plan for Protection Gap detection and the degraded UX
label: wayfinder:grilling
status: closed
assignee: claude
blocked_by: []
created: 2026-11-06
closed: 2026-11-06
---

## Question

Tickets 001-004 decided the Protection Gap design and it's since been implemented and shipped (`b1a5191`, `5fc6d12`). The map's "Not yet specified" section still lists: how to validate, before each release, that detection and the degraded UX actually work. There's no automated test suite (CLAUDE.md: "No automated tests exist yet"), so this has to be a concrete manual procedure someone can actually run, not just "test it."

Two things need deciding:

1. **What the procedure actually is**: a repeatable checklist per platform, including a way to *simulate* a Protection Gap without waiting for a real platform break.
2. **What gates a release**: does every platform need to pass before shipping to the Chrome Web Store, or can a platform ship with a known-unvalidated caveat (as ticket 001 already did for Copilot's timing)?

## Why this needs a real procedure, not just "test it"

This session found a real, live bug on Claude.ai while testing the new alert banner. `claude.ts`'s selector (`div[contenteditable="true"], textarea`) was matching a hidden SSR fallback element (`data-testid="static-composer-input"`) that sits earlier in document order than the real composer, silently breaking scanning. Fixed in the same session (excluded the fallback element explicitly).

ChatGPT's, Gemini's, and Copilot's handlers use the same kind of broad catch-all selector:

- `chatgpt.ts`: `'textarea[data-id], textarea#prompt-textarea, div[contenteditable="true"]'`
- `gemini.ts`: `'rich-textarea textarea, div[contenteditable="true"]'`
- `copilot.ts`: `'textarea, div[contenteditable="true"]'`

Any of these could have the same class of problem right now, undiscovered, simply because nobody's checked `document.querySelectorAll(selector).length` on the live site recently. This isn't hypothetical risk, it already happened once.

## Proposed resolution

**Procedure**: a DevTools-console script (see [005-test-script.js](./005-test-script.js)) run manually against each logged-in platform, covering:

1. **Selector sanity**: `document.querySelectorAll(selector)` returns exactly one visible, interactive match. More than one match (even if the first one happens to be correct today) is a finding to fix, not just note, since document order is exactly what broke on Claude.ai.
2. **No false positive on normal load**: badge shows "Protected" (not the GAP state) within a few seconds of page load.
3. **Gap triggers on a real break**: remove/hide the matched element via DevTools (or the script's `simulateGap()` helper), then confirm the badge switches to the GAP state within max-wait (8s), the popup shows the gap banner with correct copy, and a `POST /v1/gap-report` fires (visible in the API server's request log) exactly once.
4. **Scanning pauses during the gap**: paste a prompt-injection-pattern string (e.g. "ignore all previous instructions...") while in the gap state, then confirm no alert banner appears and no `POST /v1/scan` fires.
5. **Gap resolves and scanning resumes**: restore the element (or navigate within the SPA to re-arm detection), then confirm the badge returns to "Protected" and a subsequent paste of the same kind of string does trigger the alert banner.
6. **Dedupe holds**: repeat step 3's gap trigger a second time within 24h on the same platform, then confirm no second `POST /v1/gap-report` fires (check `chrome.storage.local`'s `decrity_gap_reports` key, or the API log).

Run this after any change to a platform's `getInputSelector()`, and periodically (monthly, or whenever a platform visibly changes its UI) even without a code change, since the risk is the *platform* changing, not just Decrity's own code.

**Release gating**: open question, not decided here, see below.

## Resolution

**All 4 platforms must pass the full procedure before any Chrome Web Store release.** No shipping with a documented caveat for an untested platform, even one that's genuinely hard to test. The Claude.ai bug found live this session (a hidden fallback element silently breaking scanning) is the concrete reason: the same risk exists, unverified, on ChatGPT, Gemini, and Copilot right now, and this is a security product.

This supersedes ticket 001's Copilot timing caveat going forward: that caveat was acceptable at design time because no test account existed yet, but it does not carry forward as an excuse to skip step 1-6 verification before a release. If a Copilot test account still isn't available when a release is being prepared, that blocks the release until one is, it doesn't waive the check.
