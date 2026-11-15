// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { startProtectionGapDetection } from './gapDetector'

const DEBOUNCE_MS = 800
const MAX_WAIT_MS = 8000
const SELECTOR = '[data-testid="composer"]'

function addMatchingElement() {
  const el = document.createElement('textarea')
  el.setAttribute('data-testid', 'composer')
  document.body.appendChild(el)
  return el
}

describe('startProtectionGapDetection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('resolves to "not in gap" once the selector already matches, after the debounce window', () => {
    addMatchingElement()
    const onChange = vi.fn()

    startProtectionGapDetection('chatgpt', SELECTOR, onChange)
    vi.advanceTimersByTime(DEBOUNCE_MS)

    expect(onChange).toHaveBeenCalledWith(false)
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SET_PROTECTION_GAP_STATE',
      payload: { platform: 'chatgpt', inGap: false },
    })
  })

  it('resolves to "in gap" once max-wait elapses with the selector never matching', () => {
    const onChange = vi.fn()

    startProtectionGapDetection('chatgpt', SELECTOR, onChange)
    vi.advanceTimersByTime(MAX_WAIT_MS)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
      type: 'SET_PROTECTION_GAP_STATE',
      payload: { platform: 'chatgpt', inGap: true },
    })
  })

  it('does not re-finish after settling: a late popstate re-arms a fresh detection instead', () => {
    const onChange = vi.fn()

    startProtectionGapDetection('chatgpt', SELECTOR, onChange)
    vi.advanceTimersByTime(MAX_WAIT_MS)
    expect(onChange).toHaveBeenLastCalledWith(true) // settled: in gap

    // The platform's own composer shows up later (e.g. the user navigated
    // within the SPA); a popstate re-arms detection rather than leaving the
    // stale gap state in place forever.
    addMatchingElement()
    window.dispatchEvent(new PopStateEvent('popstate'))
    vi.advanceTimersByTime(DEBOUNCE_MS)

    expect(onChange).toHaveBeenLastCalledWith(false)
  })
})
