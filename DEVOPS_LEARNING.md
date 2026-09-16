# DevOps learning roadmap — using this repo as the syllabus

Every concept below already exists as working code in this repository, not
a toy example. Read the file, then go make a small change and watch the
pipeline react — that's the actual exercise. Where a section names a real
failure mode, that failure has already happened in this project once; it's
worth deliberately reproducing it in a throwaway branch to see the exact
error, then fixing it, rather than only reading about it.

Rough order: each module assumes the ones before it. Skip ahead if a
module already feels familiar.

---

## 1. Containerization

**Read:** [booking-tratvel/Dockerfile](booking-tratvel/Dockerfile),
[travel-plan-admin/Dockerfile](travel-plan-admin/Dockerfile)

- **Multi-stage builds** — a `deps`/`build` stage with the full toolchain,
  a `runtime` stage that copies out only what's needed to run. Compare the
  final image size building single-stage vs. multi-stage to see why this
  matters.
- **Non-root user** — `USER node` at the end of the API's Dockerfile.
  Try removing it, exec into the container, run `whoami`.
- **`HEALTHCHECK`** — the API's checks `/api/health`, which itself checks
  the database connection, not just "is the process running."
- **Layer caching** — why `COPY package.json package-lock.json ./` happens
  *before* `COPY . .`. Change one line of application code and rebuild;
  watch which layers say `CACHED` and which rebuild.

**Try:** Build the image locally (`docker build -t test ./booking-tratvel`),
then `docker run --rm -it test sh` and explore what's actually inside —
notice `node_modules` from the `deps` stage is there but the Dockerfile
itself and `.git` are not.

## 2. Local orchestration

**Read:** [docker-compose.yml](docker-compose.yml)

- **`depends_on` + `condition: service_healthy`** — why `api` waits for
  `db`'s healthcheck, not just for the container to start.
- **The one-shot job pattern** — `migrate` runs once, exits, and only then
  does `api` start (`condition: service_completed_successfully`). Read the
  comment explaining *why*: parallel replicas racing through the same
  migration.
- **Environment injection at container start, not build time** — trace
  `PUBLIC_API_URL` through `docker-compose.yml` into the storefront and
  admin containers. This is what lets one built image move from a preview
  environment to production unchanged.

**Try:** `docker compose up -d --build`, then `docker compose logs -f
migrate` in one terminal while you `docker compose restart api` in
another — watch `api` refuse to start until `migrate` finishes.

## 3. CI — build, test, publish

**Read:** [.github/workflows/api.yml](.github/workflows/api.yml)

- **`needs:`** — three jobs (`build` → `test` → `publish`), each gated on
  the one before it succeeding. `publish` never runs if `test` fails, so a
  broken commit can never reach the registry.
- **Testing against a real dependency, not a mock** — the `test` job spins
  up an actual `postgres:16-alpine` service container and runs real
  migrations against it, rather than stubbing the database.
- **Path filters** — `api.yml` only runs on changes under
  `booking-tratvel/**`. Compare with `admin.yml`/`storefront.yml`, each
  scoped to their own folder, so an unrelated change doesn't rebuild
  everything.
- **Two categories of failure this catches**, each with a real precedent
  in this project's history: a **migration whose `down()` doesn't work**
  (caught by "Migrations roll back and re-apply"), and a **model that
  drifted from its migrations** (`check:schema` — this repo's `Booking`
  model once declared a column no migration ever created; a database built
  from the migration files alone was missing it, and every insert failed).

**Try:** Add a column to a model without writing a migration for it, push
to a branch, open a PR, and watch `check:schema` catch it before it ever
reaches a review.

## 4. CD — publish, deploy, roll back

**Read:** [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml),
[deploy/remote-up.sh](deploy/remote-up.sh),
[deploy/docker-compose.deploy.yml](deploy/docker-compose.deploy.yml)

- **Digest pinning** — `latest` is resolved to an immutable
  `sha256:...` digest *at deploy time*, and that digest is what actually
  gets written into `.env` and deployed. `latest` can move; a digest
  can't — that's what makes a specific release nameable and rollback-able.
- **Automatic rollback** — `remote-up.sh` keeps `.env.previous`. If the new
  release doesn't come up healthy, it's restored and redeployed
  automatically, without a human in the loop.
- **GitHub Environments as a deploy gate** — `environment: { name:
  production }` is what lets you require a reviewer, and what makes
  environment-scoped secrets/variables only visible to jobs targeting that
  environment.
- **Smoke tests after deploy, not just a healthy container** — the last
  step hits the real public URLs. A container can be "healthy" while
  serving a blank page or unable to reach its database from outside itself.

**Try:** Manually trigger `Deploy production` with `workflow_dispatch`
(Actions tab → Run workflow), then read the Summary it posts — it names
the exact digest of every image it deployed.

## 5. Preview environments

**Read:** [.github/workflows/deploy-preview.yml](.github/workflows/deploy-preview.yml)

- **Ephemeral, per-PR infrastructure** — one full stack (its own database,
  its own ports) per open pull request, destroyed automatically when the
  PR closes.
- **Deterministic port allocation without shared state** — ports are
  derived from the PR number (`21000 + (PR % 300) * 3`) rather than
  allocated from a registry, so two runs never need to coordinate.
- **Disposable image tags** — `pr-<N>` tags, deleted from the registry on
  teardown alongside the stack itself.

**Try:** Open a PR that touches `booking-tratvel/**`, watch the comment
this workflow posts with live URLs, then close the PR and confirm the
stack is actually gone (`docker ps` on the runner should show nothing left
for that PR).

## 6. Infrastructure — the self-hosted runner

**Read:** [deploy/README.md](deploy/README.md)

