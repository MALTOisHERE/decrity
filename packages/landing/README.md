# @decrity/landing

Decrity marketing landing page, standalone from the dashboard.

## Development

```bash
# from the repo root
pnpm landing:dev

# or directly
pnpm --filter @decrity/landing dev
```

## Build

```bash
pnpm --filter @decrity/landing build
```

## Docker

A standalone image can be built from the repo root (the build context must be the root, for consistency with the other packages' Dockerfiles, even though this one has no `@decrity/shared` dependency of its own):

```bash
docker build -f packages/landing/Dockerfile -t decrity-landing .
```

This is the only service currently given a public route; see [DEPLOY.md](../../DEPLOY.md).

## Tech stack

- React 18
- Tailwind CSS
- shadcn/ui (Button only, so far)
- Vite

See the root [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) for the shared component/token conventions this package follows, including where the third-party AI platform logos used here come from.
