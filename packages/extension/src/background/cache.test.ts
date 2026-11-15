import 'fake-indexeddb/auto'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { CACHE_CONFIG, ScanResponse } from '@decrity/shared'
import { getCachedScan, cacheScanResult, clearExpiredCache } from './cache'

const sampleResult: ScanResponse = {
  verdict: 'clean',
  score: 0,
  reason: 'No suspicious patterns detected',
  detectionLayer: 'heuristic',
  scanId: 'test-scan-id',
  timestamp: 0,
}

describe('scan result cache', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a cached result before it expires', async () => {
    await cacheScanResult('cache-test-fresh', sampleResult)
    const cached = await getCachedScan('cache-test-fresh')
    expect(cached?.verdict).toBe('clean')
  })

  it('returns null once the TTL has passed, and removes the stale entry', async () => {
    const nowSpy = vi.spyOn(Date, 'now')
    nowSpy.mockReturnValue(1_000_000)
    await cacheScanResult('cache-test-expired', sampleResult)

    nowSpy.mockReturnValue(1_000_000 + CACHE_CONFIG.SCAN_RESULT_TTL + 1)
    const expired = await getCachedScan('cache-test-expired')
    expect(expired).toBeNull()

    // Entry should have been deleted by the expiry check, not just skipped.
    nowSpy.mockReturnValue(1_000_000)
    const afterDeletion = await getCachedScan('cache-test-expired')
    expect(afterDeletion).toBeNull()
  })

  it('clearExpiredCache only removes entries past their own TTL', async () => {
    const nowSpy = vi.spyOn(Date, 'now')

    nowSpy.mockReturnValue(2_000_000)
    await cacheScanResult('cache-test-still-fresh', sampleResult)

    nowSpy.mockReturnValue(2_000_000 - CACHE_CONFIG.SCAN_RESULT_TTL - 1)
    await cacheScanResult('cache-test-already-stale', sampleResult)

    nowSpy.mockReturnValue(2_000_000)
    await clearExpiredCache()

    nowSpy.mockReturnValue(2_000_000)
    expect(await getCachedScan('cache-test-still-fresh')).not.toBeNull()
    expect(await getCachedScan('cache-test-already-stale')).toBeNull()
  })
})
