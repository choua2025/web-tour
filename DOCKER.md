# Docker

Three projects, three images, one compose file.

| Project | Image | Port | Dockerfile |
|---|---|---|---|
| `booking-tratvel` (API) | `travel-booking/api` | 9001 | [booking-tratvel/Dockerfile](booking-tratvel/Dockerfile) |
| `travel-plan-admin` (admin console) | `travel-booking/admin` | 3000 | [travel-plan-admin/Dockerfile](travel-plan-admin/Dockerfile) |
| `booking-frontend` (storefront) | `travel-booking/storefront` | 3001 | [booking-frontend/Dockerfile](booking-frontend/Dockerfile) |

Each Dockerfile stands alone — build any project without the other two, and
without this compose file.

## Four compose files

Like the Dockerfiles, compose is split per project. Each project's file runs
that project on its own; the one at the root runs all three together.

| File | Starts | Use it when |
|---|---|---|
| [docker-compose.yml](docker-compose.yml) | db + migrate + api + admin + storefront | You want the whole system |
| [booking-tratvel/docker-compose.yml](booking-tratvel/docker-compose.yml) | db + migrate + api | Working on the API — it brings its own database |
| [travel-plan-admin/docker-compose.yml](travel-plan-admin/docker-compose.yml) | admin | Working on the console against an API that already runs |
| [booking-frontend/docker-compose.yml](booking-frontend/docker-compose.yml) | storefront | Working on the storefront against an API that already runs |

Each has its own `.env.docker.example` beside it, listing only the variables
that file actually reads.

**Do not run the root file and a project file at the same time** — they
publish the same ports, and each keeps its own database volume, so they
would not even share data.

## Run everything

```bash
cp .env.docker.example .env      # then fill in DB_PASSWORD and JWT_SECRET
docker compose up -d --build
```

## Run one project

```bash
cd booking-tratvel && cp .env.docker.example .env && docker compose up -d --build
```

Same three lines in `travel-plan-admin` or `booking-frontend`. The two front
ends do not start an API — start the API's compose file first, or point
`PUBLIC_API_URL` at any deployment you can reach.

Generate a JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Then: storefront on <http://localhost:3001>, admin on <http://localhost:3000>,
API on <http://localhost:9001/api/health>.

```bash
docker compose logs -f api       # follow one service
docker compose ps                # health of each
docker compose down              # stop, keep the database
docker compose down -v           # stop and DELETE the database volume
```

## Build one project on its own

```bash
docker build -t travel-booking/api ./booking-tratvel
docker build -t travel-booking/admin ./travel-plan-admin
docker build -t travel-booking/storefront ./booking-frontend
```

## Things worth knowing

**Migrations run in their own container, not at API boot.** The `migrate`
service applies what is pending, exits, and only then does the API start.
Two API replicas booting together would otherwise race through the same
migrations. It reuses the API image rather than declaring its own `build:` —
two services building the same tag makes BuildKit collide on the export.

Re-running compose is safe: `migrate:up` applies only what is pending. On a
database whose tables predate migration tracking, run this **once** first:

```bash
docker compose run --rm migrate npm run migrate:baseline
```

**The API address the front ends use is set at container start, not at build
time.** `PUBLIC_API_URL` in `.env` reaches the browser through
`NUXT_PUBLIC_API_BASE` (storefront) and `NUXT_PUBLIC_API_URL` (admin). So the
same image goes from staging to production untouched. It runs in the
visitor's browser, so it must be an address they can resolve —
`http://api:9001` works only inside the compose network.

**The storefront needs a second API address.** Its confirmation page renders
the receipt during SSR, which happens inside the container — where `localhost`
is the storefront itself, not the API. So there are two variables, and they
are not interchangeable:

| | Read by | Value |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | the visitor's browser | an address *they* can resolve |
| `NUXT_API_BASE_SERVER` | the storefront container | `http://api:9001/api` on the compose network, or `http://host.docker.internal:9001/api` when running standalone |

Leave `NUXT_API_BASE_SERVER` unset outside Docker and it falls back to the
public one, which is correct when both are the same host. Get it wrong and
nothing errors — the receipt just renders empty. The admin console has no
equivalent: it fetches everything from `onMounted`, so nothing there calls
the API during SSR.

**Nothing sensitive is baked into an image.** Every secret arrives through
the environment. `.env` is gitignored; `.env.docker.example` is the template.

