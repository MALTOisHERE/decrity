/**
 * Layer 1: Local heuristic-based prompt injection detection
 * Runs entirely client-side, no API calls
 */

import { ScanVerdict, THREAT_THRESHOLDS } from '@decrity/shared'

interface HeuristicResult {
  verdict: ScanVerdict
  score: number
  reason: string
  matches: string[]
}

/**
 * Known prompt injection patterns, covering: direct instruction overrides,
 * role-manipulation jailbreaks, system prompt extraction, data exfiltration,
 * indirect injection (content addressed at "the AI" rather than the human
 * reader), and fake system/role tags. Verified against a representative
 * corpus of ~85 documented attack examples plus held-out paraphrases not
 * used while tuning these patterns (see test-fixtures/injection-corpus.json
 * and heuristics.corpus.test.ts); a prior, narrower version of this list
 * caught under a third of that corpus.
 *
 * The role-manipulation pattern below only scores when a jailbreak-style
 * framing ("act as", "pretend you are", ...) is paired with a nearby
 * "unrestricted" qualifier, not on the framing alone: "act as a professional
 * editor" and "pretend you're explaining this to a 5-year-old" are common,
 * entirely benign phrasings and must not be flagged just for using those
 * words. Same reasoning kept the forward-to-URL pattern scoped to targets
 * that look like a URL, domain, or email, not just "forward X to Y" (which
 * would otherwise flag "forward this to my colleague"), and kept platform
 * names (ChatGPT, Claude, ...) out of the indirect-injection pattern, since
 * "Dear ChatGPT" / "Hey Claude" is just how people normally address these
 * products.
 */
const INJECTION_PATTERNS = [
  // Direct instruction overrides
  /ignore\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|directives?|guidelines?)/i,
  /disregard\s+(all\s+|any\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|constraints?)/i,
  /disregard\s+(everything|anything|the)\s+(above|before|prior)/i,
  /reveal\s+what\s+you\s+(were|was)\s+told/i,
  /forget\s+(all\s+|any\s+|your\s+)?(previous|prior|above|earlier)?\s*(instructions?|rules?|constraints?)/i,
  /forget\s+everything\s+you\s+(were\s+told|were\s+given|learned)/i,
  /override\s+(all\s+|any\s+)?(previous|prior|system)\s+(instructions?|prompts?|rules?|directives?)/i,
  /(previous\s+)?instructions\s+(are|is)\s+(void|cancelled|no\s+longer\s+(valid|apply))/i,
  /cancel\s+(all\s+)?(previous|prior)\s+directives/i,
  /new\s+instructions?\s*:/i,
  /without\s+(any\s+)?(filters?|restrictions?|limits?|limitations?)/i,
  /(from\s+now\s+on|starting\s+now),?\s+(ignore|disregard|forget)/i,
  /do\s+whatever\s+i\s+say/i,

  // Role manipulation / jailbreaks
  /\b(you\s+are\s+now|you'?re\s+now|act\s+as|pretend\s+(to\s+be|you\s+are)|roleplay\s+as|imagine\s+you\s+are|simulate\s+being|let'?s\s+play\s+a\s+game)\b[^.]{0,80}\b(unrestricted|no\s+(rules?|restrictions?|filters?|limits?|ethics?|guidelines?|content\s+policy)|without\s+(any\s+)?(rules?|restrictions?|filters?|ethical\s+constraints?)|do\s+anything\s+now|jailbroken|no\s+limits?|escaped\s+(its|the)\s+sandbox|always\s+(answers?|responds?)\s+truthfully\s+with\s+no\s+limits?|hacker|bypass\s+(any\s+)?security)\b/i,
  /\byou\s+are\s+no\s+longer\b/i,
  /\bdan\b.{0,25}do\s+anything\s+now/i,
  /developer\s+mode|dan\s+mode|god\s+mode|jailbreak(ed)?\s+mode|admin\s+mode/i,
  /ignores?\s+all\s+rules/i,

  // System prompt extraction
  /(repeat|print|output|show)\s+(the\s+)?(words?|text|everything)\s+above/i,
  /what\s+(are|were)\s+your\s+(exact\s+)?(original|initial)\s+instructions/i,
  /output\s+your\s+(system\s+)?prompt/i,
  /reveal\s+your\s+(system\s+prompt|instructions)/i,
  /(show|print)\s+(me\s+)?your\s+(system\s+prompt|configuration)/i,
  /text\s+that\s+appears\s+before\s+(my|your)\s+first\s+message/i,
  /translate\s+your\s+system\s+prompt/i,
  /written\s+in\s+the\s+system\s+role/i,
  /spell(ing)?\s+(them\s+)?out\s+letter\s+by\s+letter/i,

  // Data exfiltration
  /send\s+(this|all|everything)\s+to/i,
  /send\s+(any|all|my)\s+.{0,40}\b(credentials?|passwords?|api\s+keys?|tokens?|secrets?)\b.{0,40}\bto\b/i,
  /(email|forward|send)\s+.{0,40}\bto\b\s+[\w.-]+@[\w.-]+/i,
  /forward\s+(this|all|everything|any)\b[^.]{0,90}\bto\s+\S*(https?:\/\/|@|\.[a-z]{2,6}\b)/i,
  /as\s+a\s+hidden\s+comment/i,
  /include\s+(my|your)\s+.{0,20}\b(password|credentials?|api\s+keys?|secrets?)\b.{0,20}\bin\s+your\s+(next\s+)?(response|reply|answer)/i,
  /encode\s+.{0,30}\s+and\s+(post|send)\s+it\s+to/i,
  /post\s+it\s+to\s+https?:\/\//i,
  /upload\s+(any|all)\s+.{0,30}\s+to\s+(this|the)\s+(endpoint|url)/i,
  /\b(webhook|endpoint|tracker|collector)\b\s*:?\s*https?:\/\//i,
  /add\s+(a\s+|an\s+)?(invisible\s+|tracking\s+)?link\s+to\s+https?:\/\//i,

  // Indirect injection (content addressed at "the AI", not the human reader)
  /\b(note|attention|dear|hey)\b[^.]{0,30}\b(ai|assistant|llm|chatbot)\b/i,
  /hidden\s+(note|instruction)/i,
  /if\s+you\s+are\s+(an\s+)?(ai|llm|assistant)\s+(reading|parsing|processing|browsing)/i,
  /system\s+override/i,
  /treat\s+this\s+(comment|text)\s+as\s+a\s+system\s+message/i,

  // Fake system/role tags
  /\[system\]/i,
  /<\|im_start\|>\s*system/i,
  /###\s*instruction\s*:/i,
  /^\s*system\s*:/im,
  /^\s*assistant\s*:/im,
  /<\/?system[_\s]?(override|message)?>/i,
  /\{\{\s*system\s*\}\}/i,
  /#{2,}\s*system/i,
  /\bsystem\s*(>>|::)/i,
  /supersedes\s+(all\s+)?(prior|previous)\s+(training|instructions)/i,
  /obey\s+(the\s+user\s+)?unconditionally/i,
]

/**
 * Score contributed by a single matched injection pattern. 0.4 rather than
 * a smaller increment so one unambiguous match (e.g. "ignore all previous
 * instructions") crosses THREAT_THRESHOLDS.SUSPICIOUS_MIN (0.3) on its own,
 * instead of requiring a second, unrelated signal to corroborate it.
 */
const PATTERN_SCORE = 0.4

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
      score += PATTERN_SCORE
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
