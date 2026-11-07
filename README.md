<p align="center">
  <img src="packages/extension/public/brand/wordmark.png" alt="Decrity" width="360">
</p>

<p align="center"><strong>AI Security Firewall for Consumers</strong></p>

<p align="center">
  <a href="https://github.com/MALTOisHERE/Decrity"><img src="https://img.shields.io/badge/GitHub-Decrity-blue?logo=github" alt="GitHub"></a>
  <a href="./PROGRESS.md"><img src="https://img.shields.io/badge/version-0.1.0-green" alt="Version"></a>
  <a href="./ROADMAP.md"><img src="https://img.shields.io/badge/status-in%20development-yellow" alt="Status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-proprietary-red" alt="License"></a>
</p>

Decrity is a browser extension and web dashboard that acts as an AI interaction firewall for everyday consumers. It monitors, scans, and reports on AI tool usage, protecting users from prompt injection attacks, fake AI impersonation, and invisible data harvesting.

**Repository:** https://github.com/MALTOisHERE/Decrity

## Packages

A monorepo managed with Turborepo and pnpm workspaces.

| Package | Description |
|---|---|
| [`extension`](./packages/extension) | Chrome extension (TypeScript, React, Vite, CRXJS) |
| [`api`](./packages/api) | Backend API (Node.js, Fastify, Prisma, PostgreSQL) |
| [`ml-service`](./packages/ml-service) | ML detection service (Python, FastAPI) |
| [`dashboard`](./packages/dashboard) | Web dashboard (React, Vite, TanStack Query, shadcn/ui) |
| [`landing`](./packages/landing) | Marketing landing page (React, Vite, shadcn/ui) |
| [`shared`](./packages/shared) | Shared TypeScript types, constants, and utilities |

## Getting started

New to the project? See [QUICKSTART.md](./QUICKSTART.md) for a 5-minute setup guide.

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Python >= 3.11
- Docker and Docker Compose

### Install

```bash
pnpm install
cp .env.example .env
# edit .env with your own values

docker-compose up -d    # Postgres, Redis, ML service

cd packages/api
pnpm db:migrate
pnpm db:generate
cd ../..
```

### Develop

```bash
pnpm dev               # all TypeScript packages, in parallel

# or individually:
pnpm extension:dev     # Chrome extension, hot reload
pnpm api:dev           # backend API
pnpm dashboard:dev     # web dashboard
pnpm landing:dev       # marketing landing page

# ML service runs in Docker (started above); tail its logs with:
docker-compose logs -f ml-service
```

### Build

```bash
pnpm build                                 # all packages
pnpm --filter @decrity/extension build     # a single package
```

### Quality checks

```bash
pnpm lint
pnpm format
```

## Deployment

Each service (api, ml-service, dashboard, landing) builds as its own Docker image and ships to a VPS through dedicated, manually-triggered GitHub Actions workflows (`docker-build.yml`, `docker-deploy.yml`), separate from the `ci.yml` workflow that runs lint/build/test on every push. See [DEPLOY.md](./DEPLOY.md) for the full setup and the deploy flow.

## Documentation

- [QUICKSTART.md](./QUICKSTART.md): setup in 5 minutes
- [CONTRIBUTING.md](./CONTRIBUTING.md): development guidelines and workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md): system architecture and data flow
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md): UI conventions, components, color tokens, brand assets
- [DOC.md](./DOC.md): complete project specification
- [DEPLOY.md](./DEPLOY.md): VPS deployment and CI/CD
- [GLOSSARY.md](./GLOSSARY.md): project terminology
- [STATUS.md](./STATUS.md): current status at a glance
- [ROADMAP.md](./ROADMAP.md): product roadmap and release schedule
- [PROGRESS.md](./PROGRESS.md): detailed progress tracking
- [CHANGELOG.md](./CHANGELOG.md): version history and release notes

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

- [Report a bug](https://github.com/MALTOisHERE/Decrity/issues/new?labels=bug)
- [Request a feature](https://github.com/MALTOisHERE/Decrity/issues/new?labels=enhancement)
- [View open issues](https://github.com/MALTOisHERE/Decrity/issues)

## License

Proprietary, all rights reserved. See [LICENSE](./LICENSE) for details.
