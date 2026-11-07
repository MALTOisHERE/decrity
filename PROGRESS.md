# Decrity Development Progress & Timeline

> **Last Updated:** 2026-11-06
> **Current Version:** v0.1.0 (Foundation)
> **Next Milestone:** v1.0.0 (MVP Launch)

---

## Project Status Overview

| Milestone | Status | Completion | Target Date |
|-----------|--------|------------|-------------|
| **v0.1** - Foundation & Architecture | Complete | 100% | 2026-03-29 |
| **v1.0** - MVP (Minimum Viable Product) | In Progress | 35% | Month 1-3 |
| **v1.5** - Backend & Dashboard Integration | Planned | 0% | Month 4-6 |
| **v2.0** - Full Feature Set | Planned | 0% | Month 7-12 |

---

## Version History

### v0.1.0 - Foundation (Complete, 2026-03-29)

**Goal:** Establish complete project architecture and development infrastructure

#### Completed
- [x] Monorepo setup (Turborepo + pnpm workspaces)
- [x] TypeScript configuration (strict mode, shared tsconfig)
- [x] Shared package (`@decrity/shared`)
  - [x] Type definitions (scan, user, API contracts)
  - [x] Constants (platforms, endpoints, thresholds)
  - [x] Utilities (hashing, validation)
- [x] Chrome Extension scaffold
  - [x] Manifest V3 configuration
  - [x] Background service worker structure
  - [x] Content script architecture
  - [x] Platform-specific handlers (ChatGPT, Gemini, Claude, Copilot)
  - [x] Layer 1 heuristic scanner (local)
  - [x] Alert banner injector
  - [x] React popup UI
  - [x] IndexedDB caching
  - [x] Vite + CRXJS build setup
- [x] Backend API scaffold
  - [x] Fastify server setup
  - [x] Route structure (/scan, /report, /user)
  - [x] Prisma schema (User, ScanResult)
  - [x] ML service client
  - [x] JWT auth scaffolding
  - [x] Rate limiting
- [x] ML Service scaffold
  - [x] FastAPI server
  - [x] Heuristic detection (Layer 1)
  - [x] ML classifier placeholder (Layer 2)
  - [x] Dockerfile
- [x] Dashboard scaffold
  - [x] React + Vite setup
  - [x] React Router
  - [x] TanStack Query integration
  - [x] Dashboard and History pages
  - [x] Tailwind CSS
- [x] Development infrastructure
  - [x] Docker Compose (Postgres, Redis, ML service)
  - [x] ESLint + Prettier configuration
  - [x] Git setup
- [x] Documentation
  - [x] README.md with badges and links
  - [x] QUICKSTART.md (5-minute setup guide)
  - [x] ARCHITECTURE.md (system diagrams)
  - [x] CONTRIBUTING.md (dev guidelines)
  - [x] DOC.md (complete spec, already existed)
  - [x] LICENSE
  - [x] GitHub issue/PR templates

#### Metrics
- **Total Files Created:** 80+
- **Lines of Code:** ~5,000
- **Packages:** 5 (shared, extension, api, ml-service, dashboard)
- **Languages:** TypeScript, Python, CSS
- **Infrastructure:** Docker, Postgres, Redis

---

## v1.0 - MVP (Minimum Viable Product) (In Progress)

**Goal:** Launch functional Chrome extension with local threat detection

**Target:** Month 1-3
**Progress:** 35% Complete

### Completed (Foundation from v0.1)
- [x] Extension architecture
- [x] Layer 1 heuristic detection
- [x] Platform handlers
- [x] Alert system
- [x] Privacy mode

### In Progress
- [ ] **Extension Polish** (Week 1-2)
  - [ ] Design and add extension icons (16, 32, 48, 128px)
    - Placeholder icons exist now (brand teal, functional, unblock loading), but no final shield-based design yet
    - Export in all required sizes
    - Update manifest.json references
  - [ ] Test Layer 1 heuristics with real injection examples
  - [x] Refine alert banner styling: rebuilt on shadcn/ui (React + Alert component), mounted inside a Shadow DOM root so it's isolated from each host platform's own styles/React instance; see DESIGN_SYSTEM.md
  - [ ] Add dismissal persistence
  - [ ] Implement notification system

- [x] **Protection Gap detection + Gap Report** (not originally scoped here, added via `.wayfinder/` tickets 001-004): when a platform's selector(s) stop matching, the extension pauses scanning on it, shows a distinct badge/popup state, and sends a content-free report to the API (`POST /v1/gap-report`, deduped client-side to once per platform per day). Shipped.

