# Deploying Decrity to the VPS

How the production deployment works, and the exact steps to set it up or update it. Read `docker-compose.prod.yml`'s own header comment first; this document is the step-by-step that goes with it.

## How it works

1. `.github/workflows/docker-build.yml` builds all 4 service images (api, ml-service, dashboard, landing) on every push to `main` that touches them, and pushes them to GHCR (`ghcr.io/maltoishere/decrity-*`).
2. The VPS never builds anything. It only pulls the pre-built images and runs them via `docker-compose.prod.yml`.
3. nginx (already running on the VPS for `app`/`blink`/`monitor`) gets one more subdomain, `decrity.malto.icu`, routed to the `landing` container only. Every other service (api, dashboard, postgres, redis, ml-service) stays bound to `127.0.0.1`, not reachable from outside the host, until they're deliberately exposed later.

This matches the VPS's existing convention for `blink`: Docker containers reverse-proxied through nginx, one shared `malto.icu` origin TLS cert (Cloudflare in front), `/var/www/<app>` owned by the `deploy` user.

## One-time setup

### 1. Make the GHCR images pullable

The first push to `main` creates 4 private packages under `github.com/MALTOisHERE?tab=packages`. Either:

- **Make them public** (simplest, recommended since no secrets are baked into any image; all of them read config from environment variables at runtime): for each of the 4 packages, Package settings -> Change visibility -> Public.
- **Or keep them private** and have the VPS authenticate: create a GitHub personal access token (classic) with the `read:packages` scope, then on the VPS: `echo <token> | docker login ghcr.io -u <your-github-username> --password-stdin`.

### 2. Create the deploy directory on the VPS

```bash
ssh -i "C:\Users\Mohamed AIT OUAARAB\.ssh\id_ed25519_hetzner" root@178.104.224.137
mkdir -p /var/www/decrity
chown deploy:deploy /var/www/decrity
```

Copy `docker-compose.prod.yml` there (as the `deploy` user, or `scp` it from this machine):

```bash
scp -i "C:\Users\Mohamed AIT OUAARAB\.ssh\id_ed25519_hetzner" docker-compose.prod.yml deploy@178.104.224.137:/var/www/decrity/
```

### 3. Create `/var/www/decrity/.env` on the VPS

Root-owned, never committed, generated fresh (don't reuse the local-dev `.env` from this repo):

```bash
POSTGRES_PASSWORD=<generate a real random value>
JWT_SECRET=<generate a real random value, e.g. openssl rand -hex 32>
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
RATE_LIMIT_MAX=60
RATE_LIMIT_WINDOW=60000
```

### 4. Add the nginx server block

Append to `/etc/nginx/sites-enabled/malto` (matching the existing `blink`/`app`/`monitor` blocks exactly, see that file for the pattern):

```nginx
server {
    listen 80;
    server_name decrity.malto.icu;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name decrity.malto.icu;

    ssl_certificate     /etc/nginx/ssl/malto-icu-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/malto-icu-origin.key;

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
    }
}
```

Then:

```bash
nginx -t && systemctl reload nginx
```

### 5. Add the Cloudflare DNS record

This is a Cloudflare account action, not something done from the VPS or this repo: add an `A` record, `decrity` -> `178.104.224.137`, proxied (orange cloud), matching how `blink`/`app`/`monitor` are already set up.

### 6. First deploy

```bash
cd /var/www/decrity
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps   # confirm all 6 services healthy
```

## Updating after a change

Nothing to sync. Once a change is merged to `main` and the GitHub Actions run finishes (check the Actions tab), on the VPS:

```bash
cd /var/www/decrity
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

This re-pulls whichever images changed and recreates only those containers.

## Not done yet

- Only `landing` has a public nginx route. `api`/`dashboard` stay internal until there's a real plan for exposing them (auth, rate limiting review, a real domain for the dashboard instead of the `VITE_DASHBOARD_API_URL` placeholder baked in at build time).
- Domain is `decrity.malto.icu` for now; move to a dedicated domain once one is bought, per the earlier handoff notes.
- No automated redeploy-on-push yet (the step above is manual); worth adding once the manual flow has been run a few times successfully.
