/**
 * Settings persistence helpers for the popup
 */

import { STORAGE_KEYS } from '@decrity/shared'

export interface Settings {
  protectionEnabled: boolean
  privacyMode: boolean
  notificationsEnabled: boolean
}

/**
 * Builds the chrome.storage.sync.set payload for a settings change.
 *
 * scanner.ts's scanContent() reads Privacy Mode from its own flat storage
 * key (STORAGE_KEYS.PRIVACY_MODE), not from inside the settings object, so
 * both must be written together whenever privacyMode changes. Otherwise the
 * popup toggle updates its own settings blob but never touches the key that
 * actually controls local-only vs. full scanning.
 */
export function buildSettingsUpdate(
  newSettings: Settings,
  changedKey: keyof Settings
): Record<string, unknown> {
  const update: Record<string, unknown> = { [STORAGE_KEYS.SETTINGS]: newSettings }

  if (changedKey === 'privacyMode') {
    update[STORAGE_KEYS.PRIVACY_MODE] = newSettings.privacyMode
  }

  return update
}
