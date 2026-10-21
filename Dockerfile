# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# RoiQR — single-file Docker image for Coolify.
#
# Multi-stage build:
#   1. deps       — install dependencies
#   2. builder    — generate Prisma client + build the Next.js app
#   3. runner     — slim runtime image with only production artifacts
#
# Coolify watches this repo and builds the image automatically. DATABASE_URL
# (and any other env vars) are injected at runtime via Coolify environment
# variables. No build args are required.
# ---------------------------------------------------------------------------

FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml ./

# Install the exact versions in the committed lockfile.
RUN corepack enable && corepack prepare pnpm@10.1.0 --activate \
 && pnpm install --frozen-lockfile --ignore-scripts

# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* values are inlined at build time — set the production site URL
# here (or via --build-arg) so canonical/sitemap/robots URLs are correct.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Enable pnpm, then generate the Prisma client from the schema.
RUN corepack enable && corepack prepare pnpm@10.1.0 --activate
RUN npx prisma generate

# Build the Next.js application (standalone output for the slim runtime).
RUN pnpm build

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Sized for a 2 GB container: leave ~512 MB for the OS + filesystem cache.
# The batch queue (see app/api/batch/queue) samples RSS against this budget.
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Non-root user.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# The standalone output bundles everything the app needs at runtime.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000 HOSTNAME=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
