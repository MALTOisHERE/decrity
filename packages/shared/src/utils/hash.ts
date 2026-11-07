/**
 * Cryptographic hashing utilities
 */

/**
 * Generate SHA-256 hash of content
 * Used for content deduplication without storing actual content
 *
 * Uses the Web Crypto API (`crypto.subtle`), available as a global in both
 * browsers and Node.js 20+ (this project's minimum, see root package.json's
 * engines field), so no separate Node-specific fallback is needed.
 */
export async function hashContent(content: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('No crypto implementation available')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Fast non-cryptographic hash for quick comparisons
 */
export function quickHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}
