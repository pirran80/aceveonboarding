# Aceve Preboarding & Onboarding Portal — Project Brief

*Stable document. Vision, scope, architecture and data model. Changes rarely.*
*For volatile state (decisions, people, deadlines, open questions) see `STATUS.md`. For inherited files and reusable code see `ASSETS.md`. For the consolidated engineering brief derived from this document see `build/BUILD-SPEC.md` (added 2026-08-20 — it consolidates, it does not decide).*

*Owner: Carl Bäckström, Professional Services, Aceve. Written 2026-08-18 as the founding document of a standalone project, carved out of the BSO Sunset project where the idea originated.*

---

## 1. What this is

A web portal where a **new Aceve customer prepares and migrates their own data before we have provisioned anything for them** — before an account, licence or database exists. The customer logs in, works through their preparation and their data step by step, saves progress, and both sides see the same status the whole time. When the customer is done, our side is triggered automatically.

The pre-provisioning stage is the main track, not the whole life span. **The portal remains in use through the implementation when needed** — once a database exists and some data is migrated, remaining or supplementary categories are still prepared, validated and approved through the same flow (clarified by Carl, 2026-08-20). The architectural consequence is already consistent with §5.1: the migration job writes approved DataSets per category, so "go-live" is a binding event, not a one-shot data dump — categories can be migrated into an existing database after binding, through the same staging-and-approval path.

Two things make it different from a normal onboarding wizard:

1. **It exists before the product does.** The customer account is not tied to a product (Next, Entré, …) while the work happens. Product binding happens at the end, at go-live.
2. **It is where the data migration actually happens**, not just where forms get filled in. Preparation and data import are one continuous flow, not two disconnected phases.

## 2. Why it exists

Aceve is sunsetting BSO (Byggsamordnaren) and migrating the ICP-fit portion of those customers to Next Project. That is the trigger and the first real case, but it is not the reason the tool should exist long-term.

The structural problem it solves is generic: **onboarding cost scales linearly with customer count.** The cost per customer is consultant time, and consultant time does not scale — so PS capacity, not demand, sets the pace. Most data categories in a migration are still handled manually or conditionally; only a minority import automatically. Every new customer, on every Aceve product, in every country, hits the same wall.

This project carries **no capacity, volume, deadline or automation figures**. Those belong to the product or programme they were measured in — see `STATUS.md` §"Figures".

Two facts make this a delivery on an existing decision rather than a new idea to sell in:
- The June 2026 BSO steering report mitigates the risk *"CSM capacity: light-touch migrations risk overwhelming post-migration support"* with *"Define minimum viable onboarding scope & manage through on-boarding tool."* The onboarding tool is already named as the fix, in Produkt's own reporting.
- Ingestro (the migration engine) is already licensed — signed MSA change order 2026-05-29.

## 3. Design principles

These are the constraints that keep the thing from collapsing back into a Next-specific migration script.

1. **Product-agnostic by construction, not by intention.** Next Project is case one because of BSO. Nothing in the data model, URL structure, terminology or UI may assume Next. A Next-shaped tool loses buy-in from other product teams — Entré Office has already expressed interest, and buy-in is the scarce resource here.
2. **Standalone service, outside the product monoliths.** Talks to product APIs, is not embedded in one. Fewer dependencies, no release-train coupling, can be deployed independently. (Architectural direction from Eric Lindberg, 2026-08-10.)
3. **The customer does the work, sequentially.** Category by category, at their pace, with progress saved. We may bulk-load an existing export *into* the tool as a starting point (e.g. a BSO export), which the customer then works through step by step. Not a customer-facing bulk upload; not a pure blank-slate sequence either.
4. **Never ask for data we already hold.** Salesforce seeds the tool; the tool enriches Salesforce back. One source of truth.
5. **AI proposes, rules execute — human confirmation is the default, full self-service is the north star.** Column mapping and cleaning are AI-assisted; nothing is written to a live product database without an explicit human confirm. Two stacked checks: mapping verification (right source column → right target field) and data verification (values correct, mandatory fields satisfied). The confirm requirement is a default, not a ceiling: as flows are verified per product and customer type, they may graduate to full automation — a fully self-service onboarding is the north-star end state (Carl, 2026-08-20). Graduation is a deliberate, per-flow decision with evidence behind it, never a silent drift.
6. **Mappings are an accumulating asset.** Every approved mapping for a legacy system makes the next customer on that system cheaper. The compounding effect across a population of customers sharing one legacy system is the core economic argument — and it applies to any future legacy source.
7. **Modules and fields are configuration, never code.** Which modules a customer sees, which fields each module contains, which are mandatory, and what the accepted values are — all of it varies by product, country and customer size/segment, and will keep varying as the requirements owner and real customer feedback surface more (Carl, 2026-08-20). Every field must also carry its own destination — **one of three**, resolved at go-live: an Ingestro import mapping, a target product API configuration field, or a **provisioning parameter** (industry/branch template, modules to enable, country, legal entity). The third was added 2026-08-20 after the Oskar session; it is an extension of the same rule, not a new capability, and it is what makes "a small customer is delivered end to end through the portal" expressible without special-casing anything. A hardcoded module or field list anywhere in the codebase is a defect, not a shortcut. (Carl, 2026-08-18. The recovered Ingestro sandbox does exactly the opposite — 17 modules and ~200 fields hardcoded in one file — which is precisely the thing not to carry forward.)
8. **Multi-language and multi-country from day one.** The inherited mockup already carries 8 UI languages (sv, en, no, da, fi, nl, de, fr) and country/language as first-class company fields. Keep that; do not defer i18n.

