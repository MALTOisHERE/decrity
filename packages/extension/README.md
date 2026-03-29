# @trustlayer/extension

TrustLayer Chrome Extension - AI Security Firewall for consumers.

## Features

- **Real-time protection** - Monitors AI interactions on ChatGPT, Gemini, Claude, and Copilot
- **Layer 1 Heuristics** - Local pattern-based prompt injection detection
- **Layer 2 ML** - Cloud-based ML classifier (when privacy mode is off)
- **Privacy Mode** - All scanning happens locally, no data sent to cloud
- **Non-blocking alerts** - User-friendly warnings in plain language

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server with hot reload
pnpm dev

# Build extension for production
pnpm build

# The built extension will be in dist/
```

## Loading in Chrome

1. Build the extension: `pnpm build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Project Structure

```
src/
├── background/       # Service worker (scan coordination, caching, API client)
├── content/          # Content scripts (DOM monitoring, alerts)
│   └── platforms/    # Platform-specific selectors
├── popup/            # Extension popup UI (React)
└── shared/           # Shared utilities (heuristics scanner)
```

## Key Files

- `manifest.json` - Extension manifest (Manifest V3)
- `background/index.ts` - Service worker entry point
- `content/index.ts` - Content script entry point
- `popup/App.tsx` - Popup React app

## Notes

- Icon files need to be added to `public/icons/` (16x16, 32x32, 48x48, 128x128 PNG)
- Platform selectors in `content/platforms/*.ts` may need updates as AI platforms change their UI
- The extension runs in Privacy Mode by default (Layer 1 heuristics only)
