/**
 * Microsoft Copilot platform handler
 * Selectors for copilot.microsoft.com
 *
 * Protection Gap detection timing (debounce/max-wait) was calibrated against
 * ChatGPT/Gemini/Claude only (wayfinder ticket 001) — no Copilot test account
 * was available. The same values are applied here but are unvalidated for
 * this platform specifically.
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
