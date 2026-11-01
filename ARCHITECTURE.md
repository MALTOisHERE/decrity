# Decrity Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│                                                          │
│  ┌──────────────┐      ┌──────────────────────────┐    │
│  │   AI Tools   │      │   Decrity Extension   │    │
│  │  (ChatGPT,   │◄────►│                          │    │
│  │  Gemini, ...) │      │  ┌────────────────────┐ │    │
│  └──────────────┘      │  │  content_script.js  │ │    │
│                         │  │  - DOM scanner      │ │    │
│                         │  │  - Input monitor    │ │    │
│                         │  │  - Alert injector   │ │    │
│                         │  └────────────────────┘ │    │
│                         │                          │    │
│                         │  ┌────────────────────┐ │    │
│                         │  │  background.js      │ │    │
│                         │  │  - Layer 1 scan     │ │    │
│                         │  │  - API client       │ │    │
│                         │  │  - Cache manager    │ │    │
│                         │  │  - Badge updater    │ │    │
│                         │  └────────────────────┘ │    │
│                         └──────────┬───────────────┘    │
└────────────────────────────────────┼────────────────────┘
                                     │ HTTPS
                          ┌──────────▼──────────┐
                          │   Decrity API     │
                          │   (Node.js/Fastify)  │
                          │                      │
                          │  POST /v1/scan       │
                          │  GET  /v1/report     │
                          │  GET  /v1/user       │
                          └──────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
         ┌──────────▼─────────┐  ┌──▼───────────┐  ┌▼──────────┐
         │   ML Service       │  │  PostgreSQL  │  │   Redis   │
         │   (FastAPI)        │  │              │  │  (Cache)  │
         │                    │  │  - Users     │  │           │
         │  - Heuristics      │  │  - Scans     │  │           │
         │  - ML classifier   │  │  - History   │  │           │
         └────────────────────┘  └──────────────┘  └───────────┘
```

## Data Flow

### Scan Request Flow

```
1. User types/pastes content into ChatGPT
        ↓
2. content_script.js intercepts input event
        ↓
3. Extracts text payload
        ↓
4. Sends to background.js via chrome.runtime.sendMessage
        ↓
5. background.js checks IndexedDB cache
        ├─ Cache hit → Return cached result
        └─ Cache miss →
                ↓
6. Privacy Mode check:
        ├─ ON  → Run Layer 1 heuristics locally
        └─ OFF → Continue to API
                ↓
7. POST /v1/scan to Decrity API
        {
          "content": "...",
          "source": "chatgpt"
        }
        ↓
8. API forwards to ML Service
        ↓
9. ML Service performs:
        - Layer 1: Heuristic pattern matching (fast)
        - Layer 2: ML classification (if suspicious)
        ↓
10. Returns verdict + score + reason
        ↓
11. API persists result to PostgreSQL (async)
        ↓
12. API returns result to extension
        ↓
13. background.js caches result in IndexedDB
        ↓
14. background.js updates badge icon
        ↓
15. content_script.js injects alert banner (if threat)
```

## Package Dependencies

```
┌─────────────────┐
│  @decrity/   │
│     shared      │  ← Base package (types, constants, utils)
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
┌───▼────┐ ┌─▼──────┐ ┌───▼──────┐ ┌──▼────────┐
│extension│ │  api   │ │dashboard│ │ml-service │
│         │ │        │ │         │ │ (Python)  │
└─────────┘ └────────┘ └─────────┘ └───────────┘
```

## Extension Architecture

### Background Service Worker

**File:** `packages/extension/src/background/index.ts`

- Message handler for content scripts
- Orchestrates scan requests
- Manages IndexedDB cache
- Updates extension badge
- Handles authentication tokens

**Key Services:**
- `scanner.ts` - Scan orchestration (Layer 1 + API)
- `cache.ts` - IndexedDB cache management
- `auth.ts` - JWT token storage

### Content Scripts

**File:** `packages/extension/src/content/index.ts`

Injected into each AI platform page. Responsibilities:

- Monitor input fields (MutationObserver)
- Intercept paste events
- Track file uploads
- Extract content for scanning
- Inject alert banners

**Platform Handlers:**
```
content/platforms/
├── chatgpt.ts   - ChatGPT-specific selectors
├── gemini.ts    - Gemini-specific selectors
├── claude.ts    - Claude-specific selectors
└── copilot.ts   - Copilot-specific selectors
```

### Popup UI

**File:** `packages/extension/src/popup/App.tsx`

React-based popup interface:
- Protection on/off toggle
- Privacy mode toggle
- Notifications toggle
- Link to web dashboard

## API Architecture

### Routes

**File:** `packages/api/src/routes/`

- `scan.ts` - POST /v1/scan (main scanning endpoint)
- `report.ts` - GET /v1/report (threat history)
- `user.ts` - GET/PATCH /v1/user (user management)

### Services

- `scanner.ts` - Scan orchestration
- `mlClient.ts` - HTTP client for ML service
- `database.ts` - Prisma client wrapper

### Middleware

- JWT authentication
- Rate limiting (60 req/min per user)
- CORS

## ML Service Architecture

**File:** `packages/ml-service/app/main.py`

FastAPI service with two detection layers:

### Layer 1: Heuristics (`heuristics.py`)
- Regex pattern matching
- Hidden content detection
- Fast, no ML required
- ~10ms response time

### Layer 2: ML Classifier (`classifier.py`)
- DistilBERT-based (planned)
- Only runs if Layer 1 flags suspicious
- ~50-200ms response time

## Database Schema

```sql
-- User table
User {
  id: UUID (PK)
  email: String (optional, unique)
  subscriptionTier: "free" | "premium"
  settings: JSON
  createdAt: DateTime
}

