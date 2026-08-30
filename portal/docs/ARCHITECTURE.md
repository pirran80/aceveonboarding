# Architecture — Aceve Onboard portal

*Living document. Update it in the same change that alters behaviour.
Sources of truth for scope and rules: `../../Pre-onboarding/build/BUILD-SPEC.md`
(hard rules), `CUSTOMER-FLOW.md` (the flow), `DESIGN-BRIEF.md` (UI).*

## 1. What this is

A standalone Next.js service rendering a definition-driven onboarding flow:
preparation steps, then per-category data migration, then a gated finish.
The portal owns its own state; product binding happens at go-live, never
before. This is slice 1 of the BUILD-SPEC Phase-1 backlog (registry +
registry-driven flow rendering) plus the flow's persistence and i18n
foundations.

## 2. The load-bearing design: the registry

```
registry/products/next-project/
  flow.json      — steps, phases, agreement gate, category list + order
  modules.json   — data categories: fields, types, validation, aliases,
                   per-field DESTINATION (hard rule 2)
```

- Validated by Zod (`src/lib/registry/schema.ts`) at load; a bad edit fails
  tests and loud at runtime, never silently.
- Loaded by `src/lib/registry/load.ts`. Re-read per request in dev (change a
  JSON file → the flow changes), cached in production.
- `modules.json` is the 2026-08-20 draft generated from the recovered Ingestro
  sandbox — **a starting point, not ground truth** (category list pending PS
  confirmation, STATUS.md Q33). The flow's `categories.moduleIds` picks which
  modules render and in which order; both documented ordering constraints
  (kontoplan first; timpriser before anvandarregister) are enforced by test.
- Adding a product/country variant = adding a directory. No code change.

## 3. Journey logic

`src/lib/registry/flow.ts` — pure functions, unit-tested:

- Items = flow steps with data categories spliced after the migration-plan
  step.
- Agreement gate before everything; sequential unlock; states
  `complete | active | available | locked`.
- Progress = % of **gated** items complete (Prototype A model).
- The finish step lists exactly what is outstanding by name; it never shows a
  bare disabled button.
- The finish step also renders an end-of-flow summary of every answer,
  built by `src/lib/summary.ts` (pure, unit-tested) from the registry
  definitions + saved data — a new registry field appears in the summary
  automatically, per hard rule 1.

## 4. Data model (Prisma, `prisma/schema.prisma`)

`Organisation → OnboardingCase → CaseUser / StepInstance / DataSet`, plus
`MappingEntry` (the accumulating mapping library, personal-data-free).

Key decisions carried from PROJECT-BRIEF §5/§5.1:

- `OnboardingCase.registryFlow` selects configuration; `boundProduct` stays
  NULL until go-live — selection is not binding.
- `StepInstance.dataJson` holds step answers keyed by registry field ids.
- `DataSet` is the staging object: one per category, versioned (re-upload =
  new version), an assignee (delegation per category), chosen method, and the
  two approval gates (`customerApprovedAt`, `aceveApprovedAt`) — both live
  here because Ingestro has no review workflow.
- Staged rows will be keyed on module-registry field ids, never product field
  names (hard rule 3). `stagedRowsJson` is a placeholder until the Ingestro
  slice; original files belong in object storage, not the DB.
- JSON is stored as TEXT so the schema ports to PostgreSQL unchanged; the
  SQLite→Postgres move is a driver-adapter + `DATABASE_URL` swap.

## 5. Writes and validation

All writes go through server actions (`src/actions/case.ts`). Every
completion claim is re-validated server-side against the registry definition
(`src/lib/registry/validate.ts` — the same pure validators run client-side
for inline feedback). Validation errors are i18n keys, never display text.

`simulateImport` is an explicitly-labelled demo stand-in for the Ingestro
embed (BUILD-SPEC backlog slice 2) so gating can be exercised end to end.

## 6. i18n

- UI chrome copy: `src/messages/{sv,en}.json` via next-intl (cookie locale,
  no route prefix). Registry content carries its own per-language text,
  resolved server-side (`src/lib/resolve.ts`) so the registry never ships to
  the browser.
- All copy through keys from the first commit — including validation
  messages. sv + en active; no/da/fi/nl/de/fr are planned keys (design
  principle 8) and fall back to sv until translated.

## 7. UI

Aceve master brand tokens as CSS custom properties (`src/app/globals.css`),
Manrope via `next/font`. Semantic status colours are separate tokens from the
brand greens. Persistent sidebar = the whole journey; one step at a time in
the main pane; WCAG 2.1 AA is the bar (real form semantics, labels,
described errors, 44px touch targets). Theming is token-driven so a
white-label variant is configuration (Q45).

## 8. Versioning

- Semver in `package.json`; `CHANGELOG.md` (Keep a Changelog) for the
  technical log; `src/content/releases.ts` for the in-app, per-language
  "What's new" page. Update all three per release.

## 8b. Runtime & deployment

Production is one Docker container (`Dockerfile`, `docker-compose.prod.yml`,
`docker-entrypoint.sh`) behind the shared Caddy ingress, with SQLite in a
bind-mounted `data/` directory. Migrations run at container start; the demo
seed runs only on a brand-new database. Details, environment variables and
the verification checklist: `docs/DEPLOY.md`.

Analytics: `src/components/UmamiAnalytics.tsx` renders the self-hosted Umami
script only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set at build time. No
other tracking exists.

## 9. Deliberately not built yet (and why)

| Missing | Why | Pointer |
|---|---|---|
| Login/identity | Mechanism undecided (One Platform candidate) | STATUS.md Q2; actions take explicit caseId so an auth layer wraps them without reshaping |
| Ingestro embed | Licence-key/plan-feature questions open | Q21–Q29; `DataSet` + `simulateImport` mark the seam |
| Salesforce seed/enrich | Integration pattern undecided | Q4; seed values currently come from the Organisation record behind the same prop boundary |
| Backoffice view | Requirements gathering (stall flags, approval queue) | BUILD-SPEC backlog 6 |
| Object storage for source files | Comes with the Ingestro slice | PROJECT-BRIEF §5.1 |
| PSA mirror, provisioning writes, PSA kvittens | Phase 2 / contingent | Q36, Q38 |

## 10. Known technical notes

- `npm audit` flags `deepmerge-ts` via the Prisma CLI's config loader
  (dev-time tooling, not the runtime client). Track upstream; no action in
  app code.
- Next.js 16: `params`/`cookies` are async; bundled docs in
  `node_modules/next/dist/docs/`.
- No real customer data in dev/demo (BUILD-SPEC §12) — the seed is synthetic,
  and the figures rule (STATUS.md §Figures) applies to UI copy and demo data.
