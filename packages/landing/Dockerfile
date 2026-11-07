# Build context is the repo root (see docker-compose.yml), for consistency
# with the other packages' Dockerfiles. This package has no @decrity/shared
# dependency, so the scoped install only needs its own package.json.
#
# tsconfig.json must be copied too: it extends the root one (see
# packages/api/Dockerfile's comment for the failure this caused originally).

FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY packages/landing/package.json packages/landing/package.json

RUN pnpm install --filter @decrity/landing --frozen-lockfile

COPY packages/landing packages/landing

RUN pnpm --filter @decrity/landing build

FROM nginx:1.27-alpine

COPY packages/landing/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/landing/dist /usr/share/nginx/html

EXPOSE 80
