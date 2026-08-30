#!/bin/sh
# Container entrypoint: migrate, seed on a fresh database, start.
#
# DATABASE_URL is "file:<path>"; the path is derived from it so the seed
# decision follows whatever the compose file points at.
set -e

DB_PATH="${DATABASE_URL#file:}"
FRESH_DB=0
if [ -n "$DB_PATH" ] && [ ! -f "$DB_PATH" ]; then
  FRESH_DB=1
fi

echo "[entrypoint] Applying migrations (DATABASE_URL=${DATABASE_URL})..."
npx prisma migrate deploy

# The seed is idempotent (adds missing demo organisations) but is deliberately
# only run when the database file did not exist: a demo case someone removed on
# purpose must not reappear at the next restart.
if [ "$FRESH_DB" = "1" ]; then
  echo "[entrypoint] Fresh database — seeding demo organisations..."
  npx prisma db seed
else
  echo "[entrypoint] Existing database — skipping seed."
fi

echo "[entrypoint] Starting Next.js on port ${PORT:-3000}..."
exec npm run start -- --port "${PORT:-3000}" --hostname "${HOSTNAME:-0.0.0.0}"
