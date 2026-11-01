/**
 * Authentication token management
 */

import { STORAGE_KEYS } from '@decrity/shared'

/**
 * Get auth token from storage
 */
export async function getAuthToken(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN)
  return result[STORAGE_KEYS.AUTH_TOKEN] || null
}

/**
 * Set auth token in storage
 */
export async function setAuthToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: token })
}

/**
 * Clear auth token
 */
export async function clearAuthToken(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.AUTH_TOKEN)
}

/**
 * Get user ID from storage
 */
export async function getUserId(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.USER_ID)
  return result[STORAGE_KEYS.USER_ID] || null
}

/**
 * Set user ID in storage
 */
export async function setUserId(userId: string): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.USER_ID]: userId })
}
