/**
 * Google Gemini platform handler
 * Selectors for gemini.google.com
 */

import { PlatformHandler } from './index'

export const geminiHandler: PlatformHandler = {
  getInputSelector: () => {
    // Gemini uses a rich text editor or textarea
    return 'rich-textarea textarea, div[contenteditable="true"]'
  },

  getFileUploadSelector: () => {
    return 'input[type="file"]'
  },
}
