/**
 * Scanner service
 * Orchestrates Layer 1 (heuristics) and Layer 2 (ML) detection
 */

import { ScanResponse, ScanVerdict, SupportedPlatform, hashContent } from '@decrity/shared'
import { callMLService } from './mlClient.js'

interface HeuristicResult {
  verdict: ScanVerdict
  score: number
  reason: string
}

export async function scanContent(
  content: string,
  source: SupportedPlatform,
  heuristic?: HeuristicResult
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

    // Fail safe, not open: the ML service being unreachable is not evidence
    // that content is clean. Trust the extension's own Layer 1 result if it
    // sent one (it always does for a non-clean scan, see scan.ts's route
    // and PROGRESS.md's Known Issues #5, the bug this replaced). Only a
    // caller that skips Layer 1 entirely hits the no-heuristic branch, in
    // which case flag out of caution rather than guess clean.
    if (heuristic) {
      return {
        verdict: heuristic.verdict,
        score: heuristic.score,
        reason: heuristic.reason,
        detectionLayer: 'heuristic',
        scanId: crypto.randomUUID(),
        timestamp: Date.now(),
      }
    }

    return {
      verdict: 'suspicious',
      score: 0.5,
      reason: 'Unable to complete a full scan right now, flagged out of caution',
      detectionLayer: 'heuristic',
      scanId: crypto.randomUUID(),
      timestamp: Date.now(),
    }
  }
}
