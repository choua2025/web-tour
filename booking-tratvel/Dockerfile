# syntax=docker/dockerfile:1

# ── Travel Booking API ──────────────────────────────────────────────
# Express + Sequelize + PostgreSQL. No build step, so the only reason for
# two stages is to leave dev dependencies (nodemon) out of the image that
# actually ships.

ARG NODE_VERSION=22

# ── deps ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

# Only the manifests, so this layer is reused whenever the source changes
# but the dependency list has not.
COPY package.json package-lock.json ./

# `npm ci` installs exactly the lockfile. --omit=dev drops nodemon.
RUN npm ci --omit=dev

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# The server reads PORT; HOST already defaults to 0.0.0.0, which is what a
# container needs — binding 127.0.0.1 would make it unreachable from outside.
ENV PORT=9001
ENV HOST=0.0.0.0

# curl for the HEALTHCHECK below; the base image has neither curl nor wget.
RUN apk add --no-cache curl

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY src ./src

# node:alpine ships an unprivileged `node` user. Running as root inside a
# container is an unnecessary risk when nothing here needs it.
USER node

EXPOSE 9001

# Checks the database connection too, so the container is not reported
# healthy while Postgres is still starting.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

# Migrations are NOT run here on purpose. Several replicas starting at once
# would race each other; compose and CI run them as a separate one-shot step.
CMD ["node", "server.js"]
