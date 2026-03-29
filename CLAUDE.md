# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**TrustLayer** is a Chrome browser extension that protects consumers from AI-specific threats (prompt injection, fake chatbots, data harvesting). It's a **monorepo** with 5 packages managed by **Turborepo** and **pnpm workspaces**.

**Core Product:** Chrome extension (packages/extension) - everything else supports it.

---

## Essential Commands

### Initial Setup
```bash
# Install all dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start infrastructure (Postgres, Redis, ML service)
docker-compose up -d

# Initialize database
cd packages/api && pnpm db:migrate && pnpm db:generate && cd ../..
```

### Development
```bash
# Run all packages (preferred)
pnpm dev

# Run specific packages
pnpm extension:dev   # Extension with hot reload
pnpm api:dev         # Backend API
pnpm dashboard:dev   # Web dashboard
pnpm ml:dev          # ML service (Python)

# Build packages
pnpm build                                      # All packages
pnpm --filter @trustlayer/extension build       # Specific package
```

### Database Operations
```bash
cd packages/api
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio GUI
```

### Quality Control
```bash
pnpm lint            # Lint all packages
pnpm format          # Format all code
pnpm format:check    # Check formatting
```

### Docker Management
```bash
docker-compose up -d              # Start services
docker-compose logs -f ml-service # View ML service logs
docker-compose down               # Stop services
docker-compose down -v            # Reset everything (including data)
```

---

## Architecture

### Package Structure

```
packages/
├── shared/        # Shared TypeScript types, constants, utilities
│                  # Used by: extension, api, dashboard
│                  # Build this first if making changes
│
├── extension/     # Chrome Extension (Manifest V3) - THE CORE PRODUCT
│   ├── background/        # Service worker (scan orchestration, caching)
│   ├── content/           # Content scripts (DOM monitoring, alerts)
│   │   └── platforms/     # Platform-specific selectors (ChatGPT, Gemini, Claude, Copilot)
│   ├── popup/             # React popup UI
│   └── shared/            # Layer 1 heuristics (must work offline!)
│
├── api/           # Node.js/Fastify REST API
│   ├── routes/            # /v1/scan, /v1/report, /v1/user
│   ├── services/          # scanner.ts, mlClient.ts, database.ts
│   └── prisma/            # Database schema
│
├── ml-service/    # Python/FastAPI ML classifier
│   └── app/               # main.py, heuristics.py, classifier.py
│
└── dashboard/     # React web dashboard
    └── src/pages/         # Dashboard.tsx, History.tsx
```

### Data Flow

```
User input → content_script.js intercepts
         ↓
    background.js receives
         ↓
    Layer 1 heuristics (local, <10ms)
         ↓
    Privacy Mode? → Yes: Stop here
         ↓ No
    POST /v1/scan to API
         ↓
    ML Service classifies
         ↓
    Verdict returned → Alert injected if threat
```

### Key Architectural Principles

1. **Extension-First**: The extension is the product. API/dashboard/ML are supporting services.

2. **Two-Layer Detection**:
   - **Layer 1 (Local)**: Heuristic pattern matching in `extension/src/shared/heuristics.ts`. Must work offline, no API calls. Runs in Privacy Mode.
   - **Layer 2 (ML)**: Cloud-based classification via ML service. Only runs when Privacy Mode is OFF.

3. **Privacy-First**:
   - Privacy Mode ON by default (Layer 1 only)
   - Content is NEVER stored (only SHA-256 hashes)
   - See DOC.md Section 10 for data handling rules

4. **Platform Handlers**:
   - Each AI platform (ChatGPT, Gemini, Claude, Copilot) has specific DOM selectors in `extension/src/content/platforms/*.ts`
   - **These are fragile** - AI platforms frequently update their UI
   - Always test on all 4 platforms before shipping

---

## Critical Constraints

### Security & Privacy (NON-NEGOTIABLE)

1. **NO CONTENT STORAGE**
   - Never persist actual content payloads
   - Only store SHA-256 hashes + metadata
   - Check against data handling table in DOC.md Section 10

2. **Layer 1 Must Stay Local**
   - Heuristic scanner in `extension/src/shared/heuristics.ts` must NOT require API calls
   - Must work offline and in Privacy Mode
   - No external dependencies

3. **Plain Language UI**
   - All user-facing strings must be readable by non-technical users
   - Avoid: "payload", "heuristic", "classifier", "endpoint", "API"
   - Use: "content", "checking", "detection", "connection"

4. **Minimal Permissions**
   - No `<all_urls>` permission
   - Only specific host permissions in manifest.json
   - See DOC.md Section 10 for permission policy

### Testing Requirements

- **Platform Testing**: Test content script changes on all 4 platforms (ChatGPT, Gemini, Claude, Copilot)
- **Selector Validation**: Check if target AI platform has updated their UI before modifying `content/platforms/*.ts`
- **Privacy Mode**: Verify Layer 1 works without API access

---

## Package Dependencies

```
@trustlayer/shared (base)
    ↓
    ├── @trustlayer/extension  (depends on shared)
    ├── @trustlayer/api        (depends on shared)
    └── @trustlayer/dashboard  (depends on shared)

@trustlayer/ml-service (Python, independent)
```

**Build Order**: Always build `shared` first if making changes that affect other packages.

---

## Extension Development

### Loading Extension in Chrome
```bash
# Build extension
pnpm --filter @trustlayer/extension build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select: packages/extension/dist/
```

