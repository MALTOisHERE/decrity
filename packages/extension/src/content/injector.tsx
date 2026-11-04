/**
 * Alert banner injector
 *
 * Mounts a React tree (shadcn Alert component, see Banner.tsx) inside a
 * Shadow DOM root rather than the host page's own light DOM. This is
 * deliberate, not incidental (see DESIGN_SYSTEM.md): the banner is injected
 * into third-party AI platform pages that run their own React apps, so a
 * plain `createRoot` into the page's DOM would risk colliding with the
 * host's own React instance and leaking styles in both directions. A Shadow
 * DOM root gives the banner its own isolated style + DOM tree; the compiled
 * Tailwind CSS (banner.css) is inlined into it directly, since an external
 * stylesheet link wouldn't cross the shadow boundary either.
 */
import { createRoot, type Root } from 'react-dom/client'
import { ScanResponse } from '@decrity/shared'
import { Banner } from './Banner'
import bannerStyles from './banner.css?inline'

const HOST_ID = 'decrity-alert-banner-host'

let activeRoot: Root | null = null

/**
 * Inject alert banner into the page
 */
export function injectAlertBanner(result: ScanResponse) {
  removeAlertBanner()

  const host = document.createElement('div')
  host.id = HOST_ID
  // Isolate the host element itself from host-page layout CSS (e.g. a
  // flex/grid parent applying gap or sizing rules to all its children).
  host.style.cssText = 'all: initial; display: block;'

  const insertionPoint = findInsertionPoint()
  if (insertionPoint) {
    insertionPoint.insertAdjacentElement('beforebegin', host)
  } else {
    document.body.insertAdjacentElement('afterbegin', host)
  }

  const shadow = host.attachShadow({ mode: 'open' })

  const fontStyle = document.createElement('style')
  fontStyle.textContent = buildFontFaceCss()
  shadow.appendChild(fontStyle)

  const tailwindStyle = document.createElement('style')
  tailwindStyle.textContent = bannerStyles
  shadow.appendChild(tailwindStyle)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  activeRoot = createRoot(mountPoint)
  activeRoot.render(<Banner result={result} onDismiss={removeAlertBanner} />)

  // Auto-remove after 10 seconds for suspicious, keep for threat
  if (result.verdict === 'suspicious') {
    setTimeout(() => removeAlertBanner(), 10000)
  }
}

/**
 * Remove alert banner
 */
export function removeAlertBanner() {
  const existing = document.getElementById(HOST_ID)
  if (existing) {
    activeRoot?.unmount()
    activeRoot = null
    existing.remove()
  }
}

/**
 * Builds @font-face rules pointing at the extension's own self-hosted
 * Poppins files (never a Google Fonts request, see CLAUDE.md's privacy
 * rationale). Scoped to 'Decrity Poppins' so it can't collide with a host
 * page's own 'Poppins' @font-face, if it has one.
 */
function buildFontFaceCss(): string {
  return [400, 500, 600, 700]
    .map(
      weight => `
    @font-face {
      font-family: 'Decrity Poppins';
      font-style: normal;
      font-weight: ${weight};
      font-display: swap;
      src: url('${chrome.runtime.getURL(`fonts/poppins-${weight}.woff2`)}') format('woff2');
    }`
    )
    .join('\n')
}

/**
 * Find the best insertion point for the banner
 * (platform-specific logic could be added here)
 */
function findInsertionPoint(): Element | null {
  // Try to find the main input area
  const selectors = ['form textarea', '[contenteditable="true"]', 'main form', 'main']

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) return element
  }

  return null
}
