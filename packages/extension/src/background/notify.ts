/**
 * System notifications for flagged scans, so a threat is noticed even if
 * the platform tab isn't focused. Gated by the popup's "Notifications"
 * toggle (STORAGE_KEYS.SETTINGS.notificationsEnabled).
 */
import { ScanResponse, STORAGE_KEYS } from '@decrity/shared'

async function notificationsEnabled(): Promise<boolean> {
  const stored = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)
  const settings = stored[STORAGE_KEYS.SETTINGS] as { notificationsEnabled?: boolean } | undefined
  return settings?.notificationsEnabled ?? true
}

export async function maybeNotify(result: ScanResponse): Promise<void> {
  if (result.verdict === 'clean') return
  if (!(await notificationsEnabled())) return

  const title =
    result.verdict === 'threat' ? 'Content flagged as a threat' : 'Potentially suspicious content'

  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title,
    message: result.reason || 'Decrity flagged something in what you were about to send.',
  })
}
