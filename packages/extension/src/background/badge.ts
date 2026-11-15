/**
 * Toolbar icon state (verdict, Protection Gap, Protection on/off).
 *
 * Replaces the old chrome.action.setBadgeText()/setBadgeBackgroundColor()
 * approach, which overlaid a tiny Chrome-rendered text glyph (e.g. the
 * circle character U+25CB for "disabled") on a small colored rectangle.
 * Chrome controls that glyph's font and centering itself, which is exactly
 * why it looked malformed. Swapping the whole action icon via setIcon()
 * instead gives full control over the shape, so each state gets its own
 * properly centered icon (see public/badges/*.png, generated at build-asset
 * time, not runtime, so there's nothing to compute per tab beyond picking a
 * path).
 */
import { ScanVerdict } from '@decrity/shared'

type BadgeState = ScanVerdict | 'disabled' | 'gap'

const ICON_SIZES = [16, 32, 48, 128] as const

function badgeIconPath(state: BadgeState): Record<number, string> {
  const path: Record<number, string> = {}
  for (const size of ICON_SIZES) {
    path[size] = `badges/${state}-${size}.png`
  }
  return path
}

const DEFAULT_ICON_PATH: Record<number, string> = {
  16: 'icons/icon-16.png',
  32: 'icons/icon-32.png',
  48: 'icons/icon-48.png',
  128: 'icons/icon-128.png',
}

/**
 * Reflect a scan verdict on the toolbar icon for one tab.
 */
export function setVerdictIcon(verdict: ScanVerdict, tabId?: number): void {
  chrome.action.setIcon({ path: badgeIconPath(verdict), tabId })
}

/**
 * Show the Protection Gap icon while in a gap, or revert to the plain
 * brand icon once it resolves.
 */
export function setGapIcon(inGap: boolean, tabId?: number): void {
  const path = inGap ? badgeIconPath('gap') : DEFAULT_ICON_PATH
  chrome.action.setIcon({ path, tabId })
}

/**
 * Reflects the popup's master Protection toggle on the toolbar icon.
 *
 * Updates both the extension-wide default (chrome.action.setIcon with no
 * tabId, used for any platform tab opened after this point) and every
 * already-open platform tab explicitly, since a tab-specific icon set by
 * an earlier scan verdict would otherwise keep overriding the default.
 */
export async function applyProtectionEnabledBadge(enabled: boolean): Promise<void> {
  const path = enabled ? DEFAULT_ICON_PATH : badgeIconPath('disabled')

  chrome.action.setIcon({ path })

  const hostPermissions = chrome.runtime.getManifest().host_permissions ?? []
  if (hostPermissions.length === 0) return

  const tabs = await chrome.tabs.query({ url: hostPermissions })

  for (const tab of tabs) {
    if (tab.id === undefined) continue
    chrome.action.setIcon({ path, tabId: tab.id })
  }
}