## 4. Scope

### In scope

**Phase 1 — build and go live.** Goal: deployed and live against real customers, not a further prototype.

- Customer account and secure external login, **not bound to a product**.
- Salesforce seeding at Account level (company info, contacts, region, products owned, deal stage). Explicitly in Phase 1 — Carl's call, 2026-08-10: it delivers most of the perceived value at the preboarding stage and is not deferrable.
- Preparation flow (inherited, validated as a clickable mockup): welcome + agreement gate, company details incl. country/language, business profile, superusers, webinars, responsibility split and data handling, prepare & upload.
- Sequential data handling per category, with optional assisted bulk load-in.
- Ingestro Data Importer SDK embedded for mapping/validation/cleaning per category.
- Multi-user: several superusers working in parallel, seeing each other's progress. (This is the single hard requirement that killed the inherited single-file HTML tool — see `ASSETS.md` §2.)
- **Configuration questions captured alongside data.** The customer answers configuration questions in the same sequential flow as their data, because to the customer there is no difference between the two. Each answer carries a destination like any other field (principle 7). Phase 1 captures and validates them; executing them against a provisioned system is Phase 2. The written source already exists: the customer templates `Kundmall - Integration Fortnox`, `Kundmall - Integration Visma Admin` and `Kundmall - E-invoice` on the PS SharePoint are sequential question batteries with per-question help text and concrete destinations, and they should be converted into field definitions rather than rewritten.
- Completion signal: exactly one record in Salesforce, carrying what the receiving side needs to act. (Was "one ticket" against Zendesk until 2026-08-20 — see `STATUS.md` Decision log and Open Question 34, the basis for removing Zendesk is Carl's statement, not a sourced organisational decision.)
- Internal status view: which customers are where, waiting on what.
- The acute BSO→Next case running through it end to end.

**Phase 2 — product binding, provisioning and scale-out.** Bind the account to the target product at go-live; API-driven transfer into the provisioned database/licence; **provision the database itself from the customer's own answers, industry-adapted where the product supports it** (Entré Office already builds on a *"branschanpassad installation"*, so this is an existing product concept, not an invention — see `Utkast - NY Uppstartsprocess - Entré Office.pdf`). Note this is the point where the portal stops being read-only and starts writing: creating an empty database is not writing to customer data, but the exception is deliberate and needs its own control model — `STATUS.md` Open Question 36. Also in Phase 2: vary check-in intensity by customer complexity tier (a high/medium/low model is a working starting point); decide long-term ownership and operations.

**Phase 3 — portfolio and guidance layer.** Generalise to further Aceve products; evaluate Pendo Resource Center / Guides as the in-app guidance layer (Pendo is live on KlarPris, Rekyl, Ordrestyring; not on Next yet).

### Deliberately not in scope

- Product funnel / lead generation (qualify country, industry, size → right product). Real and valuable, kept as a separate later track so it cannot inflate Phase 1.
- Ongoing post-go-live imports (Ingestro Data Pipelines). Requires a licence add-on anyway.
- Clean-cut marking of migrated projects in BSO (belongs to the project-manager guide).
- The BSO export tool (`BSOExcel`) and its improvements — owned elsewhere, see §6.
- Template sales.

## 5. Architecture

Nothing below is built yet. It is the direction agreed across the June–August 2026 conversations, and the starting point for the first engineer.

```
Salesforce ──seed(Account, contacts, region)──►┐   Certinia PSA ──phase/milestone status──►┐
  (CRM)      ──outbound notification w/ link──►┤     (PS Cloud)         [read-only]        │
                                              │                                           │
                    ┌─────────────────────────▼───────────────────────────────────────────▼┐
                    │  Preboarding Portal  (standalone service)                            │
                    │  • external customer login, no product binding                       │
                    │  • organisation + case + progress state  ── owns its own state       │
                    │  • sequential category flow, multi-user                              │
                    │  • data + configuration answers, each carrying a destination         │
                    │  • Ingestro Importer SDK embedded (browser-side)                     │
                    └───┬─────────────────┬──────────────────┬───────────────┬─────────────┘
                        │                 │                  │               │
        enrich(status,  │  completion     │  one milestone   │  provision +  │ go-live
        profile, users) │  record on done │  kvittens        │  API write on │
                        ▼                 ▼                  ▼  product bind ▼
                  Salesforce         Salesforce         Certinia PSA    Next / Entré / …
```

**Reading the diagram.** Salesforce is the system of record for the customer and the sale, and keeps sending the outbound message — correct sender, logged on the Account, no shadow mail system — but it carries a deep link rather than a questionnaire; the portal owns the answer. The engagement record itself moves to Certinia under Nexus — *"when a deal is closed-won in Salesforce, PS Cloud automatically creates a corresponding project"* — so the portal reads engagement state from there, not from Salesforce. Certinia PSA (`PS Cloud`, part of Project Nexus, in the chain Salesforce → Certinia → NetSuite) supplies delivery status as a **read-only overlay**: the portal mirrors it for the customer but never derives its own state from it, because Nexus is mid-rollout and its own material is still marked *Work in progress* and *Not yet finalized*. In the other direction the portal writes exactly one thing into PSA — a kvittens on the milestone that represents "customer data complete and validated". Since a Certinia `Milestone` is *"linked to billing logic"*, that single write is what would let customer self-service advance billing; it touches Finance and revenue recognition and is therefore not decided here (`STATUS.md` Open Questions 38–39).

- **Hosting: IT-operated, like our other products.** Decided by Carl 2026-08-18. Driver: external customers must log in securely. This explicitly rules out the internal Backstage/ai-apps platform for the production portal — Backstage does not solve external customer identity. Backstage may still be fine for internal-facing companion tooling.
- **Identity** is an early, non-trivial decision: external customer login, multi-user per organisation, invite flow, before any product tenancy exists. **Leading candidate as of 2026-08-20: Aceve One Platform (PCB).** It runs OAuth2 Authorization Code + PKCE in production, with per-company SSO settings, 2FA/OTP, and context switching between companies and subdivisions — and already serves Entré, KlarPris, Rekyl, Accurator, Ordrestyring and others, which makes the portal structurally a One-Platform-native service rather than a Next-shaped tool with a portability promise. Aceve staff using the internal backoffice view authenticate separately against corporate Entra, so the portal is a **multi-IdP application** by design: customers on One Platform, employees on Entra. Two things follow that must be known on day one rather than retrofitted: **return URLs must be static** (One Platform whitelists `redirect_uri` on exact character match, with no self-service), and **the go-live handoff must not pass a token** to the target product — the OAuth2 model shares an SSO session, not a credential. **Still unresolved, and this decides it:** whether One Platform can hold an organisation and its invited users with no product entitlement attached. Full analysis, constraints, reusable PCB services and the open questions for One Platform Core are in `research/Identity-OAuth2-One-Platform.md`. Nothing there is yet confirmed with the platform team.
- **Ingestro** runs client-side in the browser (data does not pass Ingestro's servers — a GDPR advantage worth preserving). **Qualified as of 2026-08-20:** an opt-in feature, *"AI Mapping for field values"*, reportedly processes actual field content rather than only column headers. Until it is established whether that is enabled for us and what it transmits, the frontend-processing claim should not be repeated unqualified in anything customer- or steering-facing. See `STATUS.md` Open Question 26. The column-matching engine is the *same* Ingestro Data Importer component already used inside Next today (confirmed by Ingestro, 2026-08-06), so this is reuse, not new development. Note Team Phoenix is separately upgrading Next from Nuvo 2.x to Ingestro 4.x — align on version. **The Importer SDK is a transform function, not a store** — see §5.1 below, which is the decision that follows from that.
- **Licence reality:** signed plan = Data Importer **Business** (EUR 1,199/month, 7,000 uploads/month, label "Next One Technology AB"). **Not** included: Contextual Engine (the module aimed at variable legacy formats) and Data Pipelines (automation). Multi-brand expansion is priced per label (Organization Accounts: EUR 208.33/month up to 1,200 imports per contract year, stepping to EUR 700.00/month with 4,200 imports included) — relevant the moment a second product joins. Confirm a signed DPA is in place.
- **Known technical limits to design around:** product import can time out around 10,000 rows → batching/queue. Import order matters: chart of accounts → user register → hourly rates & roles → price list → customer register → project list (per the June 2026 requirements brief; other sources vary on where customers/suppliers sit, and the only point every source agrees on is that chart of accounts goes first). Price lists are the usual failure point and should be skippable/resolvable separately. Validate in two layers: frontend to stop bad input early, backend to guarantee integrity.

### 5.1 Where the data lives between upload and go-live (staging)

*Added 2026-08-20 (Carl + Claude). Direction, not yet built. The reasoning is recorded because the intuitive answer is the wrong one.*

The portal has to hold a customer's data for days or weeks: several people at the customer contribute different categories at their own pace, both sides confirm it, and only then is it written to a product database that did not exist when the work started. The obvious framing — *"save the Ingestro flow and come back to it"* — is the wrong problem to solve.

**The Importer SDK is a transform function, not a store.** Its entire privacy argument is that customer data never reaches Ingestro's servers. A resumable, server-persisted Ingestro session would require exactly the server-side state that makes that argument true today. Asking the component to be a store means giving up the one architectural advantage that has actually been verified.

So the question is not how to persist the importer. It is **where the truth lives between import and go-live** — and that has to be the portal's own staging store. Ingestro is a window into it, not the store itself.

```
Customer uploads a file
   ↓  Ingestro (browser): mapping + validation + cleaning
   ↓  onResults
Portal staging store             ← the source of truth
   • rows per DataSet, keyed on module-registry field ids
   • original file in object storage (traceability + re-run)
   • version, uploaded-by, timestamp
   ↓  customer approval, per module
   ↓  Aceve approval
Migration job → product API (batched, per-row receipt)
```

Nobody resumes a paused importer session. They return to a **DataSet in the portal**. Ingestro is re-run from scratch each time — it is cheap to re-run and expensive to try to preserve.

**The single decision that keeps this product-agnostic:** staged rows are stored against **module-registry field ids, never against a product's field names**. The binding `field id → product API field / Ingestro mapping` is resolved in the migration job, at go-live. This is design principle 7 carried all the way down into storage. A staging table shaped like a Next table is the same defect as a hardcoded field list.

**How this answers the requirements that drove the question:**

| Requirement | Where it is solved |
|---|---|
| Segmented and sorted per the target product's requirements | The module registry generates Ingestro's Target Data Model at runtime. The recovered sandbox already derives column definitions from a field list (`makeColumns()`); the work is moving that list out of code into the registry |
| Several users at the customer contributing data | A DataSet carries an assignee and its own status. Importer sessions are never shared between users — one step, N assigned people, N individual completion states |
| Coming back to the work later | Return to staged data, not to a modal |
| Confirmation from **both** the customer and Aceve | Two separate approval gates on the staging object. This cannot sit in Ingestro — no approval or review workflow is documented for the SDK |
| Migration into the product | A separate job reading approved staged data, batched around the ~10,000-row limit noted above |

**The mapping library must live on our side, and be fed *into* Ingestro.** Ingestro documents mapping reuse as model learning ("learns from every approved mapping"), not as a named, saveable, versionable template object we own. A feature called *Auto Remember Function* is listed in the signed plan's Appendix 1 with no definition anywhere — unverified, see §5.2. Therefore: store `source column → field id` in our own database, and generate Ingestro's `alternativeMatches` per customer at runtime. The sandbox already seeds aliases this way in code; the change is to feed it data instead of hardcoded strings. This makes design principle 6 an asset we own outright — portable across importer vendors, and free of personal data, so it survives deletion of the customer's staged data.

**The cost of this, which must be owned deliberately.** With staging, *we* hold customer data at rest before the customer has a provisioned product. "Data never passes Ingestro's servers" remains true, and remains worth stating — but it must not be read as *nobody stores anything*. What follows: a signed DPA, EU-region storage, encryption at rest, and a retention rule — delete staged customer data a defined period after go-live, keep the mappings.

**Alternatives considered and rejected:**

- *No staging; import each module straight into the product.* Fails on the project's founding premise — the product database does not exist yet.
- *File-only staging; store the source file plus the mapping, run the transform at go-live.* Attractive for minimising data at rest, except the source file is the personal data. And nothing can be reviewed or approved at row level without materialising it.
- *Ingestro Data Pipelines as the staging layer.* Pipelines is documented as a transit-and-transform path to a destination **you** own, not as a data store. It would deliver files into our storage — which is our staging layer, not Ingestro's. It is also an add-on outside the signed Business plan.
- *An editable grid on our side from day one.* Deferred. In-place correction belongs **inside** Ingestro before submit, where per-cell validation already exists; the portal's view is read-only after submit, and changing data means uploading a new version. Revisit once the flow is live.

### 5.2 What must be verified before §5.1 becomes a decision

None of these can be answered from the material in this folder. Items 1–4 are one conversation with Ingestro (Chris Zhang / Orlando Neto) and need no build resource.

1. Does a half-finished import in the Importer SDK survive a page reload? Not documented — `docs.ingestro.com/sdk/`.
2. What does *Auto Remember Function* (Business plan, Appendix 1) actually do? Undefined in every source we hold.
3. Can `alternativeMatches` be set dynamically per customer at runtime? The sandbox generates them in code; per-customer dynamism is not proven.
4. What counts as one billable "import" against the monthly contingent — per file, per completed import, or per multi-file upload? If a re-upload counts, it changes the design directly.
5. Where may staged customer data be held, under what retention (IT + Legal). Ties to the DPA question already open in `STATUS.md`.

### Data model direction (proposal, not decided)

The one modelling decision that determines whether this stays product-agnostic:

```
Organisation            — legal name, prefix, org.nr, country, language, SF account id
  └── OnboardingCase    — status, complexity tier, target product (NULL until go-live)
        ├── Users       — superusers, roles, invite state, per-user checklist progress
        ├── Steps       — generic step instances (definition-driven, not hardcoded)
        └── DataSets    — one per data category
              ├── assignee, status, version
              ├── source file(s) in object storage, detected schema
              ├── mapping (source column → module-registry field id) — versioned, reusable
              ├── staged rows — keyed on field id, never on product field names
              └── validation result, customer approval, Aceve approval, import receipt
```

Two things to get right early: **step and module definitions are data, not code** (so a product, country or segment variant is configuration), and **target schemas are registered per product** (so mappings resolve against "Next Project project schema v4", never against a hardcoded field list). Mappings are stored so an approved mapping for a legacy system can be proposed to the next customer on that same system.

Concretely, a module definition needs at least: `id`, display name and description per language, the ordered field list, per field a type, required flag, accepted values, alias list for AI matching — and a **binding**: which product API endpoint/field or Ingestro importer identifier this field lands in at go-live, per product. The recovered sandbox already generates Ingestro column definitions from a plain field list (`makeColumns()`, see `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md`); the job is to move that field list out of code into the registry and add the product binding.

## 6. The BSO case — how it plugs in without owning the project

BSO is Phase 1's proving ground, and only that. Two BSO specifics the portal must accommodate but not absorb:

- **The export step is not self-service today.** Getting data out of a customer's BSO instance means running an unsigned Windows executable (`BSOExcel`) against a Firebird/ODBC connection — in practice a remote-support session with a consultant driving it, or an IT-literate customer (assessment from an earlier analysis of the tool itself — *project memory*, not documented in the files here). That is why the inherited flow carries an "IT contact" field on the BSO branch. Open question, and it belongs to whoever owns BSO tooling, not to this project: does BSO data intake stay permanently human-mediated, or does someone scope a lighter customer-triggerable export? Either way, the portal should treat "a file arrives by another route" as a supported input, not an exception.
- **BSO is flexible, targets are standardised.** The same BSO field can mean different things per customer. This is exactly the per-customer pattern-recognition problem Ingestro's mapping layer addresses, and the reason the mapping library (§3.6) matters more than any single import.

## 7. What success looks like

- Lead time from signed agreement to go-live, down.
- PS hours per customer onboarding, down.
- Data quality at import, up (fewer error rows, fewer reworks).
- Customers through the queue per month, up.

**The measurement that does not exist yet and should:** a real before/after on one actual customer file — "X hours → Y minutes". Asked for by Magnus Öhrman on 2026-08-10, still outstanding. It is the single most persuasive artefact this project could produce in its first week.
