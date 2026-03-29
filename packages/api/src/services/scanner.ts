/**
 * Scanner service
 * Orchestrates Layer 1 (heuristics) and Layer 2 (ML) detection
 */

import { ScanResponse, SupportedPlatform, hashContent } from '@trustlayer/shared'
import { callMLService } from './mlClient.js'

export async function scanContent(
  content: string,
  source: SupportedPlatform
): Promise<ScanResponse> {
  // For v1.0, we primarily rely on ML service
  // The extension handles Layer 1 locally

  const contentHash = await hashContent(content)

  try {
    // Call ML service for classification
    const mlResult = await callMLService(content)

    return {
      verdict: mlResult.verdict,
      score: mlResult.score,
      reason: mlResult.reason,
      detectionLayer: 'ml',
      scanId: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('ML service failed:', error)

    // Fallback to safe verdict
    return {
      verdict: 'clean',
      score: 0,
      reason: 'Unable to complete scan',
      detectionLayer: 'heuristic',
      scanId: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }
}
