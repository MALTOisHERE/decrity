/**
 * Decrity Content Script
 * Runs on AI platform pages, monitors input, and shows alerts
 */

import { ScanRequest, ScanResponse, getPlatformFromUrl } from '@decrity/shared'
import { injectAlertBanner } from './injector'
import { getPlatformHandler } from './platforms'
import { startProtectionGapDetection } from './gapDetector'

console.log('Decrity content script loaded on', window.location.href)

const currentPlatform = getPlatformFromUrl(window.location.href)

if (!currentPlatform) {
  console.warn('Decrity: Unknown platform', window.location.href)
} else {
  console.log('Decrity: Monitoring', currentPlatform)
  initializeMonitoring()
}

/**
 * Initialize monitoring for the current platform
 */
function initializeMonitoring() {
  if (!currentPlatform) return

  const handler = getPlatformHandler(currentPlatform)

  // Observe input changes
  observeInputChanges(handler.getInputSelector())

  // Observe paste events
  observePasteEvents(handler.getInputSelector())

  // Observe file uploads (if supported)
  if (handler.getFileUploadSelector) {
    observeFileUploads(handler.getFileUploadSelector())
  }

  // Protection Gap detection (wayfinder ticket 001): notices when this
  // platform's input selector stops matching and reports it to the
  // badge/popup. Re-arms itself on in-page SPA navigation. Does not yet
  // pause scanning itself (the map's destination calls for that; not built).
  startProtectionGapDetection(currentPlatform, handler.getInputSelector())
}

/**
 * Observe input changes via MutationObserver
 */
function observeInputChanges(selector: string) {
  const observer = new MutationObserver(() => {
    const inputElement = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement
    if (inputElement) {
      // Add event listener if not already added
      if (!inputElement.dataset.decrityMonitored) {
        inputElement.dataset.decrityMonitored = 'true'

        // Monitor before submission
        const form = inputElement.closest('form')
        if (form) {
          form.addEventListener('submit', event => {
            handleInputSubmission(inputElement.value, event)
          })
        }
      }
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

/**
 * Observe paste events
 */
function observePasteEvents(selector: string) {
  document.addEventListener('paste', async event => {
    const target = event.target as HTMLElement
    const inputElement = document.querySelector(selector) as HTMLTextAreaElement | HTMLInputElement

    if (target === inputElement || inputElement?.contains(target)) {
      const pastedText = event.clipboardData?.getData('text')
      if (pastedText && pastedText.length > 100) {
        // Only scan substantial pasted content
        await scanAndAlert(pastedText, false) // Non-blocking
      }
    }
  })
}

/**
 * Observe file uploads
 */
function observeFileUploads(selector: string) {
  document.addEventListener('change', async event => {
    const target = event.target as HTMLInputElement
    const fileInput = document.querySelector(selector) as HTMLInputElement

    if (target === fileInput && target.files && target.files.length > 0) {
      const file = target.files[0]
      // Only scan text files
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        const content = await file.text()
        await scanAndAlert(content, false)
      }
    }
  })
}

/**
 * Handle input submission
 */
async function handleInputSubmission(content: string, event?: Event) {
  if (!content || content.trim().length < 10) return

  const result = await scanAndAlert(content, true)

  // If threat detected and user hasn't dismissed, prevent submission
  if (result && result.verdict === 'threat' && event) {
    // Let the alert handle the user's decision
    // For now, don't block - just alert
  }
}

/**
 * Scan content and show alert if needed
 */
async function scanAndAlert(
  content: string,
  _blocking: boolean
): Promise<ScanResponse | null> {
  if (!currentPlatform) return null

  try {
    const request: ScanRequest = {
      content,
      source: currentPlatform,
      timestamp: Date.now(),
    }

    // Send to background script for scanning
    const response = await chrome.runtime.sendMessage({
      type: 'SCAN_CONTENT',
      payload: request,
    })

    if (response.error) {
      console.error('Scan failed:', response.error)
      return null
    }

    const result: ScanResponse = response

    // Show alert for suspicious or threat
    if (result.verdict === 'suspicious' || result.verdict === 'threat') {
      injectAlertBanner(result)
    }

    return result
  } catch (error) {
    console.error('Scan error:', error)
    return null
  }
}

export {}
