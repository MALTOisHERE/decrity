/**
 * Validation utilities
 */

import { SupportedPlatform, ScanVerdict } from '../types/scan'

/**
 * Check if a value is a valid platform
 */
export function isValidPlatform(value: unknown): value is SupportedPlatform {
  return (
    typeof value === 'string' &&
    ['chatgpt', 'gemini', 'claude', 'copilot'].includes(value)
  )
}

/**
 * Check if a value is a valid scan verdict
 */
export function isValidVerdict(value: unknown): value is ScanVerdict {
  return typeof value === 'string' && ['clean', 'suspicious', 'threat'].includes(value)
}

/**
 * Validate confidence score (0-1)
 */
export function isValidScore(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && value <= 1
}

/**
 * Sanitize content for scanning (remove excessive whitespace, etc.)
 */
export function sanitizeContent(content: string): string {
  return content.trim().replace(/\s+/g, ' ')
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if content is too short to be meaningful
 */
export function isContentTooShort(content: string): boolean {
  const MIN_CONTENT_LENGTH = 10
  return content.trim().length < MIN_CONTENT_LENGTH
}

/**
 * Check if content is too long to process
 */
export function isContentTooLong(content: string): boolean {
  const MAX_CONTENT_LENGTH = 50000 // ~50KB
  return content.length > MAX_CONTENT_LENGTH
}