- [ ] **Platform Testing** (Week 2)
  - [ ] Test on ChatGPT (test various UI states)
  - [x] Test on Gemini: informal testing passed (selector sanity, gap detection, scan pipeline) once the ML service container was actually running; surfaced the separate "API fails open to clean" issue below, unrelated to Gemini specifically
  - [x] Test on Claude: informal testing found and fixed a real bug (`claude.ts`'s selector was matching a hidden SSR fallback element ahead of the real composer, silently breaking scanning)
  - [ ] Test on Copilot: not tested (sign-in required, skipped). Worth checking when it is tested: `https://copilot.microsoft.com` auto-redirected to `https://copilot.com` for a signed-out visitor (2026-11-06), a domain Decrity's manifest doesn't cover at all. Unconfirmed whether the authenticated app also lives there, but this is the same class of issue as the chat.openai.com to chatgpt.com migration found and fixed earlier.
  - [ ] Document selector updates needed
  - [x] Create selector update mechanism: not automated, but `.wayfinder/tickets/005-protection-gap-qa-plan.md` defines the manual per-platform QA procedure (and a reusable DevTools script) that must pass on all 4 platforms before any release

### Todo
- [ ] **Extension Features** (Week 3-4)
  - [ ] Add onboarding flow (3-step interactive demo)
  - [ ] Settings persistence improvements
  - [ ] Badge icon state management
  - [ ] Keyboard shortcuts (optional)
  - [ ] Context menu integration (optional)

- [ ] **Testing & QA** (Week 5-6)
  - [ ] Write unit tests for heuristics
  - [ ] Test cache expiration
  - [ ] Test privacy mode toggle
  - [ ] Memory leak testing
  - [ ] Performance profiling
  - [ ] Cross-platform browser testing (Chrome, Edge)

- [ ] **Documentation** (Week 7)
  - [ ] User guide
  - [ ] Privacy policy: first draft exists (`PRIVACY.md`), matches DOC.md Section 10's data handling table, but not legally reviewed and not ready to publish or link from the Chrome Web Store listing
  - [ ] Terms of service
  - [ ] Chrome Web Store listing copy
  - [ ] Screenshots and demo video

- [ ] **Deployment** (Week 8)
  - [ ] Build production bundle
  - [ ] Submit to Chrome Web Store
  - [ ] Create landing page (optional)
  - [ ] Set up analytics (PostHog)
  - [ ] Monitor initial users

### Success Criteria for v1.0
- [ ] Extension loads without errors on all 4 platforms
- [ ] Layer 1 detection works offline
- [ ] False positive rate < 5%
- [ ] Alert banners display correctly
- [ ] Privacy mode functions properly
- [ ] Chrome Web Store approved
- [ ] 100+ installs in first week

---

## v1.5 - Backend & Dashboard (Planned)

**Goal:** Full-stack integration with ML classification and user accounts

**Target:** Month 4-6
**Progress:** 0%

### Backend Development
- [ ] **Database Setup**
  - [ ] Deploy PostgreSQL (Railway/Render)
  - [ ] Run migrations in production
  - [ ] Set up connection pooling
  - [ ] Configure backups

- [ ] **API Deployment**
  - [ ] Deploy Fastify API (Railway/Render)
  - [ ] Configure Redis cache
  - [ ] Set up monitoring (Sentry)
  - [ ] Load testing
  - [ ] API documentation (Swagger)

- [ ] **ML Service**
  - [ ] Gather training data (PromptBench, PINT datasets)
  - [ ] Generate synthetic injection examples
  - [ ] Label training dataset (1000+ examples)
  - [ ] Fine-tune DistilBERT model
  - [ ] Evaluate model accuracy
  - [ ] Deploy to Modal/HuggingFace Spaces
  - [ ] GPU inference optimization

- [ ] **Authentication System**
  - [ ] JWT token generation/validation
  - [ ] Email/password registration
  - [ ] Login endpoint
  - [ ] Token refresh mechanism
  - [ ] Password reset flow
  - [ ] Email verification (optional)

### Dashboard Integration
- [ ] **API Integration**
  - [x] Connect dashboard to API: done locally only (no deployed backend). Added `GET /v1/user/stats` (didn't exist before) and fixed `GET /v1/report`, which had always silently returned empty due to a userId mismatch between what scans were persisted with and what history was queried by, plus a missing query-string schema that made Prisma reject the `limit`/`offset` params.
  - [ ] Implement authentication flow: still not implemented; all local testing uses `userId: null` (no accounts exist yet)
  - [x] Fetch threat history: working locally, paginated, on the History page
  - [x] Display user statistics: working locally, on the Dashboard page (total scans, threats caught, streak, verdict breakdown)
  - [ ] Real-time updates (optional)

- [ ] **Dashboard Features**
  - [ ] Login/signup pages
  - [ ] Settings page
  - [ ] Threat history with filtering
  - [ ] Data export (CSV/JSON)
  - [ ] Weekly report email generation
  - [x] Charts and visualizations: a verdict breakdown is shown on the Dashboard page, deliberately as plain inline bars rather than a boxed Recharts widget (see DESIGN_SYSTEM.md); Recharts itself is still a dependency but unused for now

### Extension Updates
- [ ] **API Integration**
  - [ ] Connect extension to production API
  - [ ] Handle authentication tokens
  - [ ] Sync settings across devices
  - [ ] Toggle between Privacy Mode and ML mode

- [ ] **Premium Features**
  - [ ] Subscription check
  - [ ] Feature gating (free vs premium)
  - [ ] Stripe payment integration
  - [ ] Family plan management

### Additional Platforms
- [ ] **Firefox Support**
  - [ ] Test WebExtensions API compatibility
  - [ ] Build Firefox-specific bundle
  - [ ] Submit to Firefox Add-ons

### Success Criteria for v1.5
- [ ] ML classifier accuracy > 90%
- [ ] False positive rate < 2%
- [ ] API uptime > 99.5%
- [ ] User registration functional
- [ ] Dashboard displays real data
- [ ] Premium subscriptions working

---

## v2.0 - Full Feature Set (Planned)

**Goal:** Complete vision from DOC.md with all three pillars

**Target:** Month 7-12
**Progress:** 0%

### Pillar 2 - AI Identity Verifier
- [ ] Domain verification system
- [ ] UI fingerprinting
- [ ] Community-maintained allowlist
- [ ] Fake chatbot detection
- [ ] Certificate pinning
- [ ] Phishing detection

### Pillar 3 - Data Watchdog
- [ ] Network request monitoring
- [ ] Permission analyzer
- [ ] Data transmission alerts
- [ ] Weekly "AI data diet" report
- [ ] Privacy score calculation
- [ ] Anomaly detection

### Mobile Support
- [ ] iOS companion app (read-only dashboard)
- [ ] Android companion app (read-only dashboard)
- [ ] Push notifications
- [ ] Mobile-optimized dashboard

### Enterprise Features
- [ ] B2B2C white-label API
- [ ] Multi-tenant support
- [ ] Admin dashboard
- [ ] Custom branding
- [ ] SSO integration
- [ ] Audit logs

### Advanced Features
- [ ] Multimodal input scanning (images)
- [ ] Browser bookmark scanning
- [ ] Browser history analysis (opt-in)
- [ ] AI assistant recommendations
- [ ] Threat intelligence feed
- [ ] Integration with security tools

### Success Criteria for v2.0
- [ ] All three pillars functional
- [ ] 10,000+ active users
- [ ] Premium conversion rate > 5%
- [ ] B2B2C partnerships signed
- [ ] Mobile apps in app stores
- [ ] Press coverage (Product Hunt, Hacker News)

---

## Known Issues & Blockers

### Current Issues
1. **Extension Icons Missing**
   - Status: Blocker, blocking v1.0
   - Need: 16x16, 32x32, 48x48, 128x128 PNG files
   - Priority: High
   - Owner: Design team

2. **Platform Selectors Fragile**
   - Status: Warning, confirmed real, not just theoretical: a hidden SSR fallback element on claude.ai was silently matching before the real composer (found and fixed 2026-11-06)
   - Risk: AI platforms frequently change DOM
   - Mitigation: Protection Gap detection now ships in the extension (pauses scanning and notifies the user when a platform's selector stops matching), and `.wayfinder/tickets/005-protection-gap-qa-plan.md` defines a manual QA procedure that must pass on all 4 platforms before a release. Not yet run against ChatGPT, Gemini, or Copilot.
   - Priority: Medium
   - Owner: Extension team

3. **ML Model Not Trained**
   - Status: Warning, expected for v0.1
   - Blocker for: v1.5 full ML classification
   - Need: Training dataset (1000+ labeled examples)
   - Priority: Medium (v1.5)
   - Owner: ML team

4. **No User Authentication**
   - Status: Warning, expected for v0.1
   - Blocker for: Dashboard integration
   - Priority: Medium (v1.5)
   - Owner: Backend team

5. **API fails open to "clean" when the ML service is down**
   - Status: Fixed 2026-11-06
   - Was: `packages/api/src/services/scanner.ts`'s `scanContent()` caught any ML service connection failure and returned a hardcoded `{ verdict: 'clean', score: 0 }`, discarding the result entirely. Since the extension's own `runFullScan()` trusted whatever the API returned once the request succeeded, a reachable-but-ML-down API silently cleared a genuinely suspicious or threatening paste for every user with Privacy Mode off, with no visible signal that detection degraded.
   - Fix: the extension now sends its own Layer 1 heuristic result along with every `/v1/scan` request (`ScanAPI.Request.heuristic`, see `packages/shared/src/types/api.ts`). When the ML service is unreachable, the API now returns that heuristic result instead of a hardcoded clean. If no heuristic was sent at all (a future caller that skips Layer 1), it fails safe to `suspicious` with a plain-language reason, never silently clean. Verified live: stopped the ML service, confirmed a `suspicious` scan correctly returned `suspicious` (not `clean`), both with and without a heuristic in the request.
   - Owner: Backend team

### Technical Debt
- [ ] Add unit tests (extension, API)
- [ ] Add integration tests
- [ ] Improve error handling
- [ ] Add logging infrastructure
- [ ] Optimize bundle size
- [ ] Add CI/CD pipeline

---

## Metrics & KPIs

### Development Metrics
| Metric | Current | v1.0 Target | v1.5 Target | v2.0 Target |
|--------|---------|-------------|-------------|-------------|
| Code Coverage | 0% | 60% | 80% | 90% |
| Build Time | ~30s | <45s | <60s | <90s |
| Bundle Size (ext) | TBD | <500KB | <750KB | <1MB |
| API Latency (p95) | N/A | <200ms | <150ms | <100ms |

### User Metrics (Future)
| Metric | v1.0 Target | v1.5 Target | v2.0 Target |
|--------|-------------|-------------|-------------|
| Total Installs | 100+ | 1,000+ | 10,000+ |
| DAU | 20+ | 200+ | 2,000+ |
| Premium Conversion | N/A | 3% | 5% |
| Threat Detection Rate | 80% | 90% | 95% |
| False Positive Rate | <5% | <2% | <1% |

---

## Development Timeline

```
Month 1-3: v1.0 MVP
├─ Week 1-2:  Extension polish & icons
├─ Week 3-4:  Platform testing
├─ Week 5-6:  QA & testing
├─ Week 7:    Documentation
└─ Week 8:    Chrome Web Store submission

Month 4-6: v1.5 Backend Integration
├─ Month 4:   Database & API deployment
├─ Month 5:   ML model training
└─ Month 6:   Dashboard integration & Firefox support

Month 7-12: v2.0 Full Feature Set
├─ Month 7-8:   Pillar 2 (AI Identity Verifier)
├─ Month 9-10:  Pillar 3 (Data Watchdog)
└─ Month 11-12: Mobile apps & enterprise features
```

---

## How to Update This Document

### When Completing a Task
1. Move item from "Todo" to "Completed"
2. Update progress percentage
3. Update "Last Updated" date at top
4. Commit with message: `docs: mark [task] as complete`

### When Adding New Tasks
1. Add to appropriate version section under "Todo"
2. Assign priority (High/Medium/Low)
3. Assign owner/team if known
4. Update "Last Updated" date
5. Commit with message: `docs: add task [task name] to [version]`

### When Encountering Blockers
1. Add to "Known Issues & Blockers" section
2. Mark with appropriate status (Blocker/Warning/OK)
3. Document mitigation plan
4. Assign owner
5. Reference in relevant version section

### Weekly Review
- Update progress percentages
- Review and reprioritize tasks
- Update timeline if needed
- Add new metrics
- Document lessons learned

---

## Quick Commands

```bash
# Check project status
git status

# View recent progress
git log --oneline --since="1 week ago"

# Count completed tasks
grep -r "\[x\]" PROGRESS.md | wc -l

# Count pending tasks
grep -r "\[ \]" PROGRESS.md | wc -l

# Generate progress report
pnpm run progress-report  # (TODO: create script)
```

---

**Legend:**
- Complete: done
- In Progress: actively being worked on
- Planned: not started yet
- Blocker: blocking another milestone
- Warning: known risk or caveat
- OK: no concerns
