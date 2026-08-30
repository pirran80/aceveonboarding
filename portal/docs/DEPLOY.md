# Deployment — aceveonboarding.achiever.se

Technical notes for running the portal in production. Audience: whoever
deploys or debugs the live instance. The infrastructure rules that apply to
every site (server, Caddy, backup, monitoring) live in the private
`.github/copilot-instructions.md` on the dev machine and are **not** in this
public repository — nothing below contains internal addresses or credentials.

## Where it runs

| | |
|---|---|
| URL | https://aceveonboarding.achiever.se |
| Host | The shared production server, one Docker container per site |
| Project dir on server | `docker/aceveonboarding/` (this `portal/` folder, synced by `deploy.sh`) |
| Container | `aceveonboarding-app` (image built on the server from `Dockerfile`) |
| Ingress | `caddy-edge` → `aceveonboarding-app:3000` over the `caddy_net` Docker network; TLS via Let's Encrypt. Copy of the site block: [`caddy-snippet.conf`](../caddy-snippet.conf) |
| Database | SQLite, `./data/portal.db` on the server (bind mount → `/app/data`) |
| Health probe | `127.0.0.1:3150` on the server → root page (reads the DB, so it is an honest check) |
| Backup | masterbackup file backup of the project folder — see [`BACKUP.md`](../BACKUP.md) |
| Monitoring | Uptime Kuma, HTTP monitor on the root URL |

## How a deploy works

`deploy.sh` (in this folder; not committed — it carries the server address)
wraps the shared deploy library used by every site:

1. Pre-flight: compose file present, SSH and Docker reachable.
2. Version: `./deploy.sh 0.1.2 "Beskrivning"` uses that version; with no
   argument the patch number is bumped. `package.json` is updated by the
   script — bump `CHANGELOG.md` and `src/content/releases.ts` by hand first
   (ARCHITECTURE §8).
3. Release commit: all *tracked* changes are committed as
   `release(aceveonboarding): v<version> - <description>`, with a note in
   `releases/`. New files must be `git add`ed before deploying or the script
   stops (untracked source files would run in production without being in git).
4. `rsync` of this folder to the server (`data/`, `.env*`, `node_modules`,
   `.git` excluded — the server's `.env` and database are never overwritten).
5. On the server: `docker compose -f docker-compose.prod.yml build` then
   `up -d` (never `down` first — a failed build leaves the old container running).
6. Health check against the root page; on failure the script rolls back to
   the previous image.

Rollback by hand: `./deploy.sh --rollback`. Status: `./deploy.sh --status`.

## Container start sequence

`docker-entrypoint.sh`:

1. `prisma migrate deploy` — applies pending migrations from `prisma/migrations/`.
2. `prisma db seed` — **only if the database file did not exist** before step 1.
   The seed is idempotent, but a demo case someone removed on purpose must
   not come back at the next restart.
3. `next start`.

The image copies the whole build tree because `next start` needs `.next` +
`public`, the Prisma CLI (a devDependency) is needed for migrations, and the
registry loader reads `registry/**/*.json` from disk at runtime.

## Environment (`.env` on the server, never in the repo)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | `file:/app/data/portal.db` — inside the bind mount |
| `JWT_SECRET` | Required by the shared deploy library's pre-check (≥ 32 chars). Unused by the app until login exists (STATUS.md Q2) |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` | Umami site id. Empty = no analytics script rendered. Baked in at build time (Docker build arg), so changing it needs a redeploy |
| `NEXT_PUBLIC_UMAMI_SCRIPT_URL`, `NEXT_PUBLIC_UMAMI_HOST_URL` | Umami endpoints; default to the self-hosted instance |

## Verifying a deploy

- `curl -sI https://aceveonboarding.achiever.se/` → `200`, `strict-transport-security` header present.
- On the server, without Caddy: `curl -s http://127.0.0.1:3150/ | head` shows the demo case list.
- `docker logs aceveonboarding-app` shows the migration lines and either
  "Fresh database — seeding" (first start) or "Existing database — skipping seed".
- The version in the page footer matches `package.json`.

## Not yet in place (tracked follow-ups)

- **Login/identity** — the home page lists the seeded demo cases openly.
  Fine for an internal test round; not for real customers (ARCHITECTURE §9).
- **Sentry** — no DSN yet; per the portfolio rule Sentry is only initialised
  when a real DSN exists, so nothing is wired in.
- **PostgreSQL** — the SQLite → Postgres swap is a planned adapter change
  (ARCHITECTURE §4); when it happens, `BACKUP.md` and the compose file change
  with it (DB in its own container so the dump script finds it).
