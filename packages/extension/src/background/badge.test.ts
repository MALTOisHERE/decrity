import { describe, it, expect, vi, afterEach } from 'vitest'
import { applyProtectionEnabledBadge, setGapIcon, setVerdictIcon } from './badge'

function stubChrome(tabs: { id?: number }[] = [], hostPermissions: string[] = []) {
  const setIcon = vi.fn()
  vi.stubGlobal('chrome', {
    runtime: {
      getManifest: vi.fn().mockReturnValue({ host_permissions: hostPermissions }),
    },
    tabs: {
      query: vi.fn().mockResolvedValue(tabs),
    },
    action: { setIcon },
  })
  return setIcon
}

const DEFAULT_ICON_PATH = {
  16: 'icons/icon-16.png',
  32: 'icons/icon-32.png',
  48: 'icons/icon-48.png',
  128: 'icons/icon-128.png',
}

describe('setVerdictIcon', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets the icon matching the verdict, scoped to the given tab', () => {
    const setIcon = stubChrome()
    setVerdictIcon('threat', 42)
    expect(setIcon).toHaveBeenCalledWith({
      path: { 16: 'badges/threat-16.png', 32: 'badges/threat-32.png', 48: 'badges/threat-48.png', 128: 'badges/threat-128.png' },
      tabId: 42,
    })
  })
})

describe('setGapIcon', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the gap icon while in a gap', () => {
    const setIcon = stubChrome()
    setGapIcon(true, 7)
    expect(setIcon).toHaveBeenCalledWith({
      path: { 16: 'badges/gap-16.png', 32: 'badges/gap-32.png', 48: 'badges/gap-48.png', 128: 'badges/gap-128.png' },
      tabId: 7,
    })
  })

  it('reverts to the plain brand icon once the gap resolves', () => {
    const setIcon = stubChrome()
    setGapIcon(false, 7)
    expect(setIcon).toHaveBeenCalledWith({ path: DEFAULT_ICON_PATH, tabId: 7 })
  })
})

describe('applyProtectionEnabledBadge', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sets the disabled icon as the default and on every open platform tab', async () => {
    const setIcon = stubChrome([{ id: 1 }, { id: 2 }], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(false)

    const disabledPath = {
      16: 'badges/disabled-16.png',
      32: 'badges/disabled-32.png',
      48: 'badges/disabled-48.png',
      128: 'badges/disabled-128.png',
    }
    expect(setIcon).toHaveBeenCalledWith({ path: disabledPath })
    expect(setIcon).toHaveBeenCalledWith({ path: disabledPath, tabId: 1 })
    expect(setIcon).toHaveBeenCalledWith({ path: disabledPath, tabId: 2 })
  })

  it('reverts to the plain brand icon on every open tab when re-enabled', async () => {
    const setIcon = stubChrome([{ id: 1 }], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(true)

    expect(setIcon).toHaveBeenCalledWith({ path: DEFAULT_ICON_PATH })
    expect(setIcon).toHaveBeenCalledWith({ path: DEFAULT_ICON_PATH, tabId: 1 })
  })

  it('skips tabs with no id', async () => {
    const setIcon = stubChrome([{}], ['https://chatgpt.com/*'])

    await applyProtectionEnabledBadge(false)

    // Only the one extension-wide default call, no per-tab call for the id-less tab.
    expect(setIcon).toHaveBeenCalledTimes(1)
  })

  it('skips the tab query entirely when there are no declared host permissions', async () => {
    const setIcon = stubChrome([{ id: 1 }], [])

    await applyProtectionEnabledBadge(false)

    expect(chrome.tabs.query).not.toHaveBeenCalled()
    expect(setIcon).toHaveBeenCalledTimes(1)
  })
})
