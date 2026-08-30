# Aceve Onboard — production image.
#
# Built ON the production server by deploy.sh (docker compose build), never on
# the dev machine. Debian (glibc) rather than Alpine: better-sqlite3 ships
# prebuilt binaries for glibc and falls back to a native build, so the deps
# stage also carries the toolchain for that fallback.
#
# Runtime layout: the whole /app tree is copied from the builder because
# `next start` needs .next + public + node_modules, `prisma migrate deploy`
# needs prisma/ + prisma.config.ts + the prisma CLI (a devDependency, so
# node_modules is installed WITHOUT --omit=dev), and the registry loader reads
# registry/*.json from disk at runtime.

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- deps: install exactly the lockfile ----------------------------------
FROM base AS deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- builder: prisma client + next build ---------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is inlined into the client bundle at build time, so Umami has
# to be passed as build args (docker-compose.prod.yml forwards them from .env).
ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ARG NEXT_PUBLIC_UMAMI_SCRIPT_URL
ARG NEXT_PUBLIC_UMAMI_HOST_URL
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=${NEXT_PUBLIC_UMAMI_WEBSITE_ID}
ENV NEXT_PUBLIC_UMAMI_SCRIPT_URL=${NEXT_PUBLIC_UMAMI_SCRIPT_URL}
ENV NEXT_PUBLIC_UMAMI_HOST_URL=${NEXT_PUBLIC_UMAMI_HOST_URL}

RUN npx prisma generate && npm run build

# ---- runner ----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Fixed uid so the bind-mounted ./data directory on the host can be chowned
# to a known id (masterbackup requires SQLite in a bind mount, see BACKUP.md).
RUN groupadd -g 1001 nextjs && useradd -u 1001 -g nextjs -m -s /usr/sbin/nologin nextjs

COPY --from=builder --chown=nextjs:nextjs /app /app
RUN chmod +x /app/docker-entrypoint.sh && mkdir -p /app/data && chown nextjs:nextjs /app/data

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
