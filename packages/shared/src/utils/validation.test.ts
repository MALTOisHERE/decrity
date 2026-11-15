import { describe, it, expect } from 'vitest'
import {
  isValidPlatform,
  isValidVerdict,
  isValidScore,
  sanitizeContent,
  isValidEmail,
  isContentTooShort,
  isContentTooLong,
} from './validation'

describe('isValidPlatform', () => {
  it('accepts every supported platform id', () => {
    expect(isValidPlatform('chatgpt')).toBe(true)
    expect(isValidPlatform('gemini')).toBe(true)
    expect(isValidPlatform('claude')).toBe(true)
    expect(isValidPlatform('copilot')).toBe(true)
  })

  it('rejects an unsupported string and non-string values', () => {
    expect(isValidPlatform('bing')).toBe(false)
    expect(isValidPlatform(null)).toBe(false)
    expect(isValidPlatform(42)).toBe(false)
  })
})

describe('isValidVerdict', () => {
  it('accepts every scan verdict', () => {
    expect(isValidVerdict('clean')).toBe(true)
    expect(isValidVerdict('suspicious')).toBe(true)
    expect(isValidVerdict('threat')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isValidVerdict('malicious')).toBe(false)
    expect(isValidVerdict(undefined)).toBe(false)
  })
})

describe('isValidScore', () => {
  it('accepts numbers within the 0-1 range, inclusive', () => {
    expect(isValidScore(0)).toBe(true)
    expect(isValidScore(1)).toBe(true)
    expect(isValidScore(0.5)).toBe(true)
  })

  it('rejects out-of-range numbers and non-numbers', () => {
    expect(isValidScore(-0.01)).toBe(false)
    expect(isValidScore(1.01)).toBe(false)
    expect(isValidScore('0.5')).toBe(false)
  })
})

describe('sanitizeContent', () => {
  it('trims and collapses internal whitespace runs to a single space', () => {
    expect(sanitizeContent('  hello   world  \n\n  ')).toBe('hello world')
  })

  it('leaves already-clean content untouched', () => {
    expect(sanitizeContent('hello world')).toBe('hello world')
  })
})

describe('isValidEmail', () => {
  it('accepts a well-formed address', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('rejects an address with no @ sign', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })

  it('rejects an address with no domain suffix', () => {
    expect(isValidEmail('test@example')).toBe(false)
  })

  it('rejects incidental whitespace, since the pattern is anchored', () => {
    expect(isValidEmail('  test@example.com  ')).toBe(false)
  })
})

describe('isContentTooShort', () => {
  it('flags content under 10 characters after trimming', () => {
    expect(isContentTooShort('short')).toBe(true)
    expect(isContentTooShort('   padded ')).toBe(true)
  })

  it('does not flag content at or over the 10 character floor', () => {
    expect(isContentTooShort('exactly10c')).toBe(false)
  })
})

describe('isContentTooLong', () => {
  it('does not flag content at or under the 50000 character ceiling', () => {
    expect(isContentTooLong('a'.repeat(50000))).toBe(false)
  })

  it('flags content over the ceiling', () => {
    expect(isContentTooLong('a'.repeat(50001))).toBe(true)
  })
})
