/**
 * ChatGPT platform handler
 * Selectors for chat.openai.com
 */

import { PlatformHandler } from './index'

export const chatgptHandler: PlatformHandler = {
  getInputSelector: () => {
    // ChatGPT uses a contenteditable div or textarea
    // These selectors may need updates as OpenAI changes their UI
    return 'textarea[data-id], textarea#prompt-textarea, div[contenteditable="true"]'
  },

  getFileUploadSelector: () => {
    return 'input[type="file"]'
  },

  getSubmitButtonSelector: () => {
    return 'button[data-testid="send-button"]'
  },
}
