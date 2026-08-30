# BUILD-SPEC — Aceve Onboard, engineering brief

*Written 2026-08-20 (Carl + Claude). This is the consolidated starting point for whoever builds the portal — human or /fullstack-engineer. It **consolidates** `PROJECT-BRIEF.md`, `STATUS.md`, `ASSETS.md` and `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md`; it decides nothing new. Where something is unverified, it says so and names the `STATUS.md` open question. Read `CUSTOMER-FLOW.md` first for what is being built; this file is how.*

---

## 1. Mission

Build a standalone web portal where a new Aceve customer prepares and migrates their own data — **starting before any account, licence or database exists for them** (the main track), and **continuing through the implementation** once a database exists and some data is migrated (Carl, 2026-08-20). Sequential flow, progress saved, several users per customer in parallel, both sides seeing the same status. Data is mapped/validated/cleaned in the embedded Ingestro Importer SDK, staged in the portal's own store, approved by both sides, and written to the target product — at go-live or, for later categories, into the existing database through the same path. **Consequence: the migration job is per-category by design; go-live is a binding event, not a one-shot data dump.**

**Phase 1 deliverable is deployed and live against real customers — not a further prototype.** The BSO→Next case runs through it end to end as the proving ground.

This is built right from the ground up: a backend designed to carry the whole Aceve portfolio and large customer volumes (many customers × many products × many configuration variables), a database structure where that variation is data, secure external login, real product-API connections, and a UX that is self-explanatory, guiding and motivating (Carl, 2026-08-20 — see `DESIGN-BRIEF.md`).

Optimisation order, per Carl (2026-08-20): **time to value** (customer and Aceve) → **reuse data we already hold** (Salesforce, our products) → **everything as configuration** → **automate as far as verified behaviour allows, toward fully self-service onboarding as the north star** → easy for the customer, unambiguous for both sides.

## 2. Hard rules — violations are defects, not shortcuts

