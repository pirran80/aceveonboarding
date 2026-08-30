# ASSETS — what is inherited, and what to actually reuse

*Inventory of every file carried into this project, with an honest verdict on each. Written 2026-08-18; §3 updated 2026-08-20 after the full sandbox devbox was downloaded.*

> **Restructured 2026-08-20.** The flat `Onboarding Portal - handover/` folder was dissolved. Where files now live: research documents → `research/`; the Ingestro sandbox, Prototype A mockup (`BSO-preboarding-mockup.html`), `bso_to_next_transformer.py`, the signed MSA, `SF-Integration-One-Pager.docx` and the Magnus summary → `reference/`; the full devbox zip → `reference/sandbox-devbox-4hyyps.zip` (renamed from `sandbox (1).zip`); Prototype B and other BSO-era artefacts → `archive/bso-prototypes/`; superseded documents and the April 2026 Next-native track → `archive/`. Deleted outright: two `.docx.pre-figure-removal.bak` files, `bso-onboarding-handover.zip` (duplicate of files kept in archive), and `BSOExcel_export_till_next_2.0/` (~135 MB of a Windows executable owned outside this project — see `PROJECT-BRIEF.md` §6; it remains available from BSO tooling owners). File paths in the body below are pre-restructure; use this map.
>
> **Also catalogued 2026-08-20, previously loose in the project root:** `archive/april-track-next-native/` holds the April 2026 handover (`handover-next-onboarding-tool-promo.md`) and prototype (`next-onboarding-tool-v2.jsx`) from the earlier *Next-native onboarding tool* track — a tool living as a tab inside Next Project. Its premises (native in Next, package-tiered checklists) are **superseded** by the standalone product-agnostic direction, but three things in it remain useful: the read-never-write principle (carried forward), the six-phase process model with exit criteria (candidate input to `STATUS.md` Open Question 37 on phase models), and the SharePoint source map of PROMO delivery material (§7 of the handover). Historical — do not build from it.

Everything listed below is in this folder, including the Ingestro sandbox source recovered on 2026-08-18 (§3). Nothing here is production code — the value is in the **structure, field definitions, mappings and gating logic**, all of which were validated with real people and should be lifted rather than reinvented.

---

## 1. Prototype A — Carl's preboarding mockup (the flow definition)

**`BSO-preboarding-mockup.html`** — single-file clickable mockup. Aceve branding (Manrope, green palette), 8 UI languages, no build step. **This is the authoritative definition of the customer flow.** Reviewed and built on by Eric; the basis for everything since.

Steps, gating and progress logic, lifted verbatim from the source:

```js
steps = [
  valkommen   "Välkommen"                 — intro (not gated)
  foretag     "Företagsuppgifter"         — legal name, prefix, org.nr, invoice address, country, language
  verksamhet  "Er verksamhet & bakgrund"  — work types, #office staff, #field workers, regions,
                                            offices, local/national/international, BSO toggle,
                                            IT contact (name/email/phone) when BSO = on
  super       "Superanvändare"            — first name, last name, email, project role; min 2 valid
  webb        "Webbinarier"               — 3 webinars × 1 checkbox per superuser, all required
  ansvar      "Ansvarsfördelning"         — read & confirm + data-handling/AI block
  filer       "Förbered & ladda upp"      — file upload + 3 BSO prep confirmations
  klar        "Skicka & boka uppstart"    — locked until every gated step is done
]
GATE = [foretag, verksamhet, super, webb, ansvar, filer]   // progress = % of GATE complete
LANGS = [Svenska, English, Norsk, Dansk, Suomi, Nederlands, Deutsch, Français]
```

Validation rules worth keeping as-is: a superuser counts as valid only with first name + last name + an email containing `@`; the BSO branch additionally requires IT contact name + email; the final submit unlocks only when all six gated steps pass. The sidebar already shows a greyed-out **"Nästa fas — Datamigration (Ingestro)"** placeholder, i.e. the two-phase structure is baked into the UI.

**Verdict: reuse the model, rewrite the code.** The step/gate/progress model, field list and validation rules transfer directly into step definitions as data (see the data-model direction in `PROJECT-BRIEF.md` §5). The HTML itself is throwaway — it uses real inputs but no form semantics or server-side validation, no WCAG 2.1 AA, in-memory state only, single-user.

## 2. Prototype B — the distributed single-file tool (what was actually shipped to customers)

**`bso-onboarding.html`** (+ `bso-onboarding Testkund.html.txt`, a filled-in test instance, and `bso-onboarding-handover.zip`, the June bundle) — a working tool, not a mockup. A consultant opens it in "template mode", fills in a setup modal, and downloads a customer-specific HTML file to send out.

