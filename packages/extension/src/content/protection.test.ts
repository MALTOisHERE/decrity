import { describe, it, expect, vi, afterEach } from 'vitest'
import { STORAGE_KEYS } from '@decrity/shared'
import { isProtectionEnabled } from './protection'

function stubChromeSettings(settings?: { protectionEnabled?: boolean }) {
  vi.stubGlobal('chrome', {
    storage: {
      sync: {
        get: vi.fn().mockResolvedValue(settings === undefined ? {} : { [STORAGE_KEYS.SETTINGS]: settings }),
      },
    },
  })
}

describe('isProtectionEnabled', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('defaults to enabled when no settings have been saved yet', async () => {
    stubChromeSettings(undefined)
    expect(await isProtectionEnabled()).toBe(true)
  })

  it('reflects a saved false value', async () => {
    stubChromeSettings({ protectionEnabled: false })
    expect(await isProtectionEnabled()).toBe(false)
  })

  it('reflects a saved true value', async () => {
    stubChromeSettings({ protectionEnabled: true })
    expect(await isProtectionEnabled()).toBe(true)
  })
})
