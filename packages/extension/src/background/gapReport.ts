/**
 * Gap Report sending (wayfinder ticket 003).
 *
 * Sends a content-free report (platform id, timestamp, extension version,
 * nothing else) when a platform enters a Protection Gap, deduped client-side
 * to at most once per platform per 24h via chrome.storage.local. No auth
 * required: anonymous installs (common in Privacy Mode) must still be able
 * to report a gap, so a bearer token is attached only if one already exists.
 */

import { SupportedPlatform, STORAGE_KEYS, API_ENDPOINTS, GapReportAPI } from '@decrity/shared'
import { getAuthToken } from './auth'

const DEDUPE_WINDOW_MS = 86400000 // 24h

type GapReportLog = Partial<Record<SupportedPlatform, number>>

async function getGapReportLog(): Promise<GapReportLog> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.GAP_REPORTS)
  return result[STORAGE_KEYS.GAP_REPORTS] ?? {}
}

async function setGapReportLog(log: GapReportLog): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.GAP_REPORTS]: log })
}

/**
 * Sends a Gap Report for `platform` unless one was already sent within the
 * last 24h, in which case this is a no-op (the stored timestamp is left
 * untouched, per ticket 003).
 */
export async function maybeSendGapReport(platform: SupportedPlatform): Promise<void> {
  const log = await getGapReportLog()
  const lastReportedAt = log[platform] ?? 0

  if (Date.now() - lastReportedAt < DEDUPE_WINDOW_MS) {
    return
  }

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = await getAuthToken()

    const body: GapReportAPI.Request = {
      source: platform,
      timestamp: Date.now(),
      extensionVersion: chrome.runtime.getManifest().version,
    }

    const response = await fetch(`${apiUrl}${API_ENDPOINTS.GAP_REPORT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Gap report failed: ${response.statusText}`)
    }

    log[platform] = Date.now()
    await setGapReportLog(log)
  } catch (error) {
    console.error('Gap report failed, will retry on the next detected gap:', error)
  }
}
