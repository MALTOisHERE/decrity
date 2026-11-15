/**
 * Whether the master Protection toggle (the popup's "Protection" switch) is
 * currently on. Read fresh on every call, not cached, so flipping the
 * toggle while a platform tab is already open takes effect on the very
 * next scan, not just after a reload.
 *
 * Defaults to true, matching background/index.ts's getDefaultSettings(),
 * for a user who hasn't saved any settings yet.
 */
import { STORAGE_KEYS } from '@decrity/shared'

export async function isProtectionEnabled(): Promise<boolean> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS)
  const settings = result[STORAGE_KEYS.SETTINGS] as { protectionEnabled?: boolean } | undefined
  return settings?.protectionEnabled ?? true
}
