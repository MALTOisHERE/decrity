/**
 * Protection Gap detector (wayfinder ticket 001).
 *
 * Debounce (quiet window): 800ms. Max-wait: 8s. Both calibrated against real
 * DevTools probes on ChatGPT/Gemini/Claude (see .wayfinder/tickets/001-*).
 * Copilot uses the same values but is unvalidated there (no test account was
 * available during calibration).
 */

import { SupportedPlatform } from '@decrity/shared'

const DEBOUNCE_MS = 800
const MAX_WAIT_MS = 8000

interface DetectionHandle {
  cancel: () => void
}

let activeDetection: DetectionHandle | null = null

function reportGapState(platform: SupportedPlatform, inGap: boolean) {
  chrome.runtime.sendMessage({
    type: 'SET_PROTECTION_GAP_STATE',
    payload: { platform, inGap },
  }).catch(() => {
    // Service worker may be asleep momentarily; the next re-arm will retry.
  })
}

/**
 * Runs one detection pass: watch for DOM mutations, and once they go quiet
 * for DEBOUNCE_MS, check whether the platform's input selector matches.
 * A hard MAX_WAIT_MS ceiling declares a Protection Gap if nothing ever
 * settles-and-matches in time, regardless of ongoing mutation activity.
 */
function runDetection(
  platform: SupportedPlatform,
  selector: string,
  onChange: (inGap: boolean) => void
): DetectionHandle {
  let settled = false
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const finish = (matched: boolean) => {
    if (settled) return
    settled = true
    clearTimeout(debounceTimer)
    clearTimeout(maxWaitTimer)
    observer.disconnect()
    reportGapState(platform, !matched)
    onChange(!matched)
  }

  const check = () => {
    if (settled) return
    if (document.querySelector(selector)) {
      finish(true)
    }
    // Not matched yet: keep waiting. maxWaitTimer has the final word.
  }

  const scheduleCheck = () => {
    if (settled) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(check, DEBOUNCE_MS)
  }

  const observer = new MutationObserver(scheduleCheck)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  })

  const maxWaitTimer = setTimeout(() => {
    finish(!!document.querySelector(selector))
  }, MAX_WAIT_MS)

  // Handles the zero-mutation case (e.g. ChatGPT's measured ~215ms-settle,
  // zero mutations for the rest of the window): fires at start+DEBOUNCE_MS
  // even if nothing ever mutates.
  scheduleCheck()

  return {
    cancel: () => {
      if (settled) return
      settled = true
      clearTimeout(debounceTimer)
      clearTimeout(maxWaitTimer)
      observer.disconnect()
    },
  }
}

function startOrRestart(
  platform: SupportedPlatform,
  selector: string,
  onChange: (inGap: boolean) => void
) {
  activeDetection?.cancel()
  activeDetection = runDetection(platform, selector, onChange)
}

/**
 * Start Protection Gap detection for the current page, and re-arm it on
 * in-page SPA navigation (new chat, settings, etc.) — these platforms don't
 * do full page reloads for that, so a page-load-only check would miss a
 * selector break introduced after navigating within the same tab.
 *
 * `onChange` fires synchronously within this content script whenever the
 * gap state resolves, so callers (e.g. pausing scanning) don't have to wait
 * on a round trip through the background worker's stored state.
 */
export function startProtectionGapDetection(
  platform: SupportedPlatform,
  selector: string,
  onChange: (inGap: boolean) => void
) {
  startOrRestart(platform, selector, onChange)

  const rearm = () => startOrRestart(platform, selector, onChange)

  const originalPushState = history.pushState.bind(history)
  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState(...args)
    rearm()
  }

  const originalReplaceState = history.replaceState.bind(history)
  history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
    originalReplaceState(...args)
    rearm()
  }

  window.addEventListener('popstate', rearm)
}
