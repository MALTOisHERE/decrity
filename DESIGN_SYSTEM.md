# Decrity Design System

Reference for how UI is built across this repo. Read this before adding or changing any UI. Don't re-derive these decisions from scratch, and don't introduce a different approach in a new corner of the codebase.

## Tooling: when doing design work, use the `frontend-design` skill

For any new screen, page, or visual redesign (not a small tweak to existing UI), invoke the `frontend-design` skill first for the design-planning process (color/type/layout tokens, critique against generic-AI-design defaults). Then apply the result through this document's component/token system, not a one-off style.

## Component library: shadcn/ui

**Always use shadcn/ui components for interactive UI** (buttons, toggles, badges, alerts, cards) in any React surface. Never hand-rolled CSS classes, never raw emoji as icons, never ad-hoc inline-styled divs when an equivalent shadcn component exists.

shadcn/ui is not an npm dependency you install, it's owned source you copy into the project. Each package that uses it has its own `src/components/ui/*.tsx` and `src/lib/utils.ts` (the `cn()` class-merging helper). These are near-identical copies across packages (`packages/dashboard`, `packages/extension`) by shadcn's own convention, so don't try to share them via `@decrity/shared`; keep each package's copy independently editable.

Underlying stack: Radix UI primitives (`@radix-ui/react-*`) for accessible behavior, `class-variance-authority` (cva) for variant styling, `clsx` + `tailwind-merge` (via the `cn()` helper) for class composition, Tailwind CSS for styling. `lucide-react` is the icon set for anything that isn't already one of the hand-written brand SVGs below.

### Where it's used

- **`packages/dashboard`**: full shadcn setup (Card, Badge, Button so far). Natural fit, since it's a plain React web app with Tailwind already present.
- **`packages/extension/src/popup`**: full shadcn setup (Switch, Alert, Badge, Button, Card). Tailwind was already wired into `styles.css` via `@tailwind` directives before shadcn was added.
- **`packages/extension/src/content`** (the alert banner injected into ChatGPT/Gemini/Claude/Copilot pages, `injector.tsx` + `Banner.tsx`): full shadcn setup too, but mounted differently, see below.

### The injected banner mounts inside a Shadow DOM

`injector.tsx` runs inside third-party pages via a content script, not inside our own app shell, so it can't just `createRoot` directly into the host page's light DOM: that would risk colliding with the host's own React instance and leaking styles in both directions. Instead it creates a host `<div>`, calls `element.attachShadow({mode: 'open'})` on it, and mounts the React tree (plus its own injected `<style>` tags for the compiled Tailwind CSS and the Poppins `@font-face` rules) inside that shadow root. The compiled CSS is pulled in via `import bannerStyles from './banner.css?inline'` (Vite's inline-CSS import) since an external stylesheet link wouldn't cross the shadow boundary either. Follow this same pattern for any other UI injected directly into a host page.

## Design tokens

Brand color is **teal `#2f6f78`** (`BADGE_COLORS.GAP` in `packages/shared/src/constants/index.ts`). Expressed as shadcn's standard HSL CSS-variable set (defined in `packages/dashboard/src/index.css`, `packages/extension/src/popup/styles.css`, and `packages/extension/src/content/banner.css`, since the banner's shadow root can't inherit the popup's stylesheet; keep all three identical):

```css
--background: 0 0% 100%;
--foreground: 221 39% 11%;      /* near-black body text, #111827 */
--card: 0 0% 100%;
--card-foreground: 221 39% 11%;
--popover: 0 0% 100%;
--popover-foreground: 221 39% 11%;
--primary: 187 44% 33%;         /* brand teal, #2f6f78 */
--primary-foreground: 0 0% 100%;
--secondary: 185 32% 93%;       /* light teal tint, #e6f1f2 */
--secondary-foreground: 189 49% 22%; /* dark teal text, #1d4c54 */
--muted: 210 20% 98%;
--muted-foreground: 220 9% 46%; /* secondary gray text, #6b7280 */
--accent: 185 32% 93%;
--accent-foreground: 189 49% 22%;
--destructive: 0 84% 60%;       /* red-500, #ef4444 */
--destructive-foreground: 0 0% 100%;
--border: 220 13% 91%;          /* #e5e7eb */
--input: 220 13% 91%;
--ring: 187 44% 33%;
--radius: 0.5rem;               /* 8px, matches existing card radius */
```

