#!/usr/bin/env bash
# ── The half that runs ON THE DEPLOY TARGET ─────────────────────────
# Placed and executed by the deploy workflows — copied there directly by a
# self-hosted runner's own job, or (if you point these workflows at a
# remote host again some day) uploaded over SSH. Either way this script does
# not care how it got there or how it's invoked; it lives in the repo rather
# than inline in the YAML so it can also be read, reviewed, and run by hand:
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
set -euo pipefail

umask 077

compose() {
    docker compose --env-file .env -f docker-compose.deploy.yml "$@"
}

[ -f .env.incoming ] || { echo "no .env.incoming here — nothing to deploy" >&2; exit 1; }

# Images are private to the repository unless the packages were made public,
# so the server needs its own registry login. GHCR_TOKEN arrives through the
# environment and is never written to disk here.
if [ -n "${GHCR_TOKEN:-}" ]; then
    echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USER:?GHCR_USER not set}" --password-stdin
fi

# Keep the last-good .env before overwriting it. This file IS the rollback:
# it names the exact image digests that were serving traffic a minute ago.
if [ -f .env ]; then
    cp .env .env.previous
fi
mv .env.incoming .env
chmod 600 .env
[ -f .env.previous ] && chmod 600 .env.previous

compose pull --quiet

# `--wait` blocks until every service reports healthy and exits non-zero if
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
    compose pull --quiet
    if compose up -d --wait --remove-orphans; then
        echo "rolled back to the previous release" >&2
    else
        # Worth shouting about: the release that was working ten minutes ago
        # is now also failing, so the fault is probably the host, not the code.
        echo "ROLLBACK ALSO FAILED — the stack is down, look at the host" >&2
    fi
else
    echo "no previous release to roll back to (this was the first deploy)" >&2
fi

exit 1
