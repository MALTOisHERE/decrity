/**
 * Claude platform handler
 * Selectors for claude.ai
 */

import { PlatformHandler } from './index'

export const claudeHandler: PlatformHandler = {
  getInputSelector: () => {
    // Claude uses a contenteditable div (data-testid="chat-input"). claude.ai
    // also ships a hidden `<textarea data-testid="static-composer-input">`
    // (an SSR/no-JS fallback) earlier in document order than the real
    // composer, so document.querySelector(selector) would otherwise always
    // resolve to that non-interactive element instead of the real one,
    // silently breaking paste/submit scanning. Found live on claude.ai
    // 2026-11-01; excluded explicitly rather than dropping the generic
    // `textarea` fallback entirely, in case a real textarea-based composer
    // mode exists elsewhere.
    return 'div[contenteditable="true"], textarea:not([data-testid="static-composer-input"])'
  },

  getFileUploadSelector: () => {
    return 'input[type="file"]'
  },
}
