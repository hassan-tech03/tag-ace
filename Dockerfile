# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the Mushk monorepo.
#   target "runner" -> Next.js standalone server (apps/web)
#   target "tools"  -> migrations and seed scripts (packages/db)

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---- all workspace dependencies (cached until a package.json changes) ------
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- build the web app -------------------------------------------------------
FROM deps AS builder
COPY packages/db packages/db
COPY apps/web apps/web
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time.
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN} \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build -w @mushk/web

# ---- tools: migrations + seeds (production deps of @mushk/db only) ----------
FROM base AS tools
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/
COPY packages/db/package.json packages/db/
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund --workspace @mushk/db
COPY packages/db packages/db
WORKDIR /app/packages/db
USER node
CMD ["node", "scripts/migrate.mjs"]

# ---- runtime -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public
# Pre-create the cache dir so the mounted volume inherits node ownership
# (next/image writes optimised images here).
RUN mkdir -p apps/web/.next/cache && chown -R node:node apps/web/.next/cache
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]
