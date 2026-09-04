# syntax=docker/dockerfile:1

# ── Admin console (Nuxt 4, SSR) ─────────────────────────────────────
# `nuxt build` produces a self-contained Nitro server under .output — the
# runtime stage needs only that, never node_modules or the source tree.

ARG NODE_VERSION=22

# ── build ───────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./

# --ignore-scripts: this project's postinstall runs `nuxt prepare` and a
# sourcemap-stripping script, both of which need the full source tree that
# hasn't been copied in yet. They run explicitly below, after COPY . .
RUN npm ci --ignore-scripts

COPY . .

# lucide-vue-next ships ~500 sourceMappingURL comments pointing at .map files
# it never publishes; left alone, the build logs one ENOENT per icon.
RUN npx nuxt prepare \
    && node scripts/strip-dangling-sourcemaps.mjs \
    && npm run build

# ── runtime ─────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
# Nitro reads runtimeConfig.public.apiUrl from this at container start, not
# at build time — so the same image runs unmodified in every environment.
ENV NUXT_PUBLIC_API_URL=http://localhost:9001/api

RUN apk add --no-cache curl

COPY --from=build /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", ".output/server/index.mjs"]
