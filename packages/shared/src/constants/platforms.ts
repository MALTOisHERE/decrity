/**
 * AI platform constants and configurations
 */

import { SupportedPlatform } from '../types/scan'

/**
 * Platform URLs and metadata
 */
export const PLATFORMS = {
  chatgpt: {
    id: 'chatgpt' as SupportedPlatform,
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    urlPattern: /^https:\/\/(chat\.openai\.com|chatgpt\.com)/,
  },
  gemini: {
    id: 'gemini' as SupportedPlatform,
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    urlPattern: /^https:\/\/gemini\.google\.com/,
  },
  claude: {
    id: 'claude' as SupportedPlatform,
    name: 'Claude',
    url: 'https://claude.ai',
    urlPattern: /^https:\/\/claude\.ai/,
  },
  copilot: {
    id: 'copilot' as SupportedPlatform,
    name: 'Microsoft Copilot',
    url: 'https://copilot.microsoft.com',
    urlPattern: /^https:\/\/copilot\.microsoft\.com/,
  },
} as const

/**
 * Get platform by URL
 */
export function getPlatformFromUrl(url: string): SupportedPlatform | null {
  for (const [key, platform] of Object.entries(PLATFORMS)) {
    if (platform.urlPattern.test(url)) {
      return key as SupportedPlatform
    }
  }
  return null
}

/**
 * Check if URL is a supported platform
 */
export function isSupportedPlatform(url: string): boolean {
  return getPlatformFromUrl(url) !== null
}

/**
 * Host permissions for manifest.json
 */
export const PLATFORM_HOST_PERMISSIONS = Object.values(PLATFORMS).map(p => `${p.url}/*`)
