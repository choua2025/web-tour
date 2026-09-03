# syntax=docker/dockerfile:1

# ── TravelPlus storefront (Nuxt 3, SSR) ─────────────────────────────
# `nuxt build` produces a self-contained Nitro server in .output. Nothing
# else from the source tree is needed at runtime, so the final image copies
# only that — no node_modules, no app/, no source.

ARG NODE_VERSION=22

# ── build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

# Dev dependencies ARE needed here: nuxt itself is one of them.
# `postinstall` runs `nuxt prepare`, which needs the config present, so the
# manifests alone are not enough — hence --ignore-scripts, then prepare runs
# as part of the build below.
RUN npm ci --ignore-scripts

COPY . .

# nuxt prepare generates .nuxt/types; build then emits .output.
RUN npx nuxt prepare && npm run build

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Nitro reads these. 3001 keeps the storefront off 3000, which the admin uses.
ENV PORT=3001
ENV HOST=0.0.0.0
# runtimeConfig.public.apiBase is overridable at runtime, so one image can be
# promoted from staging to production without a rebuild.
ENV NUXT_PUBLIC_API_BASE=http://localhost:9001/api

RUN apk add --no-cache curl

COPY --from=build /app/.output ./.output

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
