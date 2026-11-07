# @decrity/dashboard

Decrity web dashboard: a React app for viewing scan history and managing settings.

## Development

```bash
# from the repo root
pnpm dashboard:dev
```

## Build

```bash
pnpm --filter @decrity/dashboard build
```

## Docker

A standalone image can be built from the repo root (the build context must be the root, not this directory, since this package depends on `@decrity/shared`):

```bash
docker build -f packages/dashboard/Dockerfile \
  --build-arg VITE_DASHBOARD_API_URL=https://api.example.com \
  -t decrity-dashboard .
```

`VITE_DASHBOARD_API_URL` is baked into the JS bundle at build time, not read at container runtime, since it's a Vite env var. See [DEPLOY.md](../../DEPLOY.md) for how this runs in production.

## Features

- Dashboard overview with scan statistics
- Threat history log
- User settings management (not yet implemented)
- Weekly reports (not yet implemented)

## Tech stack

- React 18, React Router v6
- TanStack Query
- Tailwind CSS, shadcn/ui
- Vite

See the root [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) for the shared component/token conventions this package follows.
