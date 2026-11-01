// Throwaway probe for wayfinder ticket 001 (Protection Gap detection timing).
// Paste into DevTools console on a loaded platform page. Swap `selector` per
// platform (see packages/extension/src/content/platforms/*.ts). Prints a JSON
// array after 12s: {t, quietForMs, matched} sampled every 200ms, where t and
// quietForMs are both relative to performance.now() at script start (not to
// actual navigation start — this is a manual probe, run after the page has
// already loaded, so it captures steady-state settle behavior, not cold-load
// churn).
await new Promise(resolve => {
  const start = performance.now();
  const selector = 'div[contenteditable="true"], textarea'; // <- swap per platform
  let lastMutation = start;
  const log = [];
  const observer = new MutationObserver(() => { lastMutation = performance.now(); });
  observer.observe(document.documentElement, {childList:true, subtree:true, attributes:true, characterData:true});
  const poll = setInterval(() => {
    const now = performance.now();
    log.push({t: Math.round(now-start), quietForMs: Math.round(now-lastMutation), matched: !!document.querySelector(selector)});
  }, 200);
  setTimeout(() => { clearInterval(poll); observer.disconnect(); console.log(JSON.stringify(log)); resolve(); }, 12000);
});

/* Findings (2026-11-01), manual runs via DevTools console, logged-in sessions:
 *
 * ChatGPT (chat.openai.com): matched at t=215ms. Zero mutations for the full 12s.
 * Gemini (gemini.google.com): matched at t=214ms. Mutations at ~568ms and ~1028ms
 *   (gap between them ~460ms), then silent for the remaining ~11s.
 * Claude (claude.ai), run 1: matched at t=205ms. One mutation blip at ~676ms
 *   (console attributed the log line to vendor-datadog-*.js — likely a lazily
 *   loaded analytics script, not app content), then silent for ~11.3s.
 * Claude (claude.ai), run 2, on a conversation already switched to: matched at
 *   t=209ms. Zero mutations for the full 12s.
 * Copilot (copilot.microsoft.com): not measured — no test account available.
 *
 * `matched` was `true` on every single sample across all 4 runs; it never
 * flipped false, including the run taken on a just-switched-to conversation.
 */
