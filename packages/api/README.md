# @decrity/api

Decrity Backend API - Node.js/Fastify REST API

## Setup

```bash
# Install dependencies (from root)
pnpm install

# Set up database
cp ../../.env.example ../../.env
# Edit .env with your DATABASE_URL

# Run migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

## Development

```bash
# Start dev server with hot reload
pnpm dev

# Run Prisma Studio (database GUI)
pnpm db:studio
```

## API Endpoints

- `GET /health` - Health check
- `POST /v1/scan` - Scan content for threats
- `GET /v1/report` - Get threat history
- `GET /v1/user` - Get user profile (TODO)
- `PATCH /v1/user` - Update user settings (TODO)

## Environment Variables

See `../../.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `ML_SERVICE_URL` - ML service endpoint
