# TrustLayer

> AI Security Firewall for Consumers

[![GitHub](https://img.shields.io/badge/GitHub-TrustLayer-blue?logo=github)](https://github.com/MALTOisHERE/TrustLayer)
[![Version](https://img.shields.io/badge/version-0.1.0-green)](./PROGRESS.md)
[![Status](https://img.shields.io/badge/status-in%20development-yellow)](./ROADMAP.md)
[![License](https://img.shields.io/badge/license-proprietary-red)](./LICENSE)

TrustLayer is a browser extension + web dashboard that acts as an AI interaction firewall for everyday consumers. It silently monitors, scans, and reports on AI tool usage — protecting users from prompt injection attacks, fake AI impersonation, and invisible data harvesting.

**Repository:** https://github.com/MALTOisHERE/TrustLayer

## Architecture

This is a **monorepo** managed with **Turborepo** and **pnpm workspaces**.

### Packages

```
packages/
├── extension/      Chrome extension (TypeScript, React, Vite, CRXJS)
├── api/            Backend API (Node.js, Fastify, Prisma, PostgreSQL)
├── ml-service/     ML detection service (Python, FastAPI, HuggingFace)
├── dashboard/      Web dashboard (React, Vite, TanStack Query)
└── shared/         Shared TypeScript types and utilities
```

## Quick Start

**New to the project?** See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- Docker & Docker Compose

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure services (Postgres, Redis, ML service)
docker-compose up -d

# Set up database
cd packages/api
pnpm db:migrate
pnpm db:generate
cd ../..
```

### Development

```bash
# Run all TypeScript packages in development mode
pnpm dev

# Or run specific packages
pnpm extension:dev   # Chrome extension with hot reload
pnpm api:dev         # Backend API server
pnpm dashboard:dev   # Web dashboard

# ML service runs in Docker (already started above)
# View logs: docker-compose logs -f ml-service
```

### Docker Services

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset everything (including data)
docker-compose down -v
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @trustlayer/extension build
```

## Documentation

### 🚀 Getting Started
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development guidelines and workflow

### 📊 Project Tracking
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview (start here!)
- **[STATUS.md](./STATUS.md)** - Quick status dashboard
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap and release schedule
- **[PROGRESS.md](./PROGRESS.md)** - Detailed progress tracking with timeline
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and release notes

### 🏗️ Technical Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and data flow diagrams
- **[DOC.md](./DOC.md)** - Complete project specification (40+ pages)

### Key Documentation Sections

- [Architecture Overview](./DOC.md#5-architecture)
- [Tech Stack](./DOC.md#6-tech-stack)
- [Feature Specification](./DOC.md#7-feature-specification-v10)
- [Security & Privacy](./DOC.md#10-security--privacy-principles)
- [Roadmap](./DOC.md#12-roadmap)

## Project Status

**Current Version:** [v0.1.0](./CHANGELOG.md) (Foundation)
**Next Milestone:** [v1.0.0](./ROADMAP.md) (MVP Launch)
**Progress:** 35% towards v1.0

### ✅ What's Done (v0.1)

✅ Monorepo architecture (Turborepo + pnpm)
✅ Chrome extension with Manifest V3
✅ Layer 1 heuristic detection (local, privacy-first)
✅ Backend API (Node.js/Fastify)
✅ ML service scaffolding (Python/FastAPI)
✅ Web dashboard (React)
✅ Docker Compose dev environment
✅ Complete documentation suite

### 🚧 What's Next (v1.0)

- [ ] Extension icons and branding
- [ ] Platform testing (ChatGPT, Gemini, Claude, Copilot)
- [ ] Onboarding flow
- [ ] QA and performance testing
- [ ] Chrome Web Store submission

### 📋 Future (v1.5+)

- ML model training and deployment
- User authentication system
- Dashboard API integration
- Premium subscriptions
- Firefox support

See [ROADMAP.md](./ROADMAP.md) for full timeline and [PROGRESS.md](./PROGRESS.md) for detailed tracking.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Quick Links

- [Report a bug](https://github.com/MALTOisHERE/TrustLayer/issues/new?labels=bug)
- [Request a feature](https://github.com/MALTOisHERE/TrustLayer/issues/new?labels=enhancement)
- [View open issues](https://github.com/MALTOisHERE/TrustLayer/issues)

## License

Proprietary - All rights reserved

See [LICENSE](./LICENSE) for details.
