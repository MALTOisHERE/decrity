/**
 * Claude platform handler
 * Selectors for claude.ai
 */

import { PlatformHandler } from './index'

export const claudeHandler: PlatformHandler = {
  getInputSelector: () => {
    // Claude uses a contenteditable div
    return 'div[contenteditable="true"], textarea'
  },

  getFileUploadSelector: () => {
    return 'input[type="file"]'
  },
}