Mechanics worth knowing:

```js
CONFIG = { kundNamn, konsultNamn, konsultEmail, ansvarDokUrl }   // %%SENTINEL%% placeholders
IS_TEMPLATE = CONFIG.kundNamn === "%%KUNDNAMN%%"                 // → show setup modal
STORAGE_KEY = "bso_v2_" + btoa(encodeURIComponent(kundNamn)).slice(0,16)
state = { users:[{id,firstName,lastName,email}], webinarChecks:{"userId_webinarId":bool},
          ansvarRead:bool, giDone:bool }
```
Customer file generation = `document.documentElement.outerHTML` + string replacement of the sentinels + download. Completion = a prefilled `mailto:` to the consultant listing all superusers and asking for the GI template as an attachment — which lands as a Zendesk ticket if the consultant's address is Zendesk-connected.

**Verdict: this is the baseline to beat, and the reason the project exists in its current form.** It failed on exactly one requirement — shared multi-user state. SharePoint Online does not execute JS in uploaded HTML files, and `localStorage` is per browser, so superusers cannot see each other's progress. The June recommendation was a Power Apps + SharePoint list rebuild; that has been **superseded** by the standalone-service direction (2026-08-10). Do not restart the Power Apps track. Reuse: the ticket-on-completion pattern, the per-user × per-webinar check matrix, and the sentinel-templating trick (a neat pattern for pre-seeding a customer instance).

