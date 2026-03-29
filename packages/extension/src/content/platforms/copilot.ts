/**
 * Microsoft Copilot platform handler
 * Selectors for copilot.microsoft.com
 */

import { PlatformHandler } from './index'

export const copilotHandler: PlatformHandler = {
  getInputSelector: () => {
    // Copilot uses a textarea or contenteditable div
    return 'textarea, div[contenteditable="true"]'
  },

  getFileUploadSelector: () => {
    return 'input[type="file"]'
  },
}
