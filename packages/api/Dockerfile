# Build context is the repo root (see docker-compose.yml): this is a pnpm
# workspace package depending on @decrity/shared, so pnpm needs the
# workspace's package.json/lockfile structure to resolve it. The install is
# scoped to just @decrity/api and its workspace deps (--filter ...) so the
# image doesn't carry the other 3 packages' React/Vite/Tailwind/Radix
# dependencies, which were previously making this image ~900MB.
#
# tsconfig.json must be copied too: every package's tsconfig extends the
# root one, and its absence caused a confusing TS2792 module-resolution
# error the first time this was tried (2026-11-07).
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl
RUN corepack enable

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/api/package.json packages/api/package.json

RUN pnpm install --filter @decrity/api... --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/api packages/api

RUN pnpm --filter @decrity/shared build
RUN pnpm --filter @decrity/api exec prisma generate
RUN pnpm --filter @decrity/api build

WORKDIR /app/packages/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
