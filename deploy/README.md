# Deploying

`deploy-production.yml` and `deploy-preview.yml` deploy to a **self-hosted
GitHub Actions runner** — the user's own WSL Ubuntu machine, labeled
`[self-hosted, linux, wsl-ubuntu]`. No inbound access, SSH key, or password
is involved: the runner reaches out to GitHub for the job and does
everything in its own shell, which already IS the deploy target. Both
workflows use [docker-compose.deploy.yml](docker-compose.deploy.yml) (pulls
pinned-digest images, never builds) and [remote-up.sh](remote-up.sh) (swaps
`.env`, pulls, brings the stack up with `--wait`, rolls back automatically
if the new release doesn't come up healthy).

Neither workflow can do anything until the runner is online and the values
below are set. There is no default for any of this — a fresh repo has none
of it configured, which is why the first production deploy fails at
"Render .env" with something like `DB_PASSWORD is empty`.

## The runner

Register a self-hosted runner (Settings → Actions → Runners → New
self-hosted runner) with at least the labels `self-hosted`, `linux`, and
`wsl-ubuntu` — both workflows target exactly that combination. It needs,
installed and on `PATH`:

- **Docker** + the **buildx** plugin, and whichever user runs the runner
  service must be able to run `docker` / `docker compose` without `sudo`
  (add them to the `docker` group).
- **curl** — every smoke test uses it.
- **gh** (the GitHub CLI) — used to comment PR preview URLs and to delete
  `pr-N` image tags on teardown. Not installed by default on a self-hosted
  runner the way it is on `ubuntu-latest`.

Nothing in CI provisions the machine itself — these workflows only ever
push images and run `remote-up.sh` in the runner's own shell.

## Where to set secrets and variables

**Settings → Environments → `production`** (create it if it doesn't exist)
and **Settings → Environments → `preview`**, each with its own **Secrets**
and **Variables** tabs. An Environment — not repo-level secrets — is what
lets you require a reviewer to approve before anything touches production.

## `production` environment

| Kind | Name | Required? | Notes |
|---|---|---|---|
| secret | `DB_PASSWORD` | **yes** | Postgres password for the production database |
| secret | `JWT_SECRET` | **yes** | `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| var | `PUBLIC_API_URL` | **yes** | The address browsers reach the API at — `http://localhost:9001/api` works from Windows against a WSL2 runner; use a LAN IP or domain to reach it from elsewhere |
| var | `a` | **yes** | Where Stripe returns the customer after checkout — the storefront's public URL |
| var | `PRODUCTION_URL` | recommended | Storefront's public URL — becomes the Environment's clickable URL and is smoke-tested after every deploy |
| var | `ADMIN_URL` | recommended | Admin console's public URL — smoke-tested if set |
| secret | `MAIL_USER` / `MAIL_PASS` | optional | Gmail needs an App Password, not the account password |
| secret | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | optional | Blank disables uploads |
| secret | `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | optional | Live keys — never the preview/test ones |
| var | `DB_NAME` / `DB_USER` | optional | Default `booking_system` / `postgres` |
| var | `MAIL_HOST` / `MAIL_PORT` | optional | Default `smtp.gmail.com` / `587` |
| var | `API_PORT` / `ADMIN_PORT` / `STOREFRONT_PORT` | optional | Default `9001` / `3000` / `3001` |
| var | `DEPLOY_PATH` | optional | Default `$HOME/travel/production` on the runner |
| var | `LOG_REQUESTS` | optional | Default `false` |

## `preview` environment (per-pull-request stacks)

| Kind | Name | Required? | Notes |
|---|---|---|---|
| secret | `PREVIEW_JWT_SECRET` | **yes** | Separate from production's — a preview is not a place to reuse the real secret |
| var | `PREVIEW_HOST` | **yes** | The address used to build each PR's clickable URLs. For the runner's own WSL2 machine, `localhost` usually works from Windows (WSL2's automatic port forwarding); use a LAN IP to reach it from another device |
| secret | `PREVIEW_DB_PASSWORD` | recommended | Falls back to `DB_PASSWORD` if unset, but a dedicated one keeps the throwaway preview database out of anything real |
| var | `PREVIEW_ROOT` | optional | Default `$HOME/travel/previews` on the runner — a sibling of `DEPLOY_PATH`, never inside it |
| secret | `PREVIEW_MAIL_USER` / `PREVIEW_MAIL_PASS` | optional | |
| secret | `PREVIEW_CLOUDINARY_CLOUD_NAME` / `PREVIEW_CLOUDINARY_API_KEY` / `PREVIEW_CLOUDINARY_API_SECRET` | optional | |
| secret | `PREVIEW_STRIPE_SECRET_KEY` | optional | Test-mode key, or leave blank. Never a live key — a preview is where broken checkout code is expected to run |

Preview never needs `PREVIEW_STRIPE_WEBHOOK_SECRET` — the workflow leaves it
blank on purpose, so the webhook trusts the request body unverified, which
is fine because nothing real points Stripe at a preview.

Every PR opened at once lands on the same runner, in its own directory
under `PREVIEW_ROOT` with its own three ports — `deploy-preview.yml` derives
the ports from the PR number, so nothing has to be allocated by hand.

## First deploy checklist

1. Self-hosted runner registered, online, labeled `self-hosted`/`linux`/
   `wsl-ubuntu`, with Docker + buildx + curl + `gh` installed and the
   runner's user in the `docker` group.
2. Every **required** row above set on the `production` environment.
3. Push to `main` (or re-run `Deploy production` from the Actions tab) —
   it fires automatically once `API`, `Storefront`, and `Admin` have all
   published an image.
