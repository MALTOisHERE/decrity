import { describe, it, expect } from 'vitest'
import { hashContent, quickHash } from './hash'

describe('hashContent', () => {
  it('returns a 64-character lowercase hex SHA-256 digest', async () => {
    const hash = await hashContent('hello world')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic for the same input', async () => {
    const a = await hashContent('the quick brown fox')
    const b = await hashContent('the quick brown fox')
    expect(a).toBe(b)
  })

  it('produces different digests for different input', async () => {
    const a = await hashContent('content A')
    const b = await hashContent('content B')
    expect(a).not.toBe(b)
  })
})

describe('quickHash', () => {
  it('always returns a non-negative integer', () => {
    expect(quickHash('')).toBeGreaterThanOrEqual(0)
    expect(quickHash('anything at all')).toBeGreaterThanOrEqual(0)
    expect(Number.isInteger(quickHash('anything at all'))).toBe(true)
  })

  it('is deterministic for the same input', () => {
    expect(quickHash('repeatable')).toBe(quickHash('repeatable'))
  })

  it('produces different values for different input', () => {
    expect(quickHash('content A')).not.toBe(quickHash('content B'))
  })
})
