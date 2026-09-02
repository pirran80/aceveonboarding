# Changelog

All notable changes to the Aceve Onboard portal. Format follows
[Keep a Changelog](https://keepachangelog.com/); versioning follows semver.
End-user-facing release notes (per language) live in `src/content/releases.ts`
and render on the in-app "What's new" page — update both.

## [0.1.3] — 2026-09-02

Feedback round FEEDBACK-0.1.2-2026-08-31 (Carl): the P-tasks, plus the R
directions that were buildable without new decisions (R2, R3, R6) and the S1
demo proof. F1 is answered in `docs/ARCHITECTURE.md` §2: steps, fields and
categories are registry configuration, not code.

### Fixed

- **P0-1**: every category page 404:ed in production. Root cause: the deploy
  rsync's unanchored `data` exclude (protecting the bind-mounted database
  directory) also swallowed the app route `…/data/[moduleId]` on its way to
  the server. Route renamed to `…/category/[moduleId]`; trap documented in
  `docs/DEPLOY.md`.
- **P1-2**: failed validation now scrolls the first failing field into view,
  moves focus to it, and shows an error count next to Save (`role="alert"`).
- **P2-4**: category names and descriptions follow the language choice —
  English added for all 17 modules in the registry (field labels remain
  Swedish pending the authoritative category list, Q33).
- **P2-5**: the duplicated e-mail help text on Superusers is removed; the
  subtitle carries invitation + delegation wording once.
- **P2-6**: badge/pill text colours darkened — the previous mid-green on
  light grey-green measured a borderline 4.5:1; now ~9:1 (WCAG 2.1 AA with
  headroom).

### Added

- **P1-3**: `robots.txt` (disallow all) and `robots: noindex` metadata on
  every page — nothing is indexable while the portal has no login (Q2).
