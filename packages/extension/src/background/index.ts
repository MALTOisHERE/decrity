/**
 * TrustLayer Background Service Worker
 * Handles scan requests, API communication, caching, and badge updates
 */

import { ScanRequest, ScanResponse, STORAGE_KEYS, BADGE_COLORS, BADGE_TEXT } from '@trustlayer/shared'
import { scanContent } from './scanner'
import { getCachedScan, cacheScanResult } from './cache'
import { getAuthToken } from './auth'

console.log('TrustLayer background service worker initialized')

/**
 * Message handler for content scripts
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_CONTENT') {
    handleScanRequest(message.payload, sender.tab?.id)
      .then(sendResponse)
      .catch(error => {
        console.error('Scan error:', error)
        sendResponse({ error: error.message })
      })
    return true // Keep message channel open for async response
  }

  if (message.type === 'UPDATE_BADGE') {
    updateBadge(message.payload.verdict, sender.tab?.id)
    sendResponse({ success: true })
    return false
  }

  if (message.type === 'GET_SETTINGS') {
    getSettings()
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }))
    return true
  }
})

/**
 * Handle scan request from content script
 */
async function handleScanRequest(
  request: ScanRequest,
  tabId?: number
): Promise<ScanResponse> {
  try {
    // Check cache first
    const cached = await getCachedScan(request.content)
    if (cached) {
      console.log('Cache hit for scan')
      updateBadge(cached.verdict, tabId)
      return cached
    }

    // Perform scan
    const result = await scanContent(request)

    // Cache result
    await cacheScanResult(request.content, result)

    // Update badge
    updateBadge(result.verdict, tabId)

    return result
  } catch (error) {
    console.error('Scan request failed:', error)
    throw error
  }
}

/**
 * Update extension badge based on threat level
 */
function updateBadge(verdict: 'clean' | 'suspicious' | 'threat', tabId?: number) {
  const color = BADGE_COLORS[verdict.toUpperCase() as keyof typeof BADGE_COLORS]
  const text = BADGE_TEXT[verdict.toUpperCase() as keyof typeof BADGE_TEXT]

  if (tabId) {
    chrome.action.setBadgeBackgroundColor({ color, tabId })
    chrome.action.setBadgeText({ text, tabId })
  } else {
    chrome.action.setBadgeBackgroundColor({ color })
    chrome.action.setBadgeText({ text })
  }
}

/**
 * Get user settings from storage
 */
async function getSettings() {
  const result = await chrome.storage.sync.get([
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.PRIVACY_MODE,
  ])

  return {
    settings: result[STORAGE_KEYS.SETTINGS] || getDefaultSettings(),
    privacyMode: result[STORAGE_KEYS.PRIVACY_MODE] || false,
  }
}

/**
 * Default settings for new users
 */
function getDefaultSettings() {
  return {
    protectionEnabled: true,
    privacyMode: true, // Privacy mode on by default (Layer 1 only)
    notificationsEnabled: true,
    alertLevel: 'suspicious-and-threat',
    supportedPlatforms: {
      chatgpt: true,
      gemini: true,
      claude: true,
      copilot: true,
    },
  }
}

/**
 * Installation/update handler
 */
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    console.log('TrustLayer installed')
    // Initialize default settings
    chrome.storage.sync.set({
      [STORAGE_KEYS.SETTINGS]: getDefaultSettings(),
      [STORAGE_KEYS.PRIVACY_MODE]: true,
    })

    // Open onboarding page
    // chrome.tabs.create({ url: 'onboarding.html' })
  } else if (details.reason === 'update') {
    console.log('TrustLayer updated to version', chrome.runtime.getManifest().version)
  }
})

export {}
