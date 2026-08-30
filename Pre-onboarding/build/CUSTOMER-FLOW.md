# CUSTOMER-FLOW — the validated end-to-end flow

*Written 2026-08-20 (Carl + Claude). This consolidates the customer-facing flow from the three prototypes into one description. It introduces nothing new: every element below traces to Prototype A (`reference/BSO-preboarding-mockup.html`), Eric's Stitch mockup, or the Ingestro sandbox (`reference/prototype-C-ingestro-sandbox/`). Where sources disagree, the disagreement is stated, not resolved. Companion documents: `BUILD-SPEC.md` (how to build it), `DESIGN-BRIEF.md` (how it should look and behave).*

*Everything here describes the **Next Project instance** of the flow — the concrete case the prototypes were built for. In the build, every step, field and category below is **configuration read from the module registry**, never code (design principle 7). The flow structure itself — phases, gates, sequential unlock, method choice per category — is the product-agnostic part. Expect the steps and fields to keep evolving and to vary by product, country and customer size: the requirements owner and feedback from real customers will surface things no prototype has — the registry, not the code, is where that lands.*

*Scope note (Carl, 2026-08-20): the pre-provisioning stage is the main track, not the whole life span. The same flow stays in use **during the implementation** when a database exists and some data is already migrated — remaining or supplementary categories are prepared, validated and approved the same way, and the migration job writes them per category into the existing database.*

---

## 1. Shape of the whole

Two phases in one continuous flow, in one sidebar, with one progress model:

```
PHASE 1 — PREPARATION          PHASE 2 — DATA MIGRATION           FINISH
(forms, people, confirmations) (per-category import via Ingestro)
Välkommen                      Migrationsplan (plan + method choice)
Företagsuppgifter              Category 1 (e.g. Kontoplan)
Er verksamhet & bakgrund       Category 2 …                        Skicka & boka
Superanvändare                 Category N                          uppstart
Webbinarier                                                        (locked until all
Ansvarsfördelning                                                  gated steps pass)
```

- The customer works **sequentially, at their own pace, with progress saved**. Several people at the customer work in parallel and see each other's progress (the one requirement that killed the single-file HTML predecessor).
- Both sides — customer and Aceve — see the same status the whole time.
- The final step is **gated**: it unlocks only when every gated step before it is complete. Gating is real, not decorative (verified in the Stitch capture: the locked screen lists exactly what is outstanding).
- The two-phase structure originates in the 2026-06-17 scoping and is baked into all three prototypes.

## 2. Entry

1. Deal is closed-won in Salesforce. Salesforce sends the outbound notification — correct sender, logged on the Account — carrying a **deep link into the portal**, not a questionnaire (decision 2026-08-20: Salesforce owns the message, the portal owns the answer).
2. The customer logs in (external identity — leading candidate Aceve One Platform, unconfirmed; `STATUS.md` Open Q2) and lands in a portal **already seeded from Salesforce**: company info, contacts, region, products owned. Never ask for data we already hold — seeded fields are shown for confirmation, not re-entry.
3. An **agreement gate** sits before anything else: "Vi har ett signerat avtal med Aceve för [product]" (Stitch header). No agreement, no flow.

## 3. Phase 1 — Preparation, step by step

Steps, fields and validation below are from Prototype A (authoritative flow definition) enriched with the Stitch screen capture. `*` = required.