1. **No hardcoded module or field list anywhere in the codebase.** Modules, fields, steps, ordering, validation, dropdown values, aliases, copy — all configuration in the module registry (§5). The recovered sandbox does the opposite (17 modules, ~200 fields in one 1,653-line file); it is the reference for *behaviour*, the anti-pattern for *structure*.
2. **Every field carries a destination**, one of three, resolved at go-live: an Ingestro import mapping, a target product API configuration field, or a provisioning parameter. A field without a destination cannot exist. (Corollary: Ingestro's "end users can create their own columns" feature must be disabled or given a deliberate answer — `STATUS.md` Q32.)
3. **Nothing in data model, URLs, terminology or UI may assume Next.** Staged rows are keyed on module-registry field ids, never product field names. A staging table shaped like a Next table is a defect.
4. **Read, never write, against customer/product data** — except the two explicitly designed writes: the migration job at go-live (human confirm mandatory, batched, per-row receipt) and, in Phase 2, provisioning (control model undecided — `STATUS.md` Q36). Certinia PSA is mirrored read-only; the portal writes back exactly one kvittens event (contingent — Q38).
5. **AI proposes, rules execute — human confirmation is the default, full self-service is the north star.** Two stacked human checks: mapping verification, then data verification. Nothing reaches a product database without explicit confirmation from both customer and Aceve — until a flow is verified well enough to graduate to automation per product and customer type, as a deliberate, evidenced decision (never silent drift). Build the confirm gates as configuration so graduation is a registry change, not a rewrite.
6. **Multi-language and multi-country from day one.** 8 UI languages inherited (sv, en, no, da, fi, nl, de, fr); country/language are first-class fields that drive routing. Package identity is country-specific — do not assume a package name means the same thing in two countries (Q44).
7. **No BSO figures and no unvalidated figures** in code, copy, docs or demo data. See `STATUS.md` §Figures.

## 3. What exists and what does not

| Exists | Where |
|---|---|
| Validated customer flow (clickable, reviewed with colleagues) | `CUSTOMER-FLOW.md`, `reference/BSO-preboarding-mockup.html`, Stitch capture in RECOVERY-NOTES |
| Working Ingestro integration pattern, 17 modules, field lists, per-cell validation, sequential unlock | `reference/prototype-C-ingestro-sandbox/App.original.tsx` (+ RECOVERY-NOTES) |
| Ingestro's own reference integration + readable SDK 4.8.5 internals | `reference/prototype-C-ingestro-sandbox/ingestro-reference-integration/`, `reference/sandbox-devbox-4hyyps.zip` |
| Seed of the mapping library (curated legacy→target value maps) | `reference/bso_to_next_transformer.py` |
| Signed Ingestro licence (Data Importer Business) | `reference/MSA Change Order - Ingestro & Aceve - 29.05.2026.pdf` |
| Salesforce field lists for seed/enrich | `reference/SF-Integration-One-Pager.docx` (strip its dates before reuse) |
| Identity analysis (One Platform candidate) | `research/Identity-OAuth2-One-Platform.md` |

**Does not exist:** any backend, any deployed service, a confirmed identity mechanism, a hosting path, a confirmed authoritative data-category list, verified answers to the Ingestro behaviour questions (§7), an assigned formal build resource beyond Carl + Pierre.

## 4. Architecture

Direction agreed June–August 2026 (`PROJECT-BRIEF.md` §5 holds the full diagram and reasoning):

- **Standalone service** outside the product monoliths, talking to product APIs. IT-operated hosting like other Aceve products (Backstage ruled out for production — no external customer identity). Deployable independently.
- **Multi-IdP:** customers via external identity (leading candidate: Aceve One Platform, OAuth2 Authorization Code + PKCE — unconfirmed, Q2), Aceve staff via corporate Entra for the backoffice view.
- **Salesforce** seeds Account-level data in and receives enrichment + exactly one completion record back. Integration pattern undecided (MCP connector vs data lake vs iPaaS — Q4); design an adapter boundary so the pattern can change without touching the domain.
- **Certinia PSA** ("PS Cloud", Project Nexus): delivery status mirrored **read-only**; the portal owns its own state machine and never derives state from PSA (Nexus is mid-rollout — Q39).
- **Ingestro Importer SDK** embedded browser-side as a **transform function, not a store**. The portal's staging store is the source of truth between upload and go-live (§6).
- **Migration job** at go-live: reads approved staged data, resolves field-id → product bindings, writes to the product API batched around the known ~10,000-row product-import timeout, per-row receipts.

**Stack: not decided.** Constraints that bound the choice: web frontend embedding a React SDK component (`@ingestro/importer-react` — a React frontend is the path of least resistance), a backend owning state/staging/approvals with relational storage + object storage for original files, EU-region, i18n, WCAG 2.1 AA, and IT-operatable (their conventions decide packaging/runtime — ask IT, Q3). Propose the stack to Carl before scaffolding; do not inherit one silently from a template.

## 5. The module registry — the load-bearing design

Everything a customer sees in Phase 2, and most of Phase 1, is generated from registry data. Minimum shape per module (from `PROJECT-BRIEF.md` §5 data-model direction):

```jsonc
{
  "id": "kontoplan",                       // stable, product-neutral
  "product": "next-project",               // namespaced per product+country+version; expect segment/customer-size variants too
  "sheetName": "Ev. kontoplan",            // GI-mall sheet routing
  "name": { "sv": "Kontoplan", "en": "Chart of accounts", … },
  "description": { … },
  "order": 1,                              // + explicit dependencies, e.g. timpriser before anvandarregister
  "requiredLevel": "required | optional",
  "methods": ["gi-mall", "excel", "integration", "skip"],   // the per-category method matrix
  "fields": [{
    "id": "kontonr",
    "label": { "sv": "Kontonr", … },
    "type": "string | email | date | category | float | …", // maps to Ingestro columnType
    "required": true,
    "acceptedValues": [],                  // dropdownOptions
    "aliases": ["Konto", "Kontonummer", …],// feeds Ingestro alternativeMatches at runtime
    "validations": [{ "validate": "required" }, { "validate": "regex", … }],
    "destination": {                       // HARD RULE 2 — exactly one, resolved at go-live
      "kind": "ingestro-mapping | product-api-field | provisioning-parameter",
      "ref": "…"                           // per-product binding, e.g. "Next Project project schema v4"
    }
  }]
}
```

- The sandbox's `makeColumns(labels)` already derives Ingestro column definitions from a plain field list — the work is moving that list out of code into the registry and adding the destination binding.
- **A draft registry exists:** `build/registry/next-project.draft.json` (generated 2026-08-20 from the sandbox source — 17 modules, 202 fields, with types, required flags, accepted values, generated aliases and Ingestro-column destination refs). It is a **starting point, not ground truth**: category list pending PS confirmation (Q33), module order is the sandbox's (not the documented import order), only `sv` labels present, and product-API/provisioning bindings deliberately unresolved.
- **The mapping library lives on our side:** store approved `source column → field id` mappings per legacy system, versioned, free of personal data; generate Ingestro's `alternativeMatches` per customer at runtime. Every approved mapping makes the next customer on the same legacy system cheaper — this is the accumulating asset (design principle 6). Seed it from `bso_to_next_transformer.py`'s tables (`ERSATTNINGSFORM_MAP`, `BSO_STATUS_MAP`, `RESURSTYP_MAP`, `AVVTYP_MAP`, `SKIP_ACCOUNTS_PREFIX`, plus its encoded warnings — e.g. project manager is always empty in a BSO export).
- **Registry content for Next is unconfirmed** (7 vs 15 vs 17 categories — Q33). Build the mechanism; load whichever list PS confirms. Known constraints regardless: chart of accounts first; Timpriser before Användarregister.
- Configuration-question modules (Fortnox / Visma Admin / E-invoice batteries) use the same shape with `destination.kind = "product-api-field" | "provisioning-parameter"` (Next Action 22 converts them).

## 6. Data model and staging (proposal — `PROJECT-BRIEF.md` §5/§5.1)

```
Organisation            — legal name, prefix, org.nr, country, language, SF account id
  └── OnboardingCase    — status, complexity/method profile, target product (NULL until go-live)
        ├── Users       — superusers, roles, invite state, per-user progress
        ├── Steps       — generic step instances, definition-driven
        └── DataSets    — one per data category
              ├── assignee, status, version
              ├── original file(s) in object storage, detected schema
              ├── mapping (source column → field id), versioned, reusable
              ├── staged rows keyed on field ids
              └── validation result, customer approval, Aceve approval, import receipt
```

- Ingestro is re-run from scratch on each visit; nobody resumes an importer session — they return to a DataSet.
- One DataSet step can have N assigned people with N individual completion states; importer sessions are never shared between users. Delegation is per data category today (DataSet assignee, set by the customer's lead project manager); **do not preclude finer-grained delegation** — per field group or sub-step — in the schema; it is an expected refinement from requirements work and customer feedback (Carl, 2026-08-20).
- Portal state machine owns case status; PSA status is an overlay.
- **GDPR consequences owned deliberately:** signed DPA confirmed, EU-region storage, encryption at rest, retention rule (delete staged customer data a defined period after go-live, keep mappings). André Ijspelder's privacy assessment is the vehicle (Q25); the field-level data classification he asked Carl for is a build input.

## 7. Ingestro integration contract

Verified (from recovered source + SDK bundle — grading in RECOVERY-NOTES):

- `@ingestro/importer-react` 4.8.5; six wizard steps (`upload → sheet_selection → header_selection → join_column → match_column → review_entries`); multi-file join/append built in; 30 built-in column types (no Swedish org-number/postcode type — use `regex`); conditional requirement validations (`required_with`, `unique`, `regex`, …) are first-class.
- Mapping engine: `columnMappingConfiguration.layers` = `exact | historic | smart | fuzzy`, `threshold` (default 0.6), `processingMode` `"browser" | "node"`. A parallel `optionMappingConfiguration` matches **cell values**, not just headers.
- Licence-plan feature gate: SDK calls `POST /verify` and silently disables features client-side per `plan_detail.features`. Without `node_processing`, mapping is forced to browser and `smart`/`historic` layers are stripped; without `remember_mapping`, `historic` is stripped.
- Self-hosting switch exists (`baseUrl`); default backend `api-gateway.getnuvo.com`.
- Identifier convention from the sandbox: `next_${id}_import` — generalise to a real per-product namespace.

**Do not design against these until verified** (one vendor conversation, Chris Zhang / Orlando Neto — sync with Eric Lindberg first, he owns the relationship and has "API vs staging" as his own open action, Q28):

| # | Question | STATUS |
|---|---|---|
| 1 | Which plan features are enabled on our real key? (Or: run the sandbox with the real key and read `plan_detail`) | Q29 |
| 2 | What does "Auto Remember Function" do? (Likely `remember_mapping` → `historic` layer) | Q22 |
| 3 | Can `alternativeMatches` be set dynamically per customer at runtime? (The hinge for our mapping library) | Q23 |
| 4 | What counts as one billable import against 7,000/month? | Q24 |
| 5 | Does "AI Mapping for field values" send cell content server-side? Until answered, do **not** state "data never passes Ingestro's servers" unqualified | Q26 |
| 6 | Does a half-finished import survive a page reload? | Q21 |

Licence reality: Data Importer **Business**, EUR 1,199/month, 7,000 uploads/month, label "Next One Technology AB". Contextual Engine and Data Pipelines **not** included (Contextual Engine is a plan flag — switchable without code change if licensed). Second product/label triggers Organization Account pricing. The sandbox key (`non-commercial`) will likely not verify on a production domain — test early. Team Phoenix is upgrading Next from Nuvo 2.x to Ingestro 4.x — align versions with them.

## 8. Identity contract (candidate, unconfirmed — Q2)

From `research/Identity-OAuth2-One-Platform.md`:

- Customers: One Platform (PCB), OAuth2 Authorization Code + PKCE, per-company SSO, 2FA/OTP, company/subdivision context switching. **Unresolved and decisive:** can One Platform hold an organisation + invited users with **no product entitlement**?
- Two day-one constraints if One Platform is chosen: `redirect_uri` is whitelisted on exact character match with no self-service (**static return URLs**), and the go-live handoff **must not pass a token** — OAuth2 shares an SSO session, not a credential.
- Staff: corporate Entra. Design as multi-IdP from the start.
- Invite flow (superusers inviting colleagues) is portal-owned regardless of IdP.

## 9. Salesforce contract (pattern undecided — Q4)

- **Seed (in):** Account-level company info, contacts, region, products owned, deal stage. Field lists in `reference/SF-Integration-One-Pager.docx`.
- **Enrich (out):** status, profile data, superusers.
- **Completion (out):** exactly one record carrying what the receiving side needs to act.
- **Catalogue keys:** `ProductCode` is empty on every sampled row — the practical binding today is record Id + `Product_Group__c`; `Onboarding_Group__c` is the natural hinge between what-was-sold and which-flow-to-show but is only partly populated (Q41–43). Read products/packages from Salesforce rather than holding an own list — pending the Miguel/Andrew conversation (Next Actions 5, 24).
- Carl's standing ask: part of the official integration strategy, **not a point-to-point workaround**.

## 10. Phase 1 backlog (value-first order)

Each slice is independently demonstrable; validate with Carl between slices.

1. **Module registry + registry-driven flow rendering** (steps + one data category end to end, definitions as data, i18n keys in place). Proves rule 1. Demo: change a JSON file, the flow changes.
2. **Ingestro embed against staging** — one category through upload → mapping → validation → `onResults` → staged rows keyed on field ids; original file to object storage; re-run-from-scratch semantics.
3. **Multi-user case state** — organisation, case, invites, per-category assignee, shared progress visible live. (The requirement that killed Prototype B.)
4. **Approval gates + completion** — customer approve, Aceve approve, gated final step, the single completion record (Salesforce write can be stubbed behind the adapter until Q4 lands).
5. **Salesforce seed** (adapter + real pattern once decided) — prefill on login; explicitly Phase 1, not deferrable.
6. **Backoffice view** — customers × categories × status, stall flags, approval queue, Entra login.
7. **Mapping library** — persist approved mappings, feed `alternativeMatches` (or fallback if Q23 answers no), seeded from the transformer tables.
8. **BSO→Next case end to end** with a real customer file — this also produces the before/after measurement Magnus asked for (Next Action 2).

Not Phase 1: provisioning writes (Q36), PSA kvittens (Q38), training-portal integration (Q16), Pendo, editable staging grid, Data Pipelines.

## 11. Do-not-assume list

The builder must not fill these gaps with assumptions — each has an owner and an open question:

- Identity mechanism and hosting path (Q2, Q3 — IT conversation, critical path since June).
- The authoritative data-category list for Next (Q33 — PS confirms).
- Any Ingestro runtime behaviour in §7's table (Q21–24, Q26, Q29 — vendor).
- Salesforce integration pattern and catalogue keys (Q4, Q41–43 — Miguel/Andrew).
- Zendesk-out / Salesforce-360 as an organisational fact (Q34).
- Whether a Salesforce Experience Cloud customer portal is already planned under Nexus (Q35 — **ask before building the shell**; it changes whether we build alongside Nexus or against it).
- Which phase model the customer-facing copy aligns to (Q37).
- Entré Office vs Entré as provisioning targets (Q40).
- Data-residency/retention terms for staging (Q25 — André's assessment).

## 12. Quality bar

Documentation, tests and secure data handling are **requirements from the start**, not bolted on (Carl + Pierre, 2026-08-20). Frontend validation stops bad input early; backend validation guarantees integrity — always both. WCAG 2.1 AA (Prototype A explicitly failed this; do not inherit). All copy through i18n from the first commit. No real customer data in dev/demo environments; the sandbox's self-testing sample generator (seeded defects) is the pattern to keep.
