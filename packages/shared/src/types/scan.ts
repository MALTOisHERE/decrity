/**
 * Scan-related types for TrustLayer
 */

export type ScanVerdict = 'clean' | 'suspicious' | 'threat'

export type ThreatLevel = 'clean' | 'suspicious' | 'threat'

export type SupportedPlatform = 'chatgpt' | 'gemini' | 'claude' | 'copilot'

/**
 * Scan request payload sent from extension to API
 */
export interface ScanRequest {
  content: string
  source: SupportedPlatform
  userId?: string
  timestamp: number
}

/**
 * Scan response from API
 */
export interface ScanResponse {
  verdict: ScanVerdict
  score: number // 0-1 confidence score
  reason?: string // Plain-language explanation
  detectionLayer: 'heuristic' | 'ml' | 'both'
  scanId: string
  timestamp: number
}

/**
 * Cached scan result stored in IndexedDB
 */
export interface CachedScanResult extends ScanResponse {
  contentHash: string
  cachedAt: number
  expiresAt: number
}

/**
 * Threat details for dashboard display
 */
export interface ThreatDetail {
  id: string
  verdict: ThreatLevel
  score: number
  reason: string
  platform: SupportedPlatform
  detectedAt: string
  contentHash: string
}

/**
 * Privacy mode setting
 */
export interface PrivacySettings {
  enabled: boolean // If true, only local heuristics run
  apiCallsDisabled: boolean
  dashboardHistoryDisabled: boolean
}
