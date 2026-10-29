---
id: 001
title: Calibrate Protection Gap detection timing against the real platforms
label: wayfinder:prototype
status: open
assignee:
blocked_by: []
created: 2026-10-28
---

## Question

What MutationObserver debounce window and max-wait timeout should TrustLayer use before declaring a platform's selector(s) unmatched (entering a Protection Gap), so that normal slow-loading behavior on ChatGPT, Gemini, Claude, and Copilot never false-positives, while a real break is still caught quickly?

Build a small observer-based probe (watch for DOM mutations, check the known selector once mutations go quiet) and run it against the four real platforms to see actual settle times, then pick concrete debounce/timeout values from what's observed. Also confirm the re-arm-on-SPA-navigation behavior (new chat, settings, etc. within the same tab) against real navigation on at least one platform.
