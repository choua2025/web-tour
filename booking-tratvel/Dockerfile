# syntax=docker/dockerfile:1

# ── Travel Booking API ──────────────────────────────────────────────
# Express + Sequelize + PostgreSQL. There is no build step for this project,
# so the only reason for two stages is to keep dev dependencies (nodemon)
# out of the image that actually ships.
#
# Migrations do NOT run here. They run as their own one-shot container
# (see docker-compose.yml's `migrate` service) so that starting several API
# replicas at once cannot race each other through the same schema change.

ARG NODE_VERSION=22

# ── deps ────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app

# Only the manifests land here, so this layer survives any source-only
# change and only busts when a dependency actually changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9001
# 0.0.0.0, not 127.0.0.1 — a container bound to loopback is unreachable from
# outside itself.
ENV HOST=0.0.0.0

# The base image ships neither curl nor wget, and HEALTHCHECK below needs one.
RUN apk add --no-cache curl

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY server.js ./
COPY src ./src

# node:alpine ships an unprivileged `node` user for exactly this — running
# the process as root would be a risk this app has no reason to take.
USER node

EXPOSE 9001

# Hits the database too (see src/routes/health.routes.js), so the container
# is not reported healthy while it can't actually serve a request yet.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