**1. Välkommen** — intro, not gated. Two-card explainer of the two phases. This is where the reused package information belongs (what is included, timeframe, the customer's own effort, responsibility split — lift the structure of `Informationsblad_Standardimplementation_Next_*.docx`, parameterise the content; `STATUS.md` Next Action 23).

**2. Företagsuppgifter** — Juridiskt företagsnamn\*, Företagsprefix/akronym\*, Organisationsnummer\*, Fakturaadress; then Land, Språk. Pre-filled from Salesforce where held. The Stitch subtitle is a load-bearing design idea: *"Land och språk styr vilken produkt och vilka webbinarier ni lotsas till"* — country + language route the customer to the right product variant and training. Keep it customer-visible.

**3. Er verksamhet & bakgrund** — work types (multi-select chips), approx. office staff, approx. field workers, region(s), offices, local/national/international\*. Then the **legacy-source branch**: a toggle naming the source system ("Vi kommer från Byggsamordnaren (BSO)" in case one), which when on reveals conditional fields — for BSO an IT contact (Namn\*, E-post\*, Telefon), because the BSO export is not self-service. Generalised rule: *the source system decides which extra fields and which export route apply.*

**4. Superanvändare** — repeating rows: Förnamn, Efternamn, E-post, Roll. Live counter, **minimum 2 valid** (valid = first name + last name + email containing `@`). Email doubles as the webinar invite address. **Delegation is a core mechanic:** the customer's lead project manager invites colleagues and delegates responsibility to them — today modelled per data category (each DataSet carries an assignee; delegation across several people was Oskar's push, 2026-08-19, and Carl's 2026-08-20 review confirms the intent). Finer-grained delegation — individual fields or sub-steps within a category — is an expected refinement to model in the registry once the requirements owner and customer feedback confirm the need; the data model should not preclude it.

**5. Webbinarier** — three named trainings for Next (Ny i Next; Grundläggande ekonomiflöde; Budget, inköp och prognos), one checkbox **per superuser per webinar**, all required. Gated on step 4. Which webinars appear is configuration per product/country. (A training-portal integration with tracked certification is a candidate extension, not agreed scope — `STATUS.md` Open Q16.)

**6. Ansvarsfördelning och databehandling** — linked responsibility-split document (PDF), then three separate confirmations: (a) read & understood the responsibility split, (b) approval that AI-based tools (incl. Ingestro) are used in processing, (c) the customer takes responsibility for informing their own staff. This three-way split is sharper than a single consent block — it is the starting draft for Legal (`STATUS.md` Open Q8).

## 4. Phase 2 — Data migration, category by category

**7. Migrationsplan** — the pivot step, previously unseen until the 2026-08-20 Stitch capture. Three parts:

1. **Bulk load-in (optional):** a GI-mall dropzone — one Excel file, one sheet per data type; the importer identifies sheets and routes them to the right import step. This is the "assisted bulk load-in" of design principle 3: bulk is a *starting point* the customer then works through step by step, not a separate mode.
2. **Source-system acknowledgements:** e.g. for BSO, only projects with status *Pågående* migrate; the customer confirms they understand. Per-source configuration.
3. **The method matrix — one row per data category, method chosen per row.** Four method types: **Direktimport · Excel · Integration · Manuellt**, with per-row chips (e.g. GI-mall / Excel / Integration / BSO-export / Hoppa). This is the key insight of Eric's design: *"sequential vs bulk" was never binary, and complexity is chosen per category, not per customer.* It is also the working candidate answer to complexity tiering (`STATUS.md` Open Q9/Q33).

**8…N. Per-category import steps.** Shared layout per category:

- **VÄLJ IMPORTMETOD**: GI-mall sheet (disabled until a GI-mall is uploaded) / upload any Excel with Ingestro column matching / Hoppa över ("done manually after go-live").
- **Semantic model shown up front:** the target fields as chips, mandatory ones highlighted — the customer sees what "done" means before they start.
- The **Ingestro Importer SDK** (embedded, browser-side) does mapping, validation and cleaning: AI proposes column matches, the customer confirms; per-cell validation at error/warning/info level (hard errors only where the import would actually break; soft warnings where the rule is a convention).
- On completed import, rows land in the **portal's own staging store** (never in Ingestro — `PROJECT-BRIEF.md` §5.1), the category is marked complete, and the next category unlocks. Returning later means returning to the staged DataSet, not to a paused importer session.
- Each category carries an **assignee** (one of the superusers), its own status, and versioning — a re-upload is a new version, not an edit.

**Category list and order are configuration, currently unconfirmed.** Three artefacts give three answers (Stitch sidebar 7; Stitch Migrationstidslinje 11 + 4 manual; sandbox 17). Two ordering constraints are documented: chart of accounts first (every source agrees), and Timpriser before Användarregister (the Stitch field *"Yrkesroll (från timpriser)"*). PS must confirm one authoritative list — `STATUS.md` Open Q33. **The build must not need to care:** the list is registry data.

**Configuration questions ride in the same flow.** To the customer there is no difference between "upload your price list" and "which Fortnox account is your standard cost account" — configuration answers are sequential steps like any other, each answer carrying a destination (import mapping / product API field / provisioning parameter). Source material: the `Kundmall - Integration Fortnox / Visma Admin / E-invoice` question batteries (`STATUS.md` Next Action 22).

## 5. Approval and completion

1. **Two approval gates per DataSet:** customer approval, then Aceve approval. Both live on the staging object — Ingestro has no review workflow, the portal owns this.
2. **Skicka & boka uppstart** unlocks when every gated step passes. Until then it shows exactly what is outstanding.
3. On submit: **exactly one completion record in Salesforce** carrying what the receiving side needs to act (decision 2026-08-20 — Zendesk removed as target, basis unverified, `STATUS.md` Open Q34). One kvittens on the corresponding PSA milestone (direction, contingent on Open Q38).
4. Go-live (Phase 2 of the project, not of this flow): product binding, provisioning, migration job writes approved staged data to the product API — batched, per-row receipts, human confirm as the default (see design principle 5 — verified flows may graduate to automation).
5. **After binding, the flow keeps working.** Go-live is a binding event, not the end of the portal: categories not yet migrated, or supplementary data during the implementation, run through the same upload → validate → approve → migrate path into the now-existing database (Carl, 2026-08-20).

## 6. The internal view (backoffice)

Not designed yet — requirements from the 2026-08-19/20 sessions (`STATUS.md` Next Action 9, Open Q11/Q15):

- Which customers are where, waiting on what, per data category and assignee.
- Stall detection: a named internal person is alerted when an import fails or a customer stalls (escalation threshold proposal: 14 days — Oskar, unvalidated default).
- Aceve-side approval queue for submitted DataSets.
- Staff authenticate against corporate Entra, customers against One Platform — a multi-IdP application by design (`research/Identity-OAuth2-One-Platform.md`).

## 7. What is deliberately not in this flow

Product funnel / lead qualification; ongoing post-go-live imports (Data Pipelines); the BSO export tool itself (a file arriving "by another route" is a supported input, not an exception); template sales; in-portal row editing after submit (corrections happen inside Ingestro before submit, or as a new version — deferred decision, `PROJECT-BRIEF.md` §5.1).
