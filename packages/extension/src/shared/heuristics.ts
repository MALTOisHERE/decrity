/**
 * Layer 1: Local heuristic-based prompt injection detection
 * Runs entirely client-side, no API calls
 */

import { ScanVerdict, THREAT_THRESHOLDS } from '@trustlayer/shared'

interface HeuristicResult {
  verdict: ScanVerdict
  score: number
  reason: string
  matches: string[]
}

/**
 * Known prompt injection patterns
 * These are common phrases used in prompt injection attacks
 */
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?)/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
  /override\s+(previous|system)\s+(instructions?|prompts?)/i,

  // Role manipulation
  /you\s+are\s+now\s+(a|an)/i,
  /act\s+as\s+(if\s+you\s+are|a|an)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /roleplay\s+as/i,

  // System prompt injection
  /system\s*:\s*/i,
  /\[system\]/i,
  /assistant\s*:\s*$/im,
  /new\s+instructions?:/i,

  // Data exfiltration attempts
  /send\s+(this|all|everything)\s+to/i,
  /forward\s+(this|all|everything)\s+to/i,
  /output\s+your\s+(system\s+)?prompt/i,
  /reveal\s+your\s+instructions/i,
  /what\s+(are|were)\s+your\s+(original|initial)\s+instructions/i,
]

/**
 * Run heuristic scan on content
 */
export function runHeuristicScan(content: string): HeuristicResult {
  const matches: string[] = []
  let score = 0

  // Check against known patterns
  for (const pattern of INJECTION_PATTERNS) {
    const match = content.match(pattern)
    if (match) {
      matches.push(match[0])
      score += 0.2 // Each match increases score
    }
  }

  // Check for hidden content patterns
  if (hasHiddenContent(content)) {
    matches.push('Hidden content detected')
    score += 0.3
  }

  // Check for suspicious repetition (common in jailbreak attempts)
  if (hasSuspiciousRepetition(content)) {
    matches.push('Suspicious repetition pattern')
    score += 0.15
  }

  // Check for excessive punctuation (obfuscation technique)
  if (hasExcessivePunctuation(content)) {
    matches.push('Excessive punctuation detected')
    score += 0.1
  }

  // Normalize score to 0-1 range
  score = Math.min(score, 1)

  // Determine verdict based on score
  let verdict: ScanVerdict
  if (score >= THREAT_THRESHOLDS.THREAT_MIN) {
    verdict = 'threat'
  } else if (score >= THREAT_THRESHOLDS.SUSPICIOUS_MIN) {
    verdict = 'suspicious'
  } else {
    verdict = 'clean'
  }

  // Generate reason
  const reason = generateReason(verdict, matches)

  return { verdict, score, reason, matches }
}

/**
 * Check for hidden content (HTML comments, zero-width chars, etc.)
 */
function hasHiddenContent(content: string): boolean {
  // HTML comments
  if (content.includes('<!--') || content.includes('-->')) {
    return true
  }

  // Zero-width characters
  const zeroWidthChars = /[\u200B-\u200D\uFEFF]/
  if (zeroWidthChars.test(content)) {
    return true
  }

  // Unusual Unicode characters often used for hiding
  const suspiciousUnicode = /[\u2060-\u2069]/
  if (suspiciousUnicode.test(content)) {
    return true
  }

  return false
}

/**
 * Check for suspicious repetition patterns
 */
function hasSuspiciousRepetition(content: string): boolean {
  const words = content.toLowerCase().split(/\s+/)
  const wordCounts: Record<string, number> = {}

  for (const word of words) {
    if (word.length < 3) continue // Skip short words
    wordCounts[word] = (wordCounts[word] || 0) + 1
  }

  // If any word appears more than 20% of total words, suspicious
  const totalWords = words.filter(w => w.length >= 3).length
  for (const count of Object.values(wordCounts)) {
    if (count / totalWords > 0.2) {
      return true
    }
  }

  return false
}

/**
 * Check for excessive punctuation (obfuscation)
 */
function hasExcessivePunctuation(content: string): boolean {
  const punctuationCount = (content.match(/[!?.,;:'"]/g) || []).length
  const totalChars = content.length

  // If more than 10% punctuation, suspicious
  return punctuationCount / totalChars > 0.1
}

/**
 * Generate plain-language reason
 */
function generateReason(verdict: ScanVerdict, matches: string[]): string {
  if (verdict === 'clean') {
    return 'No suspicious patterns detected'
  }

  if (verdict === 'suspicious') {
    return `This content contains patterns that may be attempting to manipulate the AI${
      matches.length > 0 ? `: ${matches[0]}` : ''
    }`
  }

  // threat
  return `This content likely contains hidden instructions trying to hijack the AI's behavior${
    matches.length > 0 ? `: ${matches.slice(0, 2).join(', ')}` : ''
  }`
}
