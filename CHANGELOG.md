# Changelog

All notable changes to Decrity will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### In Progress
- Extension icon design
- Platform testing (ChatGPT, Gemini, Claude, Copilot)
- Onboarding flow

---

## [0.1.0] - 2026-03-29

### Added - Project Foundation

#### Infrastructure
- Monorepo setup with Turborepo and pnpm workspaces
- TypeScript configuration with strict mode
- ESLint and Prettier for code quality
- Docker Compose for local development (Postgres, Redis, ML service)
- GitHub issue and PR templates
- Complete documentation suite

#### Packages Created

**@decrity/shared**
- Type definitions for scan, user, and API contracts
- Platform constants (ChatGPT, Gemini, Claude, Copilot)
- Utility functions (hashing, validation)
- Shared constants (endpoints, thresholds, storage keys)

**@decrity/extension**
- Chrome Extension Manifest V3 scaffold
- Background service worker with scan orchestration
- Content scripts with platform-specific handlers
- Layer 1 heuristic detection (local, privacy-first)
- Alert banner injection system
- React-based popup UI with settings
- IndexedDB caching for scan results
- Vite + CRXJS build pipeline

**@decrity/api**
- Fastify REST API server
- Route structure: `/v1/scan`, `/v1/report`, `/v1/user`
- Prisma ORM with PostgreSQL schema (User, ScanResult)
- ML service HTTP client
- JWT authentication scaffolding
- Rate limiting and CORS configuration

**@decrity/ml-service**
- FastAPI server for ML classification
- Layer 1 heuristic detection (regex patterns)
- Layer 2 ML classifier placeholder
- Dockerfile for containerization

**@decrity/dashboard**
- React + Vite web application
- React Router for navigation
- TanStack Query integration
- Dashboard and History pages
- Tailwind CSS styling

#### Documentation
- `README.md` - Project overview with badges
- `QUICKSTART.md` - 5-minute setup guide
- `ARCHITECTURE.md` - System architecture diagrams
- `CONTRIBUTING.md` - Developer guidelines
- `ROADMAP.md` - Product roadmap and timeline
- `PROGRESS.md` - Detailed progress tracking
- `CHANGELOG.md` - This file
- `LICENSE` - Proprietary license
- `DOC.md` - Complete specification (pre-existing)

#### Features Implemented

**Extension**
- Local prompt injection detection (Layer 1 heuristics)
- Privacy Mode (default ON - no API calls)
- Support for 4 AI platforms (ChatGPT, Gemini, Claude, Copilot)
- Platform-specific DOM selectors
- Alert banner with plain-language warnings
- Non-blocking threat notifications
- Settings: Protection toggle, Privacy Mode, Notifications
- IndexedDB caching with 1-hour TTL

**Detection Capabilities**
- Regex pattern matching for common injection attacks
- Hidden content detection (HTML comments, zero-width chars)
- Instruction override detection
- Role manipulation detection
- System prompt injection detection
- Data exfiltration attempt detection

**Privacy & Security**
- No content storage (only SHA-256 hashes)
- Privacy Mode runs entirely offline
- Minimal browser permissions (no `<all_urls>`)
- Plain-language user interface (no technical jargon)

### Technical Details
- **Lines of Code:** ~5,000
- **Files Created:** 80+
- **Languages:** TypeScript, Python, CSS, YAML, Markdown
- **Dependencies Managed:** 100+

### Development Tools
- Turborepo for monorepo orchestration
- pnpm for package management
- Docker for containerized services
- Prisma for database migrations
- Vite for fast builds
- CRXJS for Chrome extension development

---

## Version History

| Version | Release Date | Status | Highlights |
|---------|--------------|--------|------------|
| 0.1.0 | 2026-03-29 | Released | Initial foundation and architecture |
| 1.0.0 | TBD | Planned | MVP launch on Chrome Web Store |
| 1.5.0 | TBD | Planned | Backend integration with ML classification |
| 2.0.0 | TBD | Planned | Full three-pillar feature set |

---

## Upcoming in v1.0

### Planned Features
- Extension icon design (16px, 32px, 48px, 128px)
- Onboarding flow (3-step interactive demo)
- Enhanced alert UI with dismissal persistence
- Notification system
- Platform testing and validation
- Unit tests for heuristics
- Performance profiling
- Chrome Web Store submission

### Improvements
- Refined heuristic patterns
- Better error handling
- Optimized bundle size
- Improved cache management

---

## Future Versions

### v1.5 - Backend Integration
- ML model training and deployment
- User authentication system
- Dashboard API integration
- Premium subscription features
- Firefox extension support

### v2.0 - Full Feature Set
- AI Identity Verifier (Pillar 2)
- Data Watchdog (Pillar 3)
- Mobile companion apps (iOS/Android)
- Enterprise B2B2C features
- Multimodal scanning support

---

## Migration Guides

### v0.1 to v1.0
No migration needed - fresh installation.

### Future Migrations
Migration guides will be provided for users upgrading between major versions.

---

## Deprecation Notices

None at this time.

---

## Breaking Changes

### v0.1.0
Initial release - no breaking changes.

---

## Security Updates

### v0.1.0
- Implemented privacy-first architecture
- No content storage policy
- Minimal permission model

---

## Known Issues

See [PROGRESS.md](./PROGRESS.md#known-issues--blockers) for current issues and blockers.

### v0.1.0 Known Issues
1. Extension icons missing (placeholder needed)
2. ML model not yet trained (expected)
3. User authentication not implemented (expected)
4. Platform selectors may break with UI updates

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to contribute to this project.

---

## Links

- **Repository:** https://github.com/MALTOisHERE/Decrity
- **Issues:** https://github.com/MALTOisHERE/Decrity/issues
- **Roadmap:** [ROADMAP.md](./ROADMAP.md)
- **Progress:** [PROGRESS.md](./PROGRESS.md)

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security updates

---

[Unreleased]: https://github.com/MALTOisHERE/Decrity/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MALTOisHERE/Decrity/releases/tag/v0.1.0
