# Deploying Decrity to the VPS

How the production deployment works. Read `docker-compose.prod.yml`'s own header comment too.

## How it works

Three separate GitHub Actions workflows, each doing one thing, not a single chained pipeline:

1. **`.github/workflows/ci.yml`**: lint, build (type-check), test. This is the only one that runs automatically, on every push and PR.
2. **`.github/workflows/docker-build.yml`**: builds service images and pushes them to GHCR (`ghcr.io/maltoishere/decrity-*`). Manual trigger only (Actions tab -> this workflow -> "Run workflow"); pushing code does not build or push images by itself. Has a **`service` input** (`all` / `api` / `ml-service` / `dashboard` / `landing`), defaulting to `all`: pick one to build and push just that image instead of all 4, e.g. only `landing` changed, no reason to also rebuild `api`.
3. **`.github/workflows/docker-deploy.yml`**: SSHes into the VPS as the `deploy` user (a dedicated key, scoped to just that user, not root), pulls and restarts containers, and applies any pending Prisma migrations, all from `/var/www/decrity`. Also manual trigger only, and never chained after a build finishes. The VPS never builds anything itself, and there's no source checkout or sync step: it only ever pulls whatever's currently tagged `:latest` on GHCR. Has the same **`service` input** as `docker-build.yml`, scoping `pull`/`up -d` to just that one container; `prisma migrate deploy` still runs every time regardless (harmless no-op without a pending migration). Routine changes, including schema changes, need nothing more than running this workflow; manually SSHing in is only for one-off VPS administration (the one-time setup below, troubleshooting, and the rollback escape hatch at the bottom).

nginx (already running on the VPS for `app`/`blink`/`monitor`) routes one more subdomain, `decrity.malto.icu`, to the `landing` container. Every other service (api, dashboard, postgres, redis, ml-service) stays bound to `127.0.0.1`, not reachable from outside the host, until deliberately exposed later.

This matches the VPS's existing convention for `blink`: Docker containers reverse-proxied through nginx, one shared `malto.icu` origin TLS cert (Cloudflare in front), `/var/www/<app>` owned by the `deploy` user.

## One-time setup (done, 2026-11-07)

- GHCR packages: made public (no secrets baked into any image; all config comes from environment variables at container runtime).
- `/var/www/decrity/` created on the VPS, owned by `deploy`, holding `docker-compose.prod.yml` and a `deploy`-owned `.env` (`chmod 600`) with freshly generated `POSTGRES_PASSWORD`/`JWT_SECRET` (not the local-dev values from this repo's own `.env`).
- nginx: `decrity.malto.icu` block appended to `/etc/nginx/sites-enabled/malto` (backup of the pre-edit file at `/etc/nginx/backups/`), routing to `127.0.0.1:3003` (`landing`). Validated with `nginx -t` and reloaded before confirming `blink`/`app` still responded normally.
- GitHub Actions deploy access: a dedicated ed25519 keypair (not the root VPS key used for manual admin work) was generated, its public half added to `deploy@`'s `authorized_keys`, and the private half stored as the `VPS_SSH_KEY` repo secret, alongside `VPS_HOST` and `VPS_USER=deploy`.

## Still pending (your action, not automatable from here)

**Cloudflare DNS record**: add an `A` record, `decrity` -> `178.104.224.137`, proxied (orange cloud), matching how `blink`/`app`/`monitor` are already set up. Nothing else works end-to-end from the public internet until this exists.

## Deploying

1. When you want new images built, run `docker-build.yml` manually: Actions tab -> "Build and push Docker images" -> "Run workflow", pick `service` (default `all`). Check the run for status and the per-image summary (status, image reference, tag, digest).
2. When you're ready to actually put those images live, separately run `docker-deploy.yml`: Actions tab -> "Deploy to VPS" -> "Run workflow", pick `service` again (independent of what you picked for the build, though normally the same). That's it, no local command needed.

`pull` fetches whatever's newly tagged `:latest` for each image; `up -d` recreates only the containers whose image actually changed, leaving the rest running undisturbed; then `prisma migrate deploy` runs inside the freshly-started `api` container, applying any migration that hasn't been recorded in the database's `_prisma_migrations` table yet (a no-op if there isn't one). This works because `api`'s image is built without `--prod` (see `packages/api/Dockerfile`), so the container already has the `prisma` CLI and the `prisma/migrations` folder baked in, no extra tooling needed on the VPS, and no separate step for you to remember.

If you'd rather run it by hand instead of through Actions, the equivalent manual command is:

```bash
ssh -i "C:\Users\Mohamed AIT OUAARAB\.ssh\id_ed25519_hetzner" root@178.104.224.137
cd /var/www/decrity
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T api pnpm exec prisma migrate deploy
docker compose -f docker-compose.prod.yml ps
```

To scope this to one service instead of all of them, same as the `service` input does, just name it on the `pull`/`up -d` lines: `docker compose -f docker-compose.prod.yml pull landing` / `... up -d landing`.

## Not done yet

- Only `landing` has a public nginx route. `api`/`dashboard` stay internal until there's a real plan for exposing them (auth, rate limiting review, a real public URL for the dashboard instead of the placeholder `VITE_DASHBOARD_API_URL` baked in at build time).
- Domain is `decrity.malto.icu` for now; move to a dedicated domain once one is bought, per the earlier handoff notes.
- No rollback tooling yet: each image is also tagged with its git SHA (visible in the build summary), so a manual rollback is possible by editing `docker-compose.prod.yml`'s tag and re-running `deploy`, but nothing automates this yet.
