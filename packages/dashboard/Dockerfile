# Build context is the repo root (see docker-compose.yml): this package
# depends on @decrity/shared. Install is scoped to just @decrity/dashboard
# and its workspace deps (--filter ...) so the build doesn't also install
# the extension/landing/api packages' unrelated dependencies.
#
# tsconfig.json must be copied too: every package's tsconfig extends the
# root one (see packages/api/Dockerfile's comment for the failure this
# caused the first time).

FROM node:20-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/dashboard/package.json packages/dashboard/package.json

RUN pnpm install --filter @decrity/dashboard... --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/dashboard packages/dashboard

RUN pnpm --filter @decrity/shared build

# VITE_* vars are baked into the JS bundle at build time, not read at
# container runtime, so they come in as build args here.
ARG VITE_DASHBOARD_API_URL=http://localhost:3000
ENV VITE_DASHBOARD_API_URL=$VITE_DASHBOARD_API_URL

RUN pnpm --filter @decrity/dashboard build

FROM nginx:1.27-alpine

COPY packages/dashboard/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/dashboard/dist /usr/share/nginx/html

EXPOSE 80
