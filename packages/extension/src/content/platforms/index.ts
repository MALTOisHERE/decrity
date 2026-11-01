/**
 * Platform-specific handlers
 * Each platform has different DOM selectors and behaviors
 */

import { SupportedPlatform } from '@decrity/shared'
import { chatgptHandler } from './chatgpt'
import { geminiHandler } from './gemini'
import { claudeHandler } from './claude'
import { copilotHandler } from './copilot'

export interface PlatformHandler {
  /**
   * Get the main input selector for this platform
   */
  getInputSelector: () => string

  /**
   * Get the file upload input selector (if supported)
   */
  getFileUploadSelector?: () => string

  /**
   * Get the submit button selector
   */
  getSubmitButtonSelector?: () => string
}

/**
 * Get platform handler by platform ID
 */
export function getPlatformHandler(platform: SupportedPlatform): PlatformHandler {
  switch (platform) {
    case 'chatgpt':
      return chatgptHandler
    case 'gemini':
      return geminiHandler
    case 'claude':
      return claudeHandler
    case 'copilot':
      return copilotHandler
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