-- Scan results (NO CONTENT STORED!)
ScanResult {
  id: UUID (PK)
  contentHash: String (SHA-256)  ← Hash only, not content
  verdict: "clean" | "suspicious" | "threat"
  score: Float (0-1)
  reason: String
  detectionLayer: "heuristic" | "ml" | "both"
  platform: String
  userId: UUID (FK, optional)
  createdAt: DateTime
}
```

## Security Architecture

### Privacy Principles

1. **No Content Storage**
   - Only SHA-256 hashes stored in database
   - Content never written to disk
   - Cache in IndexedDB is local only

2. **Privacy Mode**
   - Layer 1 runs entirely in extension (offline)
   - No API calls made
   - Default mode for free tier

3. **Minimal Permissions**
   - Only specific host permissions (no `<all_urls>`)
   - No `webRequest` for arbitrary sites

4. **Data Retention**
   - Free tier: 7 days
   - Premium: 365 days
   - Content hashes: 90 days max

### Authentication Flow (Future)

```
1. User enters email/password in dashboard
        ↓
2. POST /v1/auth/login
        ↓
3. API validates credentials
        ↓
4. Returns JWT token (RS256)
        ↓
5. Extension stores token in chrome.storage.local
        ↓
6. Token sent in Authorization header for all API calls
        ↓
7. Token expires after 7 days (configurable)
```

## Deployment Architecture

### Development
- All services run locally
- Docker Compose for infrastructure
- Hot reload for all TypeScript packages

### Production (Planned)

```
┌─────────────────┐
│  Chrome Web     │
│     Store       │ ← Extension distribution
└─────────────────┘

┌─────────────────┐
│  Cloudflare     │
│    Pages        │ ← Dashboard hosting
└─────────────────┘

┌─────────────────┐
│  Railway/       │
│   Render        │ ← API + PostgreSQL + Redis
└─────────────────┘

┌─────────────────┐
│  Modal /        │
│  HF Spaces      │ ← ML Service (GPU)
└─────────────────┘
```

## Performance Characteristics

### Extension
- Layer 1 scan: < 10ms (local)
- Cache hit: < 5ms
- Full scan (API): 50-300ms
- Badge update: < 1ms

### API
- /scan endpoint: 50-300ms (depends on ML)
- /report endpoint: 10-50ms
- Rate limit: 60 requests/min

### ML Service
- Heuristic only: < 10ms
- ML classification: 50-200ms
- Batch processing: Future optimization

## Scaling Strategy

### Horizontal Scaling
- API: Stateless, can scale to N instances
- ML Service: Serverless GPU (Modal)
- Database: Managed PostgreSQL (connection pooling)

### Caching Strategy
- Extension: IndexedDB (1 hour TTL)
- API: Redis (content hash → result)
- CDN: Static assets (dashboard, icons)

### Rate Limiting
- Per-user: 60 scans/minute
- Anonymous: 10 scans/minute
- API: 100 requests/minute total

## Monitoring & Observability

### Planned Integrations

- **Sentry** - Error tracking (all services)
- **PostHog** - Privacy-respecting analytics
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization

### Key Metrics

- Scans per second
- Detection accuracy (false positive rate)
- API latency (p50, p95, p99)
- Cache hit rate
- Active users (DAU/MAU)

---

For implementation details, see [DOC.md](./DOC.md)