### Extension Architecture

**Background Service Worker** (`background/index.ts`):
- Message handler for content scripts
- Scan orchestration (Layer 1 → API)
- IndexedDB caching (1-hour TTL)
- Badge icon updates

**Content Scripts** (`content/index.ts`):
- Injected into AI platform pages
- DOM monitoring (MutationObserver)
- Input interception (paste, upload, submit)
- Alert banner injection

**Platform Handlers** (`content/platforms/*.ts`):
- ChatGPT: `textarea#prompt-textarea` or contenteditable
- Gemini: `rich-textarea textarea`
- Claude: `div[contenteditable="true"]`
- Copilot: `textarea` or contenteditable
- **Note**: These selectors WILL break when platforms update

### Alert System

Alerts are injected via `content/injector.ts`:
- Non-blocking banners
- Plain-language warnings
- Auto-dismiss for "suspicious" (10s)
- Persistent for "threat"

---

## API Development

### Endpoints

```typescript
POST /v1/scan       // Scan content for threats
GET  /v1/report     // Get threat history
GET  /v1/user       // Get user profile (TODO)
PATCH /v1/user      // Update settings (TODO)
```

### Database Schema

```prisma
User {
  id: UUID
  email: String? (optional, unique)
  subscriptionTier: "free" | "premium"
  settings: JSON
}

ScanResult {
  id: UUID
  contentHash: String       // SHA-256, NOT actual content
  verdict: String           // "clean" | "suspicious" | "threat"
  score: Float              // 0-1
  platform: String
  userId: UUID?
  createdAt: DateTime
}
```

**CRITICAL**: Never add fields that store actual content.

---

## ML Service Development

### Python Environment
```bash
cd packages/ml-service
python -m venv .venv
source .venv/bin/activate  # Unix/Mac
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Detection Layers

**Layer 1** (`app/heuristics.py`):
- Regex patterns for injection attacks
- Hidden content detection
- Fast (<10ms)

**Layer 2** (`app/classifier.py`):
- ML classifier (placeholder for v1.0)
- DistilBERT-based (planned for v1.5)
- Slower (50-200ms)

### Endpoints
```
GET  /health           // Health check
POST /classify         // Classify content
```

---

## Development Workflow

### Making Changes

1. **Start with Documentation**: Check PROGRESS.md for what needs to be done
2. **Build Shared First**: If changing types/constants in `shared`, build it first
3. **Test Extension Changes**: Load extension in Chrome and test on all 4 platforms
4. **Run Linting**: `pnpm lint` before committing
5. **Update Progress**: Mark tasks complete in PROGRESS.md

### Git Workflow

```bash
git checkout -b feature/your-feature
# Make changes
pnpm lint && pnpm format
git commit -m "feat: your feature"
git push
# Create PR using template
```

### Commit Conventions

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

---

## Common Scenarios

### Adding a New AI Platform

1. Add platform to `packages/shared/src/constants/platforms.ts`
2. Create handler in `packages/extension/src/content/platforms/[platform].ts`
3. Export from `packages/extension/src/content/platforms/index.ts`
4. Add URL pattern to `manifest.json` host_permissions
5. Test on actual platform

### Modifying Heuristic Patterns

1. Edit `packages/extension/src/shared/heuristics.ts`
2. Add pattern to `INJECTION_PATTERNS` array
3. Test locally (no API needed!)
4. Rebuild extension: `pnpm --filter @trustlayer/extension build`
5. Test on all platforms

### Adding API Endpoint

1. Create route in `packages/api/src/routes/[name].ts`
2. Register in `packages/api/src/index.ts`
3. Add types to `packages/shared/src/types/api.ts`
4. Update API client in extension/dashboard

### Database Schema Changes

```bash
cd packages/api
# Edit prisma/schema.prisma
pnpm db:migrate          # Creates migration
pnpm db:generate         # Updates Prisma client
```

---

## Troubleshooting

### Extension Not Loading
- Check `packages/extension/dist/` exists
- Check manifest.json syntax
- View errors in chrome://extensions/

### Platform Selectors Not Working
- AI platform likely updated their UI
- Inspect the page with DevTools
- Update selectors in `content/platforms/*.ts`
- Test thoroughly

### Database Connection Issues
```bash
docker-compose down -v
docker-compose up -d
cd packages/api && pnpm db:migrate && cd ../..
```

### ML Service Not Starting
```bash
docker-compose logs -f ml-service
# Usually means: downloading models on first start (wait ~1 min)
```

---

## Documentation Structure

- **QUICKSTART.md** - 5-minute setup
- **ARCHITECTURE.md** - System design & data flow
- **DOC.md** - Complete 40-page spec (read Section 10 for security!)
- **PROGRESS.md** - Task tracking
- **ROADMAP.md** - Product timeline
- **CONTRIBUTING.md** - Dev guidelines

---

## Version Status

**Current:** v0.1.0 (Foundation Complete)
**Next:** v1.0.0 (MVP - extension polish, platform testing, Chrome Web Store)

See PROGRESS.md for detailed task list.

---

## Important Files to Check Before Modifying

- **Privacy/Security Changes**: Read DOC.md Section 10
- **Extension Changes**: Check `manifest.json` permissions
- **Database Changes**: Review `packages/api/prisma/schema.prisma`
- **Type Changes**: Update `packages/shared/src/types/*`
- **Platform Selectors**: Verify on actual platform first

---

**Last Updated:** 2026-03-29