**Line endings matter.** Docker reads a backslash followed by CRLF as a
literal backslash, so a Dockerfile checked out with Windows line endings
fails with `Unknown instruction: &&`. [.gitattributes](.gitattributes) pins
these files to LF.

**`npm ci` needs a lockfile that matches `package.json`.** It fails
deliberately when they drift — that is the usual reason a Docker build breaks
while local `npm run dev` still works. Regenerate the lockfile inside Linux,
not on Windows, so platform-specific optional dependencies resolve the same
way the image will:

```bash
docker run --rm -v "$PWD:/app" -w /app node:22-alpine npm install --package-lock-only
```

## CI/CD

One workflow per project, each with a path filter, so editing the storefront
does not rebuild the API.

| Workflow | Runs when | Does |
|---|---|---|
| [api.yml](.github/workflows/api.yml) | `booking-tratvel/**` | Migrates a real Postgres, rolls all the way back and re-applies, boots the server and checks `/api/health`, then pushes the image |
| [admin.yml](.github/workflows/admin.yml) | `travel-plan-admin/**` | `nuxt build`, then pushes the image |
| [storefront.yml](.github/workflows/storefront.yml) | `booking-frontend/**` | `nuxt build`, then pushes the image |
| [stack.yml](.github/workflows/stack.yml) | any `docker-compose.yml` | Brings the whole stack up and checks every service answers |
| [deploy-preview.yml](.github/workflows/deploy-preview.yml) | a pull request touching app code | Builds `pr-<N>` images, deploys a full standalone stack, comments the URLs on the PR, tears it down on close |
| [deploy-production.yml](.github/workflows/deploy-production.yml) | API/Storefront/Admin succeeding on `main` | Pins `latest` to digests, rolls them onto the server, rolls back automatically if the new release doesn't come up healthy |

The API workflow builds its Postgres from the migration files and nothing
else, which is what makes two of its steps worth the time:

- **`npm run check:schema`** compares every model column against the schema
  the migrations actually built. The two drifted once: `Booking` declared
  `number_of_people` and no migration ever created it. Nobody noticed,
  because the development database predated migrations — it had been built
  by `sequelize.sync()`, so the column was there. A database built from the
  migration files alone was missing it, and every booking insert failed. A
  fresh deployment could not have taken a single booking.
- **Rolling every migration back and re-applying it** catches the other
  half: a migration whose `down()` does not work is one you cannot roll back
  in production, and that only shows up at the moment you need it.

Pull requests get the `verify`/build job only — publishing from a PR would
let a fork overwrite your images. Images go to GHCR as
`ghcr.io/<owner>/travel-booking-{api,admin,storefront}`, tagged `latest` on
the default branch plus the full commit SHA. Authentication uses the built-in
`GITHUB_TOKEN`; there is nothing to configure in the workflow files
themselves — but see the next section, which is a one-time repo setting.

### First-time GHCR push: one required repo setting

The very first time any build workflow tries to push an image, GHCR can
refuse it with:

```
ERROR: failed to push ghcr.io/<owner>/travel-booking-api:main: denied: permission_denied: write_package
```

Every `image` job already declares `permissions: packages: write`, but that
block can only *restrict* what the repo already allows — it cannot escalate
past the repository's own default. Fix it once, in the GitHub UI (not in any
file here):

**Settings → Actions → General → Workflow permissions → "Read and write
permissions" → Save.**

If a push still fails after that, the package likely already exists under a
different owner/link — check **your profile → Packages → (the package) →
Package settings → Manage Actions access** and grant this repo write access.

### Deploying beyond CI

`deploy-preview.yml` and `deploy-production.yml` both roll onto a server over
SSH, using [deploy/docker-compose.deploy.yml](deploy/docker-compose.deploy.yml)
(pulls pinned-digest images, never builds) and
[deploy/remote-up.sh](deploy/remote-up.sh) (swaps `.env`, pulls, brings the
stack up with `--wait`, and rolls back to the previous `.env` automatically
if the new release doesn't come up healthy). Both need, at minimum,
`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_SSH_KNOWN_HOSTS`,
`DB_PASSWORD`, and `JWT_SECRET` set as repository or environment secrets —
production deploys are gated behind a `production` GitHub Environment so
they don't run unattended on every green build.
