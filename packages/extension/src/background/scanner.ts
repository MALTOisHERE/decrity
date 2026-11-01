/**
 * Content scanning logic
 * Implements Layer 1 (local heuristics) and coordinates with API for Layer 2 (ML)
 */

import {
  ScanRequest,
  ScanResponse,
  STORAGE_KEYS,
  API_ENDPOINTS,
  hashContent,
} from '@decrity/shared'
import { runHeuristicScan } from '../shared/heuristics'
import { getAuthToken } from './auth'

/**
 * Main scan function
 * Routes to local-only or API-based scan depending on privacy mode
 */
export async function scanContent(request: ScanRequest): Promise<ScanResponse> {
  // Check privacy mode setting
  const { privacyMode } = await chrome.storage.sync.get(STORAGE_KEYS.PRIVACY_MODE)

  if (privacyMode) {
    // Privacy mode: local heuristics only
    return runLocalScan(request)
  } else {
    // Full scan: local heuristics + API ML classifier
    return runFullScan(request)
  }
}

/**
 * Run local-only scan (Layer 1 heuristics)
 */
async function runLocalScan(request: ScanRequest): Promise<ScanResponse> {
  const heuristicResult = runHeuristicScan(request.content)

  return {
    verdict: heuristicResult.verdict,
    score: heuristicResult.score,
    reason: heuristicResult.reason,
    detectionLayer: 'heuristic',
    scanId: crypto.randomUUID(),
    timestamp: Date.now(),
  }
}

/**
 * Run full scan (Layer 1 + Layer 2 via API)
 */
async function runFullScan(request: ScanRequest): Promise<ScanResponse> {
  // First run local heuristics
  const heuristicResult = runHeuristicScan(request.content)

  // If heuristics say it's clean, trust that and don't call API
  if (heuristicResult.verdict === 'clean') {
    return {
      verdict: 'clean',
      score: heuristicResult.score,
      reason: 'No suspicious patterns detected',
      detectionLayer: 'heuristic',
      scanId: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }

  // If suspicious or threat, call API for ML classification
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const token = await getAuthToken()

    const contentHash = await hashContent(request.content)

    const response = await fetch(`${apiUrl}${API_ENDPOINTS.SCAN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        content: request.content,
        source: request.source,
        contentHash,
      }),
    })

    if (!response.ok) {
      throw new Error(`API scan failed: ${response.statusText}`)
    }

    const result: ScanResponse = await response.json()
    return result
  } catch (error) {
    console.error('API scan failed, falling back to heuristic result:', error)
    // Fallback to heuristic result if API fails
    return {
      verdict: heuristicResult.verdict,
      score: heuristicResult.score,
      reason: heuristicResult.reason,
      detectionLayer: 'heuristic',
      scanId: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }
}
