---
id: 001
title: Calibrate Protection Gap detection timing against the real platforms
label: wayfinder:prototype
status: closed
assignee: claude
blocked_by: []
created: 2026-10-28
closed: 2026-11-01
---

## Question

What MutationObserver debounce window and max-wait timeout should Decrity use before declaring a platform's selector(s) unmatched (entering a Protection Gap), so that normal slow-loading behavior on ChatGPT, Gemini, Claude, and Copilot never false-positives, while a real break is still caught quickly?

Build a small observer-based probe (watch for DOM mutations, check the known selector once mutations go quiet) and run it against the four real platforms to see actual settle times, then pick concrete debounce/timeout values from what's observed. Also confirm the re-arm-on-SPA-navigation behavior (new chat, settings, etc. within the same tab) against real navigation on at least one platform.

## Resolution

**Debounce (quiet) window: 800ms. Max-wait timeout: 8 seconds. SPA re-arm: keep it, but as defensive design — not directly confirmed by observation.**

Probe script and raw findings: [001-probe.js](./001-probe.js). Manual DevTools-console runs (Claude in Chrome couldn't reach these sites — no site permission was grantable through the extension's own UI; fell back to the user pasting the probe by hand) against logged-in sessions:

| Platform | Selector matched by | Mutations observed | Settled by |
|---|---|---|---|
| ChatGPT | 215ms | none | n/a (already quiet) |
| Gemini | 214ms | ~568ms, ~1028ms (gap ~460ms) | ~1028ms |
| Claude (run 1) | 205ms | one blip ~676ms (vendor-datadog, likely analytics, not app content) | ~676ms |
| Claude (run 2, on an already-switched-to conversation) | 209ms | none | n/a |
| Copilot | not measured — no test account available | — | — |

`matched` was `true` on every sample across all 4 runs, including the one taken on a conversation already navigated to — never flipped `false`, suggesting the input element is a persistent layout node these SPAs don't tear down on in-app navigation, at least for Claude.

**Debounce = 800ms**: comfortably above every observed inter-mutation gap (Gemini's widest was ~460ms) and above Claude's single post-load blip (~676ms), so it won't mistake a mid-settle lull for done, while staying well under a second.

**Max-wait = 8s**: real settle in every successful run landed under ~1.1s, and the selector itself matched in ~200ms every time. 8s gives roughly a 7–8x margin over everything observed, enough room for a slow network or cold cache before Decrity gives up and declares a Protection Gap, without making a user wait long for a legitimate "this is broken" signal.

**SPA re-arm**: re-arm the check on in-page navigation (pushState/popstate watcher) as originally planned. The direct test (triggering a live mid-transition flicker) wasn't captured — both attempts measured post-navigation steady state, not the transition itself — but the `matched: true` persistence across a chat switch is consistent with it, and re-arming is cheap insurance regardless.

**Caveat**: Copilot has zero direct data (no test account). Recommend applying the same values there and flagging it in the eventual implementation as unvalidated for that one platform specifically.
