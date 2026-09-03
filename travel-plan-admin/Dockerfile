# syntax=docker/dockerfile:1

# ── TravelAdmin console (Nuxt 4, SSR) ───────────────────────────────
# `nuxt build` produces a self-contained Nitro server in .output. Nothing
# else from the source tree is needed at runtime, so the final image copies
# only that — no node_modules, no app/, no source.

ARG NODE_VERSION=22

# ── build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

# Dev dependencies ARE needed here: nuxt itself is one of them.
# --ignore-scripts because this project's postinstall also runs
# scripts/strip-dangling-sourcemaps.mjs, which needs both the source tree and
# node_modules/lucide-vue-next in place. Both scripts run after COPY instead.
RUN npm ci --ignore-scripts

COPY . .

# strip-dangling-sourcemaps removes the ~500 sourceMappingURL comments that
# lucide-vue-next points at files it does not ship; without it the build logs
# an ENOENT per missing map.
RUN npx nuxt prepare \
    && node scripts/strip-dangling-sourcemaps.mjs \
    && npm run build

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Nitro reads these. 3001 keeps the storefront off 3000, which the admin uses.
ENV PORT=3000
ENV HOST=0.0.0.0
# runtimeConfig.public.apiUrl is overridable at runtime, so one image can be
# promoted from staging to production without a rebuild.
ENV NUXT_PUBLIC_API_URL=http://localhost:9001/api

RUN apk add --no-cache curl

COPY --from=build /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
