import { describe, it, expect, vi, afterEach } from 'vitest'
import { STORAGE_KEYS } from '@decrity/shared'

const { getAuthToken } = vi.hoisted(() => ({ getAuthToken: vi.fn() }))
vi.mock('./auth', () => ({ getAuthToken }))

import { maybeSendGapReport } from './gapReport'

function stubChrome(storedLog: Record<string, number> = {}) {
  const store: Record<string, unknown> = { [STORAGE_KEYS.GAP_REPORTS]: storedLog }
  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: vi.fn((key: string) => Promise.resolve({ [key]: store[key] })),
        set: vi.fn((obj: Record<string, unknown>) => {
          Object.assign(store, obj)
          return Promise.resolve()
        }),
      },
    },
    runtime: {
      getManifest: vi.fn().mockReturnValue({ version: '1.0.0' }),
    },
  })
  return store
}

const DAY_MS = 86400000

describe('maybeSendGapReport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    getAuthToken.mockReset()
  })

  it('sends a report and records the timestamp when none was sent before', async () => {
    const store = stubChrome({})
    getAuthToken.mockResolvedValue(null)
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchSpy)

    await maybeSendGapReport('chatgpt')

    expect(fetchSpy).toHaveBeenCalledOnce()
    expect(store[STORAGE_KEYS.GAP_REPORTS]).toHaveProperty('chatgpt')
  })

  it('does not send a second report for the same platform within 24h', async () => {
    stubChrome({ chatgpt: Date.now() })
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await maybeSendGapReport('chatgpt')

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('sends again once the 24h dedupe window has passed', async () => {
    stubChrome({ chatgpt: Date.now() - DAY_MS - 1 })
    getAuthToken.mockResolvedValue(null)
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchSpy)

    await maybeSendGapReport('chatgpt')

    expect(fetchSpy).toHaveBeenCalledOnce()
  })

  it('does not record a timestamp if sending fails, so the next gap retries', async () => {
    const store = stubChrome({})
    getAuthToken.mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await maybeSendGapReport('chatgpt')

    expect(store[STORAGE_KEYS.GAP_REPORTS]).toEqual({})
  })

  it('does not dedupe across different platforms', async () => {
    stubChrome({ chatgpt: Date.now() })
    getAuthToken.mockResolvedValue(null)
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchSpy)

    await maybeSendGapReport('claude')

    expect(fetchSpy).toHaveBeenCalledOnce()
  })
})
