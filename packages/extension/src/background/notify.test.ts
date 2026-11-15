import { describe, it, expect, vi, afterEach } from 'vitest'
import { STORAGE_KEYS, ScanResponse } from '@decrity/shared'
import { maybeNotify } from './notify'

function stubChrome(settings?: { notificationsEnabled?: boolean }) {
  const create = vi.fn()
  vi.stubGlobal('chrome', {
    storage: {
      sync: {
        get: vi.fn().mockResolvedValue(settings === undefined ? {} : { [STORAGE_KEYS.SETTINGS]: settings }),
      },
    },
    notifications: { create },
    runtime: { getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`) },
  })
  return create
}

function makeResult(overrides: Partial<ScanResponse>): ScanResponse {
  return {
    verdict: 'suspicious',
    score: 0.5,
    reason: 'Test reason',
    detectionLayer: 'heuristic',
    scanId: 'test-id',
    timestamp: Date.now(),
    ...overrides,
  }
}

describe('maybeNotify', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('never notifies for a clean verdict, regardless of the setting', async () => {
    const create = stubChrome({ notificationsEnabled: true })
    await maybeNotify(makeResult({ verdict: 'clean' }))
    expect(create).not.toHaveBeenCalled()
  })

  it('notifies for a suspicious verdict when notifications are enabled', async () => {
    const create = stubChrome({ notificationsEnabled: true })
    await maybeNotify(makeResult({ verdict: 'suspicious', reason: 'looks off' }))
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Potentially suspicious content', message: 'looks off' })
    )
  })

  it('notifies for a threat verdict when notifications are enabled', async () => {
    const create = stubChrome({ notificationsEnabled: true })
    await maybeNotify(makeResult({ verdict: 'threat' }))
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ title: 'Content flagged as a threat' }))
  })

  it('does not notify when the user has turned notifications off', async () => {
    const create = stubChrome({ notificationsEnabled: false })
    await maybeNotify(makeResult({ verdict: 'threat' }))
    expect(create).not.toHaveBeenCalled()
  })

  it('defaults to enabled when no settings have been saved yet', async () => {
    const create = stubChrome(undefined)
    await maybeNotify(makeResult({ verdict: 'threat' }))
    expect(create).toHaveBeenCalledOnce()
  })
})
