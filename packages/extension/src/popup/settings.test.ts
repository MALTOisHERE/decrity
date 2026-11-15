import { describe, it, expect } from 'vitest'
import { STORAGE_KEYS } from '@decrity/shared'
import { buildSettingsUpdate, type Settings } from './settings'

const settings: Settings = {
  protectionEnabled: true,
  privacyMode: false,
  notificationsEnabled: true,
}

describe('buildSettingsUpdate', () => {
  it('always writes the full settings object', () => {
    const update = buildSettingsUpdate(settings, 'notificationsEnabled')
    expect(update[STORAGE_KEYS.SETTINGS]).toEqual(settings)
  })

  it('also writes the flat privacy mode key scanner.ts reads, when privacyMode changes', () => {
    const update = buildSettingsUpdate(settings, 'privacyMode')
    expect(update[STORAGE_KEYS.PRIVACY_MODE]).toBe(false)
  })

  it('does not touch the flat privacy mode key when a different setting changes', () => {
    const update = buildSettingsUpdate(settings, 'protectionEnabled')
    expect(STORAGE_KEYS.PRIVACY_MODE in update).toBe(false)
  })
})
