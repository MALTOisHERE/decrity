/**
 * Alert banner injector
 * Injects non-blocking warning banners into AI platform pages
 */

import { ScanResponse } from '@trustlayer/shared'

const BANNER_ID = 'trustlayer-alert-banner'

/**
 * Inject alert banner into the page
 */
export function injectAlertBanner(result: ScanResponse) {
  // Remove existing banner if present
  removeAlertBanner()

  // Create banner element
  const banner = createBannerElement(result)

  // Find insertion point (before the main input area)
  const insertionPoint = findInsertionPoint()
  if (insertionPoint) {
    insertionPoint.insertAdjacentElement('beforebegin', banner)
  } else {
    // Fallback: insert at top of body
    document.body.insertAdjacentElement('afterbegin', banner)
  }

  // Auto-remove after 10 seconds for suspicious, keep for threat
  if (result.verdict === 'suspicious') {
    setTimeout(() => removeAlertBanner(), 10000)
  }
}

/**
 * Remove alert banner
 */
export function removeAlertBanner() {
  const existing = document.getElementById(BANNER_ID)
  if (existing) {
    existing.remove()
  }
}

/**
 * Create banner HTML element
 */
function createBannerElement(result: ScanResponse): HTMLElement {
  const banner = document.createElement('div')
  banner.id = BANNER_ID

  const isThread = result.verdict === 'threat'
  const bgColor = isThread ? '#fef2f2' : '#fffbeb' // red-50 or amber-50
  const borderColor = isThread ? '#ef4444' : '#f59e0b' // red-500 or amber-500
  const textColor = isThread ? '#991b1b' : '#92400e' // red-900 or amber-900

  banner.style.cssText = `
    position: relative;
    background-color: ${bgColor};
    border: 2px solid ${borderColor};
    border-radius: 8px;
    padding: 16px;
    margin: 16px 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    color: ${textColor};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    z-index: 9999;
  `

  const icon = isThread ? '⚠️' : '⚡'
  const title = isThread ? 'Suspicious content detected' : 'Potentially suspicious content'

  banner.innerHTML = `
    <div style="display: flex; gap: 12px;">
      <div style="font-size: 24px;">${icon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
        <div style="margin-bottom: 12px;">${result.reason}</div>
        <div style="display: flex; gap: 8px;">
          <button id="trustlayer-details-btn" style="
            background: white;
            border: 1px solid ${borderColor};
            color: ${textColor};
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
          ">See details</button>
          <button id="trustlayer-dismiss-btn" style="
            background: transparent;
            border: none;
            color: ${textColor};
            padding: 6px 12px;
            font-size: 13px;
            text-decoration: underline;
            cursor: pointer;
          ">Dismiss</button>
        </div>
      </div>
    </div>
  `

  // Add event listeners
  const detailsBtn = banner.querySelector('#trustlayer-details-btn')
  const dismissBtn = banner.querySelector('#trustlayer-dismiss-btn')

  detailsBtn?.addEventListener('click', () => {
    showDetailsModal(result)
  })

  dismissBtn?.addEventListener('click', () => {
    removeAlertBanner()
  })

  return banner
}

/**
 * Find the best insertion point for the banner
 * (platform-specific logic could be added here)
 */
function findInsertionPoint(): Element | null {
  // Try to find the main input area
  const selectors = [
    'form textarea',
    '[contenteditable="true"]',
    'main form',
    'main',
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) return element
  }

  return null
}

/**
 * Show details modal (future enhancement)
 */
function showDetailsModal(result: ScanResponse) {
  alert(`Scan Details:\n\nVerdict: ${result.verdict}\nConfidence: ${Math.round(result.score * 100)}%\nReason: ${result.reason}\nDetection: ${result.detectionLayer}`)
}
