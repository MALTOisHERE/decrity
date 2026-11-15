/**
 * Reflects the popup's master Protection toggle on the toolbar badge.
 *
 * Updates both the extension-wide default (chrome.action.setBadgeText with
 * no tabId, used for any platform tab opened after this point) and every
 * already-open platform tab explicitly, since a tab-specific badge set by
 * an earlier scan verdict would otherwise keep overriding the default.
 */
import { BADGE_COLORS, BADGE_TEXT } from '@decrity/shared'

export async function applyProtectionEnabledBadge(enabled: boolean): Promise<void> {
  const text = enabled ? '' : BADGE_TEXT.DISABLED

  chrome.action.setBadgeText({ text })
  if (!enabled) {
    chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.DISABLED })
  }

  const hostPermissions = chrome.runtime.getManifest().host_permissions ?? []
  if (hostPermissions.length === 0) return

  const tabs = await chrome.tabs.query({ url: hostPermissions })

  for (const tab of tabs) {
    if (tab.id === undefined) continue
    chrome.action.setBadgeText({ text, tabId: tab.id })
    if (!enabled) {
      chrome.action.setBadgeBackgroundColor({ color: BADGE_COLORS.DISABLED, tabId: tab.id })
    }
  }
}
