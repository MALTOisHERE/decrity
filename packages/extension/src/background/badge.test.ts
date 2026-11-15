import { describe, it, expect, vi, afterEach } from 'vitest'
import { BADGE_COLORS, BADGE_TEXT } from '@decrity/shared'
import { applyProtectionEnabledBadge } from './badge'

function stubChrome(tabs: { id?: number }[], hostPermissions: string[]) {
  vi.stubGlobal('chrome', {
    runtime: {
      getManifest: vi.fn().mockReturnValue({ host_permissions: hostPermissions }),
    },
    tabs: {
      query: vi.fn().mockResolvedValue(tabs),
    },
    action: {
      setBadgeText: vi.fn(),
      setBadgeBackgroundColor: vi.fn(),
    },
  })
}

describe('applyProtectionEnabledBadge', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets the disabled badge as the default and on every open platform tab', async () => {
    stubChrome([{ id: 1 }, { id: 2 }], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(false)

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.DISABLED })
    expect(chrome.action.setBadgeBackgroundColor).toHaveBeenCalledWith({ color: BADGE_COLORS.DISABLED })
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.DISABLED, tabId: 1 })
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: BADGE_TEXT.DISABLED, tabId: 2 })
  })

  it('clears the badge back to neutral on every open tab when re-enabled', async () => {
    stubChrome([{ id: 1 }], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(true)

    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '' })
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '', tabId: 1 })
    expect(chrome.action.setBadgeBackgroundColor).not.toHaveBeenCalled()
  })

  it('skips tabs with no id', async () => {
    stubChrome([{}], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(false)

    // Only the one extension-wide default call, no per-tab call for the id-less tab.
    expect(chrome.action.setBadgeText).toHaveBeenCalledTimes(1)
  })

  it('skips the tab query entirely when there are no declared host permissions', async () => {
    stubChrome([{ id: 1 }], [])

    await applyProtectionEnabledBadge(false)

    expect(chrome.tabs.query).not.toHaveBeenCalled()
  })
})