- **What a self-hosted runner actually is** — a process you run, that
  polls GitHub for work and executes it locally. No inbound network access
  to your machine is ever required — the connection is always outbound,
  from the runner to GitHub.
- **Label matching** — `runs-on: [self-hosted, linux, wsl-ubuntu]`
  requires *all three* labels on a runner before GitHub will hand it a
  job. A missing label means the job queues forever with no error message
  — worth knowing what that looks like once, since it gives no obvious
  clue on its own.
- **The runner is a real machine with real state** — unlike a GitHub-
  hosted runner (fresh VM every job), a self-hosted runner keeps its own
  Docker image cache, its own filesystem, its own network stack. That's
  also why a Docker credential helper misconfigured for one context
  (`docker-credential-desktop.exe` from a Windows-side Docker Desktop
  config leaking into the Linux side) can break every job until it's
  cleaned up.

**Try:** Stop the runner service, trigger a workflow that targets it, and
watch the job sit "Queued" indefinitely. Start the runner back up and
watch it get picked up within seconds. That gap between "queued forever"
and "picked up in seconds" is the single most useful signal for diagnosing
a self-hosted runner problem.

## 7. Secrets and configuration

**Read:** [deploy/README.md](deploy/README.md) (the environment tables),
any `env:` block in a workflow file

- **Secrets vs. Variables** — GitHub Actions has two separate stores.
  Secrets are masked in logs and never displayed again once saved;
  Variables are plain text, visible, meant for non-sensitive config like
  URLs and ports. A password that ends up in Variables by mistake is a
  real, silent security bug — it won't error, it'll just leak into every
  log line that echoes it.
- **Repository vs. Environment scope** — a Variable/Secret set on the
  `production` Environment is only visible to jobs that declare
  `environment: production`. This is what makes per-environment config
  (a `preview` database password different from the `production` one)
  possible without one workflow accidentally reading the other's secrets.
- **Nothing sensitive baked into an image** — every credential this
  project uses arrives through the environment at container start, never
  copied into a Dockerfile or committed to the repo. Check any Dockerfile
  here: there's no `ENV DB_PASSWORD=...` anywhere, on purpose.

## 8. Observability basics

**Read:** [booking-tratvel/src/routes/health.routes.js](booking-tratvel/src/routes/health.routes.js)

- **A health check that means something** — `/api/health` doesn't just
  return `200 OK`; it calls `sequelize.authenticate()` and reports pending
  migrations. A process that's "running" but can't reach its database is
  not healthy, and a naive healthcheck would say otherwise.
- **Why the exact response shape matters** — CI, the stack smoke test, and
  both deploy workflows all `grep` for the literal substring
  `"database":"connected"`. This is a real contract: change that string
  and multiple, unrelated-looking pipelines break simultaneously. It's a
  concrete example of why an API response shape is often a load-bearing
  interface, not just cosmetic text.

## 9. Database change management

**Read:** [booking-tratvel/src/scripts/migrate.js](booking-tratvel/src/scripts/migrate.js),
the files under `booking-tratvel/src/migrations/`

- **Migrations as ordered, numbered, reviewable code** — not a hand-run
  SQL script, not `sequelize.sync()` (which this project deliberately
  moved away from — read migration `15-add-booking-people.js`'s own
  comment for exactly why `sync()` is dangerous in a team setting).
- **Every migration has an `up()` and a `down()`** — and CI actually
  exercises `down()`, not just `up()`. A migration you can't reverse is
  one you discover you can't reverse at the worst possible time: mid-
  incident, in production.
- **A tracking table, not file-presence, decides what's "applied"** —
  `schema_migrations` records what ran. This is why re-running `migrate:up`
  against an already-migrated database is safe and a no-op.

## 10. Incident response mindset

This is less a file to read and more a habit to notice you're already
practicing. The real failures already hit in this project — a stray
character silently breaking a workflow's YAML, a registry permission
denial, a Postgres major-version mismatch, a stale credential helper — all
shared a pattern worth naming explicitly:

1. **Reproduce with evidence, not assumption.** Every fix in this
   project's history started with a command that proved the cause (a
   digest comparison, a `PG_VERSION` file read, a YAML parse check) before
   any file was edited.
2. **Fix the cause, not the symptom.** Adding `--build` to a pull-only
   deploy compose file would have been a no-op that felt like a fix.
   Tracing *why* the image looked stale (it wasn't) was the actual work.
3. **Verify the fix before declaring it fixed.** Every workflow change in
   this repo's history was validated (YAML parse, a local reproduction, or
   both) before being pushed — not just read over and assumed correct.

---

## What's genuinely missing here — good next projects

This repo does **not** yet cover, and each is a reasonable next thing to
add and learn from directly:

- **Monitoring/alerting** — nothing currently notices if `travel-prod` goes
  down at 3am. A simple next step: a scheduled workflow that curls
  `/api/health` every few minutes and posts somewhere (Slack, email) on
  failure.
- **Structured logging / log aggregation** — `LOG_REQUESTS` gives you raw
  container logs; nothing ships them anywhere searchable.
- **Automated database backups** — flagged once already in this project's
  history and never followed up on. `travel-prod`'s data currently lives
  in exactly one place with no copy.
- **Infrastructure as code for the runner itself** — the self-hosted
  runner was set up by hand, following a checklist. Scripting that setup
  (or containerizing the runner) is a natural follow-on.
- **Secrets rotation** — nothing here rotates `JWT_SECRET` or database
  passwords; they're set once and left.
- **A staging environment distinct from preview** — preview stacks are
  disposable and per-PR; there's no long-lived pre-production environment
  that mirrors production's data shape.

Pick one, and the same investigate-fix-verify loop used everywhere in this
document is the way to build it.