- **R2**: the seeded-field badge wording is audience-configurable:
  `PORTAL_AUDIENCE=customer` switches "Förifyllt från Salesforce …" to
  "Kända uppgifter från ert avtal …" (candidate copy — final wording is
  Carl's call). Default remains the demo wording.
- **R6**: trainings can carry a booking link (`href`) in the registry,
  rendered as "Öppna →" in the matrix. Which trainings appear is already
  registry data per flow; the admin UI for toggling them is a later slice.
- **S1**: third demo case "Sundets Måleri & Fasad AB" on the Core package
  variant (`registry/products/next-project-core/`): 4 categories instead
  of 6, 2 trainings instead of 3, module definitions inherited via the new
  `modulesFrom` mechanism — the visible proof that a package variant is
  configuration, not code (R10 direction).

### Changed

- **R3**: the agreement checkbox on Welcome is removed. Entry is triggered by
  the closed-won opportunity, so the signed agreement is stated as
  informational text ("Ni har ett signerat avtal med Aceve för [produkt] —
  därför är ni här") with a single "Kom igång" action.
  `Pre-onboarding/build/DESIGN-BRIEF.md` §4.1 updated in the same change.
- **R6**: the step is named "Utbildningar"/"Trainings" (step id unchanged).

## [0.1.2] — 2026-08-30

First production deployment — the portal is live at
https://aceveonboarding.achiever.se for internal testing (no login yet; the
seeded demo cases are the entry points).

### Added

- Production packaging: `Dockerfile` (Node 22, Prisma client generated and
  Next.js built in the image), `docker-compose.prod.yml` (container
  `aceveonboarding-app` on the shared ingress network, SQLite in a
  bind-mounted `data/` directory), `docker-entrypoint.sh` (migrate on start,
  seed only on a fresh database).
- `docs/DEPLOY.md` — how production is built, started and verified;
  `BACKUP.md` — what masterbackup covers and how to restore;
  `caddy-snippet.conf` — copy of the ingress site block.
- `UmamiAnalytics` component: self-hosted analytics, rendered only when
  `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set at build time.

## [0.1.1] — 2026-08-30

Quick fixes from the combined review (step 2 of the agreed order:
P3-5, P0-5, P0-6, D-1, D-2, P3-8).

### Fixed

- **P3-5**: the method card could keep showing a stale choice after
  Undo + Skip — the chosen method is now derived from server state with only
  an in-flight optimistic overlay, so client and server can no longer diverge.
- **P0-6**: progress now counts the submission itself — 100 % means
  submitted, never "everything except the send". The sidebar also shows
  "x of y steps done" alongside the percentage.

### Changed

- **P0-5**: submitting asks for confirmation (the material is locked), and
  the submitted state is a receipt that explains what happens next instead of
  a dead end.
- **D-2**: a category with a chosen method but no data shows
  "Method chosen — awaiting file" (step, and summary) instead of reading as
  untouched or done.
- **P3-6 (partial)**: Undo now asks for confirmation before resetting a
  completed category, and locked method cards explain how to change method.
- **D-1**: welcome-step and import-card copy no longer promise AI column
  matching before the Ingestro embed exists; the semantic-model caption
  describes what the fields mean without overclaiming.
- **P3-8**: all checkboxes follow the brand palette via a global
  `accent-color` (the webinar matrix and the source-system toggle were
  browser blue).

## [0.1.0] — 2026-08-30

First working slice: registry-driven flow rendering (BUILD-SPEC Phase-1
backlog, slice 1) with persistence, i18n and tests.

### Added

- **Module + flow registry** (`registry/products/next-project/`): steps,
  phases, agreement gate, category list and every data-category field as
  validated JSON configuration — no hardcoded module/field/step lists
  (BUILD-SPEC hard rule 1). Modules seeded from the 2026-08-20 draft registry
  (17 modules, 202 fields, per-field destinations); the flow renders the six
  Stitch categories in constraint-correct order (kontoplan first, timpriser
  before anvandarregister), pending PS confirmation (Q33).
- **Data model** (Prisma + SQLite via driver adapter): Organisation,
  OnboardingCase (registryFlow ≠ boundProduct — binding stays a go-live
  event), CaseUser, StepInstance, DataSet (versioned staging object with
  assignee, method and both approval gates), MappingEntry (the mapping
  library). Portable to PostgreSQL by adapter swap.
- **Customer flow UI**: persistent journey sidebar with sequential unlock and
  live progress; welcome + agreement gate; company details with
  Salesforce-seeded fields rendered as confirmed values; business profile
  with legacy-source toggle and conditional IT-contact block; superuser
  editor with live validity counter (min 2); per-user × per-webinar check
  matrix; three-way consent step; migration plan with per-category method
  matrix and delegation; per-category steps showing the semantic model
  (mandatory fields highlighted) with a clearly-labelled demo import
  placeholder; gated finish step that lists exactly what is outstanding.
- **i18n**: Swedish + English throughout (UI chrome via next-intl, registry
  content per-language, cookie-based switcher); key structure prepared for
  all 8 portal languages.
- **Server-side validation** mirroring the client validators for every
  completion claim; validation messages as i18n keys.
- **Tests** (Vitest): registry contract (incl. per-field destination rule and
  ordering constraints), journey/unlock/progress logic, form + conditional
  validation, people-editor component behaviour. 18 tests.
- **End-of-flow summary** on the finish step: everything the customer entered
  — company details, business profile, people, webinar bookings, consents and
  per-category method/assignee/status — generated from the registry (new
  registry fields appear automatically), with per-section status pills and
  "Change" links back to each step (hidden after submission). Submission now
  records `submittedAt` and the confirmation shows the real, locale-formatted
  date.
- **Versioning surface**: this changelog, semver, and an in-app localized
  "What's new" page.
- **Docs**: `docs/ARCHITECTURE.md`, end-user guides (sv/en), README.

### Not yet (tracked seams)

- Login/external identity (Q2), Ingestro Importer embed (Q21–Q29), Salesforce
  seed/enrich adapter (Q4), backoffice view, object storage for source files.
