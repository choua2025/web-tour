# syntax=docker/dockerfile:1

# ── Storefront (Nuxt 3, SSR) ────────────────────────────────────────
# `nuxt build` produces a self-contained Nitro server under .output — the
# runtime stage needs only that, never node_modules or the source tree.

ARG NODE_VERSION=22

# ── build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

# --ignore-scripts: postinstall runs `nuxt prepare`, which needs the config
# file that hasn't been copied in yet. It runs explicitly below instead.
RUN npm ci --ignore-scripts

COPY . .

RUN npx nuxt prepare && npm run build

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0
# Nitro reads runtimeConfig.public.apiBase from this at container start, not
# at build time — so the same image runs unmodified in every environment.
ENV NUXT_PUBLIC_API_BASE=http://localhost:9001/api

RUN apk add --no-cache curl

COPY --from=build /app/.output ./.output

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
