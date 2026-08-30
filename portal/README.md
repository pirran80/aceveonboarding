# Aceve Onboard — portal

The customer-facing preboarding & onboarding portal. A customer prepares and
migrates their own data — starting before any account, licence or database
exists — with progress saved, several people working in parallel, and both
sides seeing the same status.

Project background, decisions and open questions live in `../Pre-onboarding/`
(start with `README.md` → `build/BUILD-SPEC.md`). This folder is the build.

## Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | Stack chosen by Pierre 2026-08-30; confirm with Carl per BUILD-SPEC §4 |
| Database | SQLite via Prisma 7 (driver adapter) | Migrate to PostgreSQL by swapping the adapter (`@prisma/adapter-pg`) + `DATABASE_URL` |
| i18n | next-intl, cookie-based locale | sv + en active; key structure ready for all 8 portal languages |
| Validation | Zod (registry contract) + pure validators | Frontend stops bad input early, backend guarantees integrity — always both |
| Tests | Vitest + Testing Library | `npm test` |

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npx prisma db seed       # demo organisation + case
npm run dev              # http://localhost:3000
```

The home page lists seeded demo cases (external identity is an open question —
STATUS.md Q2 — so there is no login yet).

## Scripts

| Script | What |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Unit + component tests (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Prisma migration (dev) |
| `npm run db:seed` | Seed demo customers (idempotent — adds missing ones) |
| `npm run db:reset-demo` | Reset every demo case to a fresh start (answers, people and staged data removed; URLs kept) |

## The one rule to know before touching anything

**No hardcoded module, field or step list anywhere in the codebase.**
Everything the customer sees is generated from `registry/` (JSON, validated by
`src/lib/registry/schema.ts`). Change a JSON file → the flow changes. If the
registry cannot express what you need, extend the schema — never special-case
a product in a component. See `docs/ARCHITECTURE.md`.

## Layout

```
registry/products/<flow>/   flow.json (steps, phases, gates) + modules.json (data categories)
prisma/                     schema + migrations + seed
src/lib/registry/           schema (zod), loader, journey logic, validation — all unit-tested
src/lib/                    db client, case view assembly, locale helpers
src/actions/                server actions (all writes go through here)
src/app/                    routes: /, /case/[caseId]/step/[stepId], /case/[caseId]/data/[moduleId], /whats-new
src/components/             sidebar/shell + one client component per step kind
src/messages/               UI chrome copy per locale (registry carries its own text)
docs/                       architecture + user guides
```

## Documentation

- `docs/ARCHITECTURE.md` — technical documentation (keep updated per change)
- `docs/user-guide.sv.md` / `docs/user-guide.en.md` — end-user guide
- `CHANGELOG.md` — versions (Keep a Changelog); in-app "What's new" is
  `src/content/releases.ts` — update both when releasing
