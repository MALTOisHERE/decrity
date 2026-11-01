# Decrity

Decrity is a Chrome extension that protects consumers from AI-specific threats (prompt injection, fake chatbots, data harvesting) when they use AI chat platforms.

## Language

**Platform**:
One of the supported AI chat sites (ChatGPT, Gemini, Claude, Copilot) that Decrity watches. Identified by a `SupportedPlatform` id.
_Avoid_: Site, target (when referring to a supported platform specifically)

**Selector**:
A rule that locates one part of a platform's page (its input box, submit button, or file upload control), owned by that platform's handler.
_Avoid_: Locator, query

**Verdict**:
The outcome of scanning a piece of content: `clean`, `suspicious`, or `threat`. Describes the content, not the extension's own health.
_Avoid_: Result, score (score is the numeric confidence behind a verdict, not the verdict itself)

**Privacy Mode**:
The setting (on by default) that restricts scanning to local heuristics only, with no network calls.
_Avoid_: Offline mode, local-only mode

**Layer 1 / Layer 2 Detection**:
The two scanning stages: Layer 1 is local heuristic pattern matching (always available, offline); Layer 2 is cloud-based ML classification (only runs when Privacy Mode is off).
_Avoid_: Local scan / remote scan, heuristic layer / ML layer

**Protection Gap**:
The state where a platform's selector(s) match nothing, confirmed after the extension's observer-driven stability check, so Decrity cannot watch input on that platform until a fix ships. Distinct from the user turning protection off.
_Avoid_: Broken selector, degraded mode, silent disablement, selector failure

**Gap Report**:
The minimal, content-free metadata (platform id, timestamp, extension version — never selector text or page content) Decrity sends to the server when a Protection Gap starts, so the team learns about it without a user filing a bug.
_Avoid_: Breakage telemetry, health ping, platform health check
