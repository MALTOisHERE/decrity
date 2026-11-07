# @decrity/api

Decrity backend API: Node.js/Fastify REST API.

## Setup

```bash
# from the repo root
pnpm install
cp .env.example .env
# edit .env with your own DATABASE_URL etc.

pnpm --filter @decrity/api db:migrate
pnpm --filter @decrity/api db:generate
```

## Development

```bash
pnpm --filter @decrity/api dev     # dev server, hot reload
pnpm --filter @decrity/api db:studio   # Prisma Studio (database GUI)
```

## Docker

A standalone image can be built from the repo root (the build context must be the root, not this directory, since this package depends on `@decrity/shared`):

```bash
docker build -f packages/api/Dockerfile -t decrity-api .
```

In practice this runs as part of the full stack; see the root [`docker-compose.yml`](../../docker-compose.yml) for local development or [DEPLOY.md](../../DEPLOY.md) for production.

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/v1/scan` | Scan content for threats |
| `GET` | `/v1/report` | Get threat history |
| `GET` | `/v1/user` | Get user profile (not yet implemented) |
| `PATCH` | `/v1/user` | Update user settings (not yet implemented) |
| `GET` | `/v1/user/stats` | Get aggregate scan statistics for the dashboard |
| `POST` | `/v1/gap-report` | Report a Protection Gap (platform selector breakage); see `GLOSSARY.md` |

## Environment variables

See the root [`.env.example`](../../.env.example) for the full list. The ones this package reads directly:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (provisioned, not yet used by any route)
- `JWT_SECRET`: JWT signing secret
- `ML_SERVICE_URL`: ML service endpoint
- `API_PORT`, `API_HOST`, `LOG_LEVEL`, `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`