Live webinar links carried in it (verified live for #1 and #3; #2 was not re-verifiable by fetch):

| # | Title | Link |
|---|---|---|
| 1 | Ny i Next | `helpdesk.next-tech.com/hc/sv/articles/24122929562524-Webinar-Ny-i-Next-2025-12-02` |
| 2 | Grundläggande ekonomiflöde i Next | `helpdesk.next-tech.com/hc/sv/articles/22232333563676-...-2025-09-09` |
| 3 | Budget, inköp och prognos | `helpdesk.next-tech.com/hc/sv/articles/26692106514716-...-2026-04-09` |

## 3. Prototype C — Eric's Stitch model and the Ingestro sandbox (RECOVERED 2026-08-18)

Both URLs are now **confirmed live**, and the sandbox source has been recovered into `reference/prototype-C-ingestro-sandbox/` — see `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md`, which is the single most useful technical document in this folder. Summary: the sandbox is titled *"Ingestro / [Aceve] Sequential Import Sandbox V2"*, implements **17 import modules with complete field lists**, generates Ingestro column definitions from those field lists, validates per cell at error/warning/info level, and unlocks modules strictly in sequence. It runs on a **non-commercial Ingestro licence key**. *(Superseded 2026-08-20: `styles.css` was listed here as unrecovered and at risk of dying with the sandbox. It is now in the folder — see the zip entry below.)*

Original descriptions of the two artefacts:

- **Stitch model, 2026-06-17** — `stitch.withgoogle.com/preview/1240464358428349762?node-id=e61f07237a6c4048a2c4a74f89d85672` (confirmed 2026-08-18). Built additively on Prototype A: the entire preparation phase kept ~unchanged, plus a new **"Fas 2 Datamigration [Ingestro]"** phase with one row per data category (migration plan, chart of accounts, user register, hourly rates & roles, price list, customer register, project list), each with import + column matching against the target semantic model. This is where the two-phase structure comes from.
- **CodeSandbox devbox** — `codesandbox.io/p/devbox/prod-framework-4hyyps`, preview at `4hyyps-3000.csb.app` (confirmed live 2026-08-18, no login needed). Uses the off-the-shelf `@ingestro/importer-react` **4.8.5** component; only the wizard/UI chrome is custom. Source recovered — see `reference/prototype-C-ingestro-sandbox/`.

**Verdict: highest-value asset in the project, and now safely in the folder.** The Ingestro integration pattern here is the one piece of genuinely load-bearing technical work already done. Two caveats carried into the build: it is a single hardcoded 1,653-line file (the opposite of the definition-driven model the portal needs), and it runs on a non-commercial licence key.

**`reference/sandbox-devbox-4hyyps.zip`** (project root, 10.9 MB, downloaded 2026-08-20) — the whole devbox, which supersedes the partial recovery above on two counts and adds a third asset nobody expected.

1. **`src/` is the complete original.** `styles.css`, `public/index.html`, `tsconfig.json`, `webpack.config.js` and exact dependency versions are all present, so the decay risk noted above is gone. The recovered `App.tsx` in `reference/prototype-C-ingestro-sandbox/` was verified character-identical to the original once whitespace is normalised — the recovery held, nothing needs redoing.
2. **`build/` is a *different* Ingestro demo**, left behind in the devbox: a "Thinkific Student Importer" built against the former package name `@getnuvo/importer-react`. It ships a 20 MB webpack source map, which contains that demo's full original source **and** makes the Importer SDK itself readable.
3. **Therefore the archive is our best documentation of what the SDK actually does** — six wizard steps including a multi-file join step, 30 built-in column types, a conditional-requirement validation set, a configurable four-layer mapping engine with threshold, a Handsontable review grid, a `baseUrl` self-hosting switch, and — most consequentially — a **licence-plan feature gate** that silently disables functionality client-side depending on what `plan_detail.features` returns at verification.

**Reuse it for:** the vendor's own integration pattern (the importer as a card inside an ordinary admin view, not a bespoke wizard), the column-definition and validation vocabulary, and the feature list to take into the next Ingestro conversation. **Do not reuse:** `build/demo.xlsx`, which is Ingestro's unrelated German energy-meter stress-test file.

Full evidence, with claims graded verified / reasoned / open, is in `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md` §"What the full sandbox download added". It raised open questions 29–32 in `STATUS.md` and sharpened 6, 22 and 26.

## 4. Data and mapping assets (the unglamorous, most reusable part)

**`bso_to_next_transformer.py`** (676 lines, pandas + openpyxl) — a working BSO-export → Next-import transformer. Reads a BSO Excel export, emits per-entity import files. Transforms: hourly rates, price list, projects (with historical cut-off), ÄTA, costs, hours. Carries explicit, human-curated mapping tables:

- `ERSATTNINGSFORM_MAP`, `BSO_STATUS_MAP`, `RESURSTYP_MAP`, `AVVTYP_MAP` — legacy value → target value, with per-customer extension points
- `SKIP_ACCOUNTS_PREFIX = ("1","2","8","9")` — balance-sheet accounts excluded from cost import
- `CUTOFF_DATE_DEFAULT = "2020-01-01"` — projects older than this classed as historical
- Known gaps encoded as warnings in the code: project manager is **always** empty in a BSO export (needs the Next login name filled in), customer is missing from the standard export, and BSO has no per-ÄTA costs

**Verdict: this is the seed of the mapping library.** It is exactly the accumulating asset described in `PROJECT-BRIEF.md` §3.6, currently expressed as Python constants instead of data. Port these tables into the mapping store rather than rediscovering them. The warnings encode real domain knowledge that took someone effort to learn.

**`BSO-onboarding-MALL.xlsx`** — the same flow as a co-authored Excel (an experiment in shared-SharePoint-folder collaboration; sheets: `Start`, `1-2 Användare & webbinarier`, `3-4 Ansvar & GI-mall`). Note it marks only 7 GI tabs as mandatory (Läs detta först!, Företag, Timpriser, Prislista, Projekttyper, Användarregister, Betalningsvillkor) and 4 as optional (Skattereduktion, Lönetillägg, Frånvaro, Påslagsmall) — **which contradicts both Prototype B and Prototype C. Prototype C settles it: 10 required + 7 optional (see `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md`), so the XLSX is the outlier. Still worth one confirmation from PS.**

The fuller **GI template tab structure**, from `bso-onboarding-handover.md` / `bso-onboarding.html`, is the de facto data-category list for a Next onboarding:

- *Required (white tabs):* Read this first, Company, Hourly rates, Price list, Project types, Tax reduction, Salary supplements, User register, Payment terms, Absence, Markup template
- *Optional (orange tabs):* Projects, Chart of accounts, Customers, Suppliers, Customer contacts, Supplier contacts, Other

Latest master templates live at: *ACEVE-D — Global Professional Services > Professional Services Hub > 06_Customer Documentation > Next > SE*.

**`BSOExcel_export_till_next_2.0/`** — the actual BSO export executable and its dependencies (Firebird/ODBC, unsigned `.exe`). Carried along **for reference only**; owned outside this project. It is the reason the BSO branch is not truly self-service (see `PROJECT-BRIEF.md` §6).

## 5. Documents carried over

| File | What it is | Still current? |
|---|---|---|
| `Sammanställning till Magnus - Onboardingverktyg.md` | The resource ask written for the 2026-08-12 deadline: meeting summary, phasing, competencies, estimate, business value | **Yes — the live thread.** Its §8 open questions are partly resolved; the Salesforce fields and complexity-tiering ones are still open in `STATUS.md`. Footer still says "validate with Eric before sending" |
| `Preboarding-Datamigration-requirements-brief.md` | The fullest single write-up (2026-06-17): goals, scope, Ingestro two-track model, matching/verification layer, RACI, risks | Mostly. **Outdated:** the timeline (early-August launch) and the assumption that someone else builds it |
| `BSO-preboarding-scope-onepager.md` | Short scope note + the BSO two-stage ticket flow + the product-funnel expansion idea | Yes, as scope reference |
| `BSO-preboarding-handover-Pierre.md` | The June handover to Pierre. Locked customer-step scope, multi-user requirement, the hosting constraint | Historical, but the constraint analysis is still the sharpest short statement of why a real web solution is needed |
| `bso-onboarding-handover.md` | Technical documentation of Prototype B + the Power Apps recommendation | Technical part yes; **Power Apps recommendation superseded** |
| `SF-Integration-One-Pager.docx` | The Salesforce ask: CRM→tool pre-fill and tool→CRM enrich field lists, phasing, and the request to be an early use case in Miguel/Andrew's integration strategy | Yes for the field lists and the ask. **Update before reuse** — it still carries a sunset date and a deadline in the body text. Both are BSO programme figures and are superseded; strip them before any reuse (see `STATUS.md` §Figures) |
| `Aceve-Ingestro-Underlag.docx` | The three-phase Ingestro case (internal pipelines → customer-assisted packaging → customer-led self-service) and the six questions put to Ingestro | Yes for the phasing logic; the questions were answered on 2026-08-06 |
| `Underlag - AI lab-ask till Magnus 2026-08-10.md` | Meeting prep + the actual meeting outcome in §7. Note: the document body opens with a date "correction" claiming the meeting was 2026-08-17, then records in §7 that it happened 2026-08-10. **2026-08-10 is correct** (confirmed via calendar); ignore the correction note | Yes, as the record of that meeting |
| `MSA Change Order - Ingestro & Aceve - 29.05.2026.pdf` | The signed licence. Business plan, EUR 1,199/month, 7,000 uploads/month, label "Next One Technology AB" | **In force** — the commercial ground truth |
| `Ingestro-call-prep.md` | Prep + agenda for the June 2026 Ingestro discovery call, incl. the 60-second use-case pitch | Historical; the pitch framing is still usable |
| `BSO-preboarding-flode.svg`, `Migrering_Flodesschema_BSO_Next.docx` | Flow diagrams | Reference |
| `Identity-OAuth2-One-Platform.md` | Technical note (2026-08-20) on One Platform as the identity candidate: Authorization Code + PKCE for customers, corporate Entra for backoffice staff, four verified constraints (redirect_uri whitelist, no token passing, headless auth unsolved, the Accurator anti-pattern), the reusable PCB service catalogue (BankID, Bisnode, Filedrop, Mail, SMS, Translations), and e-ID coverage beyond Sweden via the Signicat precedent in Aceve Rise | New. **Candidate, not decision** — nothing confirmed with One Platform Core. §8 holds the two questions that decide it. Basis for the `PROJECT-BRIEF.md` §5 identity update |
| `Internal-Landscape-Synergies.md` | Internal sweep (2026-08-20) of Confluence, SharePoint and Slack for initiatives that feed, fund, block or absorb this project: Aceve One Platform (identity — likely answers Open Q2), Project Nexus/Certinia PSA (closed 2026-06-30, no customer portal in its roadmap), the Salesforce integration freeze, Salesforce account de-duplication, the Customer Journey Workshop (answers Open Q10), and ONE Aceve ComEx | New. Claims graded [V]/[R]/[?] with source links; §9 lists proposed `STATUS.md` edits, not yet applied |
| `Competitive-Inspiration-Research.md` | External scan (2026-08-20) of comparable products — implementation portals (Rocketlane, GuideCX, Arrows) and embeddable data-import SDKs (Flatfile, OneSchema, Dromo, FileFeed) — plus adjacent patterns (Stripe Connect, fintech KYC, e-commerce migration wizards). Extracts UX/backend/design USPs and ties each to an existing `PROJECT-BRIEF.md` principle or `STATUS.md` open question | New. Vendor marketing claims only, not independently verified — see its own §6 |

## 6. Left behind in the BSO Sunset project on purpose

Customer lists and account reports, the migration tracker, readiness report, steering decks, and the BSO-specific friction analysis. This project needs the *lessons* from BSO, not its customer administration. If a specific figure is needed later, it lives in the BSO Sunset project folder.
