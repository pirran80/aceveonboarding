#!/bin/sh
# Container entrypoint: migrate, seed (idempotent), start.
set -e

echo "[entrypoint] Applying migrations (DATABASE_URL=${DATABASE_URL})..."
npx prisma migrate deploy

# The seed is idempotent (adds missing demo organisations, leaves existing untouched).
echo "[entrypoint] Running seed for demo organisations..."
npx prisma db seed

echo "[entrypoint] Starting Next.js on port ${PORT:-3000}..."
exec npm run start -- --port "${PORT:-3000}" --hostname "${HOSTNAME:-0.0.0.0}"