Threat-severity colors (suspicious = amber, threat = red) are a **separate, intentional signal** from the brand teal: teal means "tool health" (Protection Gap state), amber/red mean "content danger" (scan verdict). Don't collapse these into one color. See `GLOSSARY.md`'s `Protection Gap` vs `Verdict` entries and `BADGE_COLORS` in `packages/shared/src/constants/index.ts`.

## Typography

**Poppins**, self-hosted (never a Google Fonts CDN link, see CLAUDE.md's privacy rationale). Weights 400/500/600/700, woff2 only. Font files live in `packages/extension/public/fonts/` and `packages/dashboard/public/fonts/`, wired via `@font-face` in each package's main CSS file. The content-script banner instead references the font via `chrome.runtime.getURL('fonts/poppins-<weight>.woff2')`, with `fonts/*` listed in its `web_accessible_resources` entry in `manifest.json`, since it can't reach a same-origin stylesheet. Never fetch from Google Fonts.

## Logo

Real brand assets (not a placeholder), supplied 2026-11-06: a square **mark** (the geometric "D" shape with a diamond cutout) and a horizontal **wordmark** (mark + "ecrity" lockup spelling "Decrity", with a sparkle accent). Source files live at `packages/extension/public/brand/mark.png`, `packages/extension/public/brand/wordmark.png`, and the same two files under `packages/dashboard/public/brand/`. Both are kept as the original black-on-transparent PNGs, not pre-recolored, so the brand color can change later without touching the asset again.

**Always recolor via CSS, never bake a color into a new export**, unless the target genuinely can't run CSS (see below):

```tsx
<span
  className="w-5 h-5 bg-primary"
  style={{
    maskImage: 'url(/brand/mark.png)',
    maskSize: 'contain',
    maskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskImage: 'url(/brand/mark.png)',
    WebkitMaskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
  }}
/>
```

The `bg-primary` (or any other `bg-*`/`text-*`-backed color) is what actually paints the logo; swap that class to change its color anywhere it's used, no new asset needed.

### Where each one goes

- **Mark** (square): only where there's genuinely no room for the full wordmark, or the slot is literally square (the Chrome extension's manifest icon files, `packages/extension/public/icons/icon-{16,32,48,128}.png`, and the dashboard's favicon, `packages/dashboard/public/favicon.png`).
- **Wordmark** (mark + "Decrity" text, one lockup): the default for any header, in both the extension popup and the dashboard. Replaces a separate icon + live text label entirely, don't pair it with a redundant "Decrity" heading next to it. Sized by height with `aspectRatio: '5246 / 2283'` (the asset is cropped tight to its content, not the original canvas size) so width follows automatically.

**Exception, pre-colored raster exports**: Chrome's manifest icon files and the dashboard favicon can't run CSS (they're read directly by the browser chrome, not rendered inside a page), so those are real teal (`#2f6f78`) exports, not mask-based. If the brand color ever changes, regenerate those specific files from the original black source; everything else (anywhere `mask-image` is used) updates itself by changing a class.

## Icons

**Never emoji in shipped UI.** Use inline SVG (simple outline style: `fill="none" stroke="currentColor" strokeWidth="1.6-2"`) for brand/one-off icons like the shield logo, or `lucide-react` for anything else once shadcn is set up in that package. The one legitimate exception is `BADGE_TEXT` in `packages/shared/src/constants/index.ts` (checkmark, exclamation mark, warning triangle, circle), that's Chrome's toolbar badge API, which only accepts short text strings, not SVG. Those are monochrome functional glyphs, not decorative emoji, and are fine as-is.

## Standing rule

When you reach for a pattern repeatedly (a color, a spacing scale, "how do we do a banner," "how do we do a toggle"), it belongs here, not re-decided ad hoc in each file. Update this document when the system changes. Don't let individual components drift from it.
