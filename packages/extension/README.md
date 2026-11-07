# @decrity/extension

Decrity Chrome extension: an AI security firewall for consumers.

## Features

- **Real-time protection**: monitors AI interactions on ChatGPT, Gemini, Claude, and Copilot
- **Layer 1 heuristics**: local pattern-based prompt injection detection, works offline
- **Layer 2 ML**: cloud-based classifier, only runs when Privacy Mode is off
- **Privacy Mode**: on by default; all scanning happens locally, no data sent to the cloud
- **Protection Gap detection**: notices when a platform's UI changes in a way the extension hasn't caught up with yet, pauses scanning on that platform, and reports it (no content, just platform id/timestamp/version) so the team can fix it fast; see `GLOSSARY.md`
- **Non-blocking alerts**: plain-language warnings, rendered via shadcn/ui inside an isolated Shadow DOM root so they never collide with the host page's own styles or React instance

## Development

```bash
# from the repo root
pnpm install
pnpm extension:dev     # dev server, hot reload
pnpm --filter @decrity/extension build
# the built extension will be in packages/extension/dist/
```

## Loading in Chrome

1. Build the extension: `pnpm --filter @decrity/extension build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Project structure

```
src/
├── background/       # Service worker: scan coordination, caching, API client, gap reports
├── content/          # Content scripts: DOM monitoring, alert banner, gap detection
│   └── platforms/    # Platform-specific selectors (ChatGPT, Gemini, Claude, Copilot)
├── popup/            # Extension popup UI (React, shadcn/ui)
├── components/ui/    # shadcn/ui components, owned source (see root DESIGN_SYSTEM.md)
├── lib/               # cn() class-merging helper
└── shared/           # Layer 1 heuristics scanner (must stay offline-capable)
```

## Key files

- `public/manifest.json`: extension manifest (Manifest V3)
- `background/index.ts`: service worker entry point
- `content/index.ts`: content script entry point
- `content/injector.tsx`: alert banner, mounted inside a Shadow DOM root
- `popup/App.tsx`: popup React app

## Notes

- Platform selectors in `content/platforms/*.ts` are fragile by nature and may need updates as AI platforms change their UI; verify against the live platform before changing one
- The extension runs in Privacy Mode by default (Layer 1 heuristics only, no network calls)
- See the root [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) for UI/component conventions this package follows
