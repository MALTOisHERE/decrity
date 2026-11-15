import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('./mlClient.js', () => ({
  callMLService: vi.fn(),
}))

import { callMLService } from './mlClient.js'
import { scanContent } from './scanner.js'

const heuristic = {
  verdict: 'threat' as const,
  score: 0.8,
  reason: 'Heuristic flagged this content as a likely threat',
}

describe('scanContent', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('returns the ML result when the ML service responds', async () => {
    vi.mocked(callMLService).mockResolvedValue({
      verdict: 'suspicious',
      score: 0.5,
      reason: 'ML flagged this as suspicious',
    })

    const result = await scanContent('some content')

    expect(result.detectionLayer).toBe('ml')
    expect(result.verdict).toBe('suspicious')
  })

  it('falls back to the caller-supplied heuristic verdict when the ML service fails, not a hardcoded clean', async () => {
    vi.mocked(callMLService).mockRejectedValue(new Error('ML service unreachable'))

    const result = await scanContent('some content', heuristic)

    expect(result.detectionLayer).toBe('heuristic')
    expect(result.verdict).toBe('threat')
    expect(result.verdict).not.toBe('clean')
  })

  it('fails safe to suspicious, never clean, when the ML service fails and no heuristic was sent', async () => {
    vi.mocked(callMLService).mockRejectedValue(new Error('ML service unreachable'))

    const result = await scanContent('some content')

    expect(result.verdict).toBe('suspicious')
    expect(result.verdict).not.toBe('clean')
  })
})
