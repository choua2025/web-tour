# Deploying

`deploy-production.yml` and `deploy-preview.yml` both roll onto a server over
SSH using [docker-compose.deploy.yml](docker-compose.deploy.yml) (pulls
pinned-digest images, never builds) and [remote-up.sh](remote-up.sh) (swaps
`.env`, pulls, brings the stack up with `--wait`, rolls back automatically if
the new release doesn't come up healthy).

Neither workflow can do anything until the server exists and the values
below are set. There is no default for any of this — a fresh repo has none
of it configured, which is why the first production deploy fails at
"Render .env" with something like `DB_PASSWORD is empty`.

## Where to set these

**Settings → Environments → `production`** (create it if it doesn't exist)
and **Settings → Environments → `preview`**, each with its own **Secrets**
and **Variables** tabs. An Environment — not repo-level secrets — is what
lets you require a reviewer to approve before anything touches production.

## Required on every environment that deploys (`production` and `preview`)

These four are unconditional — SSH won't even start without them:

| Secret | What it is |
|---|---|
| `DEPLOY_HOST` | The server's address (IP or hostname) |
| `DEPLOY_USER` | The SSH user to log in as |
| `DEPLOY_SSH_KEY` | A private key that user accepts, pasted whole (`-----BEGIN OPENSSH PRIVATE KEY-----` … ) |
| `DEPLOY_SSH_KNOWN_HOSTS` | The output of `ssh-keyscan -H <host>` run once from anywhere — pinned host keys, not `StrictHostKeyChecking=no` |

## `production` environment

| Kind | Name | Required? | Notes |
|---|---|---|---|
| secret | `DB_PASSWORD` | **yes** | Postgres password for the production database |
| secret | `JWT_SECRET` | **yes** | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| var | `PUBLIC_API_URL` | **yes** | The address browsers reach the API at, e.g. `https://api.example.com/api` |
| var | `FRONTEND_URL` | **yes** | Where Stripe returns the customer after checkout — the storefront's public URL |
| var | `PRODUCTION_URL` | recommended | Storefront's public URL — becomes the Environment's clickable URL and is smoke-tested after every deploy |
| var | `ADMIN_URL` | recommended | Admin console's public URL — smoke-tested if set |
| secret | `MAIL_USER` / `MAIL_PASS` | optional | Gmail needs an App Password, not the account password |
| secret | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | optional | Blank disables uploads |
| secret | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | optional | Live keys — never the preview/test ones |
| var | `DB_NAME` / `DB_USER` | optional | Default `booking_system` / `postgres` |
| var | `MAIL_HOST` / `MAIL_PORT` | optional | Default `smtp.gmail.com` / `587` |
| var | `API_PORT` / `ADMIN_PORT` / `STOREFRONT_PORT` | optional | Default `9001` / `3000` / `3001` |
| var | `DEPLOY_SSH_PORT` | optional | Default `22` |
| var | `DEPLOY_PATH` | optional | Default `/srv/travel/production` |
| var | `LOG_REQUESTS` | optional | Default `false` |

## `preview` environment (per-pull-request stacks)

| Kind | Name | Required? | Notes |
|---|---|---|---|
| secret | `PREVIEW_JWT_SECRET` | **yes** | Separate from production's — a preview is not a place to reuse the real secret |
| secret | `PREVIEW_DB_PASSWORD` | recommended | Falls back to `DB_PASSWORD` if unset, but a dedicated one keeps the throwaway preview database out of anything real |
| var | `PREVIEW_HOST` | optional | Falls back to `DEPLOY_HOST`. Set this instead if previews live on a different box than production |
| var | `PREVIEW_ROOT` | optional | Default `/srv/travel/previews` — a sibling of `DEPLOY_PATH`, never inside it |
| secret | `PREVIEW_MAIL_USER` / `PREVIEW_MAIL_PASS` | optional | |
| secret | `PREVIEW_CLOUDINARY_CLOUD_NAME` / `PREVIEW_CLOUDINARY_API_KEY` / `PREVIEW_CLOUDINARY_API_SECRET` | optional | |
| secret | `PREVIEW_STRIPE_SECRET_KEY` | optional | Test-mode key, or leave blank. Never a live key — a preview is where broken checkout code is expected to run |

Preview never needs `PREVIEW_STRIPE_WEBHOOK_SECRET` — the workflow leaves it
blank on purpose, so the webhook trusts the request body unverified, which
is fine because nothing real points Stripe at a preview.

## The server itself

Something has to already be listening at `DEPLOY_HOST` with Docker and the
Compose plugin installed, and `DEPLOY_USER` has to be able to `docker` and
`docker compose` without `sudo` (add them to the `docker` group). Nothing in
CI provisions the box — these workflows only ever push images and SSH in to
run `remote-up.sh`.

## First deploy checklist

1. Server up, Docker installed, `DEPLOY_USER` in the `docker` group.
2. `ssh-keyscan -H <host>` → `DEPLOY_SSH_KNOWN_HOSTS`.
3. A key pair whose private half is `DEPLOY_SSH_KEY` and whose public half
   is in `DEPLOY_USER`'s `~/.ssh/authorized_keys` on the server.
4. Every **required** row above set on the `production` environment.
5. Push to `main` (or re-run `Deploy production` from the Actions tab) —
   it fires automatically once `API`, `Storefront`, and `Admin` have all
   published an image.
