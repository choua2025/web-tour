#!/usr/bin/env bash
# ── The half that runs ON THE SERVER ────────────────────────────────
# Uploaded over SSH and executed by the deploy workflows. It lives in the
# repo rather than inline in the YAML so it can be read, reviewed, and run
# by hand:
#
#   cd ~/travel/production && ./remote-up.sh
#
# Expects, in the current directory:
#   docker-compose.deploy.yml
#   .env.incoming    the release to roll out
#   .env             the release currently running, if any
#
# On success .env is the new release and .env.previous is the old one.
# On failure the old release is restored and the script exits non-zero.
#
# Order matters, and each step is placed so a failure leaves the server in a
# state the NEXT run can still reason about:
#
#   1. pull the new images        (using .env.incoming — .env is untouched)
#   2. back up the database       (before any migration can touch it)
#   3. swap .env                  (.env.previous now names the release that ran)
#   4. up --wait, rolling back if it never turns healthy
#
# Swapping .env before pulling would let a failed pull (registry down, DNS
# hiccup) leave .env naming a release that never ran; the next deploy would
# then copy that into .env.previous and the rollback target would be wrong.
set -euo pipefail

umask 077

# The images CI builds and pins by digest. Postgres is deliberately absent:
# `pull` with no service names would fetch a newer patch of the `16-alpine`
# tag too, and the following `up` would then recreate the database container
# as a side effect of deploying application code. To upgrade Postgres on
# purpose, run `docker compose ... pull db` yourself.
APP_SERVICES="migrate api admin storefront"

# How many pre-deploy dumps to keep.
KEEP_BACKUPS="${KEEP_BACKUPS:-10}"

compose() {
    docker compose --env-file .env -f docker-compose.deploy.yml "$@"
}

[ -f .env.incoming ] || { echo "no .env.incoming here — nothing to deploy" >&2; exit 1; }

# Images are private to the repository unless the packages were made public,
# so the server needs its own registry login. GHCR_TOKEN arrives through the
# environment; `docker login` stores it in ~/.docker/config.json, but it is
# the workflow's GITHUB_TOKEN and expires when the job ends.
if [ -n "${GHCR_TOKEN:-}" ]; then
    echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER not set}" --password-stdin
fi

# 1. Pull first, against the incoming env file, so .env still describes the
#    release that is actually running if this fails.
# shellcheck disable=SC2086  # APP_SERVICES is a deliberate word list
docker compose --env-file .env.incoming -f docker-compose.deploy.yml pull --quiet $APP_SERVICES

# 2. A migration runs on every deploy and Postgres lives in one volume on
#    one machine — take a dump while the old release is still serving. On the
#    first deploy there is no database yet, so there is nothing to dump.
#    Set SKIP_BACKUP=1 to deploy anyway when the dump itself is the problem.
backup_database() {
    [ "${SKIP_BACKUP:-0}" = "1" ] && { echo "SKIP_BACKUP=1 — not backing up" >&2; return 0; }
    [ -f .env ] || return 0

    if ! compose ps --status running --services 2>/dev/null | grep -qx db; then
        echo "database is not running — skipping the pre-deploy backup" >&2
        return 0
    fi

    mkdir -p backups
    local file
    file="backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql.gz"

    # POSTGRES_USER / POSTGRES_DB already exist inside the db container, so
    # no credentials have to be read out of .env (which may hold characters
    # a shell would mangle).
    if compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$file"; then
        echo "database backed up to $file ($(du -h "$file" | cut -f1))"
    else
        rm -f "$file"
        echo "the pre-deploy database backup FAILED — refusing to migrate without one." >&2
        echo "Fix it, or re-run with SKIP_BACKUP=1 to deploy without a backup." >&2
        exit 1
    fi

    # shellcheck disable=SC2012  # names are ours, timestamped, no odd characters
    ls -1t backups/pre-deploy-*.sql.gz 2>/dev/null | tail -n +"$((KEEP_BACKUPS + 1))" | xargs -r rm -f --
}
backup_database

# 3. Keep the last-good .env before overwriting it. This file IS the
#    rollback: it names the exact image digests that were serving traffic a
#    minute ago.
if [ -f .env ]; then
    cp .env .env.previous
fi
mv .env.incoming .env
chmod 600 .env
if [ -f .env.previous ]; then
    chmod 600 .env.previous
fi

# 4. `--wait` blocks until every service reports healthy and exits non-zero if
# one never does — so a container that starts and immediately crashes fails
# the deploy instead of quietly passing it. All three images declare a
# HEALTHCHECK, and the API's checks its database connection too.
if compose up -d --wait --remove-orphans; then
    echo "rolled out"
    exit 0
fi

echo "the new release did not come up healthy — rolling back" >&2
compose logs --no-color --tail 80 || true

if [ -f .env.previous ]; then
    cp .env.previous .env
    # Best effort: the previous images are pinned by digest and normally still
    # in the local cache, so a registry outage must not stop the rollback.
    # shellcheck disable=SC2086
    compose pull --quiet $APP_SERVICES || echo "could not pull the previous images — using the local copies" >&2
    if compose up -d --wait --remove-orphans; then
        echo "rolled back to the previous release" >&2
    else
        # Worth shouting about: the release that was working ten minutes ago
        # is now also failing, so the fault is probably the host, not the code.
        echo "ROLLBACK ALSO FAILED — the stack is down, look at the host" >&2
    fi
    echo "note: migrations the new release already applied are NOT undone; the" >&2
    echo "previous release is now running against that schema." >&2
else
    echo "no previous release to roll back to (this was the first deploy)" >&2
fi

exit 1
