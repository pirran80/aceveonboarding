# Aceve Product Portfolio and Standard Packaging

*Reference document. Written 2026-08-20 by Carl Bäckström (+ Claude), from the Infohub "Products at Aceve" page, the Salesforce product catalogue held in the Nexus (PSA) deployment material, PS delivery documentation, and public product sites.*

*Written for one purpose: the portal treats modules, fields and destinations as configuration (`PROJECT-BRIEF.md` design principle 7). That principle only holds if we know what actually varies across the portfolio. This document is the evidence base for that.*

---

## The finding, before the detail

**There is no group-wide packaging scheme, and Next Project's Foundation / Core / Professional is not the pattern others follow.** Next is the only Aceve product that uses *Core* as a package name. Across the portfolio, packaging falls into four different archetypes, the same tier words mean different things in different products, and several products have no tiers at all.

Three consequences for the portal:

1. **Package cannot be a fixed enum.** Any hardcoded list of tier names is wrong for most of the portfolio the day it is written.
2. **Bind on the Salesforce product record, not on a product or package name.** The names collide across products; the records do not. Note that the obvious candidate key is not yet usable — see Part 4.
3. **Onboarding is packaged separately from the product, in most products that package it at all.** That is good news: the portal's flow can be selected by the *onboarding* item rather than by the product tier, which is a smaller and more stable thing to configure.

---

## Part 1 — The portfolio

The authoritative internal list is the Infohub page **"Products at Aceve"** (owner Magnus Öhrman, last modified 2026-07-17), which sorts products into five lifecycle stages. It lists 28 products.

The page describes itself as *"part of our soft-launch and is a work in progress. Later product additions still not categorized."* Two consequences: the AI-native products **Aceve Lume** (installation) and **Aceve Rise** (construction) do not appear on it, and the "Not Yet Integrated" bucket is a holding pen rather than a judgement.

### Agentic Modernized Products
*"Actively being rebuilt with AI-native, agentic engineering, representing the most current generation of the product."*

| Product | What it is |
|---|---|
| **Accurator** | Procurement automation for construction |
| **Integrator** | Compliance/documentation toolkit for Norwegian trades, white-labelled through industry partners and wholesalers |
| **Craftnote** | Collaboration app for trades, built on a digital site folder. Lead product in Germany |
| **Tracked** | Project follow-up and BI on top of a finance system |

### Our Active Products
*"Fully supported and in active use, with regular updates and ongoing investment where AI path is either initiated or pending."*

| Product | What it is |
|---|---|
| **Next Project** | Project management and financial control for construction |
| **Entré** | Full-scale ERP for construction and installation. The page adds: *"It also comes in an SMB packaging - Office!"* |
| **Ordrestyring** | Task and order management for craftsmen and small trades, mobile-first (DK) |
| **Rekyl** | Business management from first contact to completed job |
| **Dox** | Document management for construction projects, tightly integrated with Next Project |
| **KlarPris** | Purchasing portal aggregating wholesaler prices; integrates with Entré, Rekyl and Ordrestyring |
| **KlarCalc** | Calculation and offer tool for electrical and plumbing trades |
| **Vehicle** | GPS driving log and vehicle tracking, cross-sold into the other products |

### Products in Maintenance Mode
*"Stable and supported for existing customers, but kept running rather than actively evolved through new development."*

**Chisa** (DK project economy) · **PRI Handel** (e-commerce/data exchange for retail chains and wholesalers) · **X-Paja** (legacy FI ERP) · **EDC/ETJ** (legacy FI site-management system, *Työmaajärjestelmä*)

### Sunset Transition
*"These are products that are being phased out, with customers migrating to a newer Aceve product. Not taking on any new customers."*

| Product | Migrating to |
|---|---|
| **Byggsamordnaren (BSO)** | Next Project — this project's case one |
| **Jublo** | A new built-in communication feature in Ordrestyring |
| **Eldata** | KlarCalc |
| **Next Field** | Next Dox |
| **Worker** | **No migration path.** Aimed end-of-life Dec 2026 |

### Not Yet Integrated
*"Our more recent additions to the Aceve family that we haven't integrated (and not categorized) fully yet. Don't worry, we'll get there!"*

**Syntess Atrium / Spectrum** (NL ERP) · **ENK** (NL) · **Cafca** (BE, NL and FR) · **Deddo** (NL, small firms) · **Ibis** (NL/BE cost estimating, industry standard for large contractors) · **KPD** (BE modular ERP for large contractors) · **Publican** (AI tender-document analysis, inside KPD's tendering platform)

---

## Part 2 — Standard packaging, product by product

Read the "Packaging model" column first. It matters more than the names.

| Product | Packaging model | Named packages | Source |
|---|---|---|---|
| **Next Project** | Named editions | **Foundation · Core · Professional** | Evidenced three ways and symmetrically: an `Informationsblad_Standardimplementation_Next_*` per tier; `SOW Mall_Foundation.docx` / `SOW Mall_Core.docx` / `SOW Mall_Professional.docx`; and `SE`/`NO`/`UK` × Foundation/Core/Professional product groups in Salesforce |
| **Entré** | Named editions (new) over a modular base | **Foundation · Professional · Enterprise** (+ *Custom*) | `Nya paketeringen - Licenser.pptx` (marked *Preliminärt*); three matching Salesforce product records and three dedicated pricebooks |
| **Entré Office** | Licence types + delivery packages | Licences: **Administratör · Order och Tid · Tid · Vehicle**. Delivery packages: **Grundpaket · Projekt · Levreskontra/redovisning · Redovisning** | `entre` skill (from hantverksdata.se); `Utkast - NY Uppstartsprocess - Entré Office.pdf` |
| **Rekyl** | Named editions | **Starter · Pro · Elite · Enterprise**, plus branch add-ons **Servicepaket** and **Entreprenadpaket** | Public rekyl.nu/priser-och-paket; four matching SOW templates in the Rekyl Process Library; Salesforce |
| **Craftnote** | Named per-user licence types | **Büro Plus · Büro · Baustelle** (Büro mandatory, min. one) | Public craftnote.de/preise |
| **Dox** | Named editions × project size band | **Standard · Premium · Premium+**, crossed with build-cost bands | Salesforce catalogue, product-group values `SE Dox` and `UK Dox` |
| **Ordrestyring** | Contract forms + modules | **Standard licens · Fleksibel licens** — contract forms, not feature tiers ("adgang til hele systemet") | Public ordrestyring.dk/priser |
| **KlarPris** | Named composable packages | **Indkøbspakken · Datapakken · Kalkulationspakken** (DK) / **Inköpspaketet · Datapaket** (SE) | Public klarpris.dk/priser, klarpris.se/priser |
| **Accurator** | Company size tiers + per-seat | **Företagslicens Liten · Mellan · Stor**, plus Användarlicens | Salesforce catalogue, product group `SE Accurator` |
| **KlarCalc** | Sized by user count | No editions | Salesforce catalogue |
| **Vehicle** | Modules + fleet bands | No editions | Salesforce catalogue |
| **Integrator** | Content modules, bundled per partner chain | Modules **NIK · FDV · KS · IKK**; bundles are chain-specific | Salesforce catalogue |
| **Chisa** | System licence + per-seat, modular | No product editions | Salesforce catalogue |
| **PRI Handel** | Managed service, per transaction | No editions | Salesforce catalogue |
| **X-Paja / ETJ** | Licence + maintenance + per-user; ETJ by access period | No editions | Salesforce catalogue (Pajadata_Finland) |
| **Eldata** | Per-user, membership-dependent | One variant, **Eldata Proff** | Salesforce catalogue |
| **Worker · Jublo · Tracked** | Sold as a module or a flat subscription | None found | Salesforce catalogue; no packaging data found for Tracked anywhere |
| **Syntess Atrium** | Named editions | **Business · Professional · Enterprise** ("basispakketten") | Public syntess.nl |
| **ENK** | Named editions | **Basic · Plus · Pro**, extended by named apps | Public enksoftware.nl |
| **Ibis** | Named licences per product line | **Start · Pro · Expert** per line, plus Viewer/Inspectie/Mobiel where relevant | Public ibis.nl |
| **Deddo** | Named subscription tiers | **Deddo · Plus · Pro** | Public deddo.nl/prijzen |
| **Cafca** | Modular, mandatory base module | No tiers. Modules: Projecten (compulsory) · Planning · Aankopen · Service · Tijdsregistratie · Voorraad | Public cafcasoftware.be/prijzen |
| **KPD** | Modules + bespoke proposal | No tiers. Modules: Tendering · Publican · People · Project · Logistics · Finance | Public kpd.be |
| **Publican** | Volume of tender dossiers | None published | publican.be; internal KPD draft pricing file |

### The four archetypes

1. **Named editions** — Next, Entré, Rekyl, Dox, Syntess Atrium, ENK, Ibis, Deddo, Craftnote. A ladder of feature sets.
2. **Modular / à la carte** — Cafca, KPD, Ordrestyring, Vehicle, Integrator, KlarPris. The customer composes; there is no ladder.
3. **Sized by something countable** — Accurator (company size), Dox (project build cost), KlarCalc (users), PRI Handel (transactions), ETJ (access period), Vehicle (fleet size).
4. **Managed service / flat subscription** — PRI Handel, Jublo.

Several products are two of these at once. Dox is a named edition *crossed with* a build-cost band. Rekyl charges a company base fee *plus* per user, split desktop and mobile.

### The vocabulary collides

**Professional** is a Next tier, an Entré tier, a Syntess tier and a KlarPris onboarding tier — four different meanings. **Pro** is an ENK tier, an Ibis licence, a Deddo tier, a Rekyl tier and an Ordrestyring onboarding package. **Enterprise** exists in Entré, Rekyl, Syntess and KlarPris onboarding. **Foundation** exists in Next and Entré and means something different in each.

This is why the portal must bind on the Salesforce record rather than on a displayed name. `Entré Professional` and `Next … SE Professional` are different records; the word "Professional" on its own is not a key.

---

## Part 3 — Onboarding is packaged too, and often separately

This is the most directly useful finding for the portal. In several products, the onboarding or implementation service is itself a named, sellable item, distinct from the product tier:

| Product | Named onboarding items |
|---|---|
| **Next Project** | `Quick start - Self service onboarding` (one per family: SE Foundation / SE Core / SE Professional), plus `Virtual`, `Hybrid` and `Tailored` delivery variants |
| **Rekyl** | Implementation Starter / Pro / Elite / Enterprise — matched one-to-one to the product tiers |
| **Ordrestyring** | Start-up Pro · Start-up Premium · Start-up customized, each in three delivery formats, each with a matching Follow-up |
| **KlarPris** | Start-up Light / Basic / Standard / Professional / Enterprise, plus Customized, Partner, Chain BI |
| **Chisa** | Onboarding Light · Onboarding Normal · Onboarding Customized |
| **Entré Office** | Personlig Uppstart · Självstyrd Uppstart (self-directed, via Learnster) |
| **Integrator** | Oppstartspakke · Opplæring · Bistand sentral godkjenning |
| **Craftnote** | Onboarding Professional OnSite / Online |
| **KlarCalc** | Start-up banded by user count |

Where onboarding is *not* packaged — Jublo, ETJ, X-Paja, Eldata, PRI Handel — it is a single start-up fee or hourly work.

**Why this matters.** The portal does not have to understand every product's feature ladder. It has to understand which onboarding item was sold, because that is what determines which preparation flow the customer should see. That is a much smaller configuration surface, and it is already a structured field in Salesforce.

---

## Part 4 — Where the real source of truth is

Aceve already maintains a structured product and packaging catalogue: the **Salesforce product catalogue**, exported and worked in the Nexus (PSA) deployment material (`Products To Services Master List.xlsx`, `Nexus_New_Products_Master_V4.xlsx`, `Products & Pricebooks.xlsx`, `Master Products_Pre Go-Live_Entré_Office_PRI_Tracked.xlsx`).

It carries most of the dimensions the portal needs. Field names below are as they appear in the exports:

| Dimension | Field / concept | State |
|---|---|---|
| Product grouping | `Product_Group__c` — values include `Packages`, `Package add-ons`, `Package users`, and per-market groups such as `SE Foundation`, `SE Core`, `NO Professional`, `UK Core`, `SE Dox`, `SE Accurator` | **Populated.** This is the field that actually carries package identity |
| Owning company | `HVD_Company__c` — `Hantverksdata_Sweden`, `Handverksdata_Norway`, `Pajadata_Finland`, … | **Populated** |
| Family | `Family` — e.g. `Standard Rent` on Entré rows | Populated, but coarser than `Product_Group__c` |
| Pricebook | Pricebook2 / PricebookEntry. Named books include `Entré Foundation`, `Entré Professional`, `Entré  Enterprise`, `Entré Office`, `Ahlsell Office`, `Next One Price Book 2026`, `NO Price Book`, `Rekyl Price Book`, `Orderstyring Price Book` | Populated, but **not one book per package** — Next runs on a single `Next One Price Book`, with the tier carried in `Product_Group__c` instead |
| Recurring flag | `Is_MRR__c` | Populated |
| Onboarding routing | `Onboarding_Group__c` — e.g. `Customer_Onboarding_Sweden`, `Customer_Success_Norway`, `Rekyl_Services`, `Start-Up-Product`, `Nor_Internal_Control` | **Partly populated.** Filled for Next, Rekyl, Norway and Finland rows; **blank on the Swedish Entré package rows**, and `Products To Services Master List.xlsx` carries a hidden sheet titled *"Products Without Onb.Team"* |
| Product code | `ProductCode` | **Exists as a column but is blank on the rows sampled**, including every Next Foundation/Core/Professional row. Not usable as a key today |

**The recommendation that follows:** the portal should not maintain its own list of products and packages. It should read them from Salesforce, which `PROJECT-BRIEF.md` already establishes as the seeding source, and which design principle 4 ("never ask for data we already hold") already points at. A hand-maintained package list in the portal would be a second source of truth that drifts — and given how much of this material is currently in draft, it would drift fast.

**Two things to settle before building against it.** First, what the portal keys on. `ProductCode` is the natural key and is empty, so the practical binding today is the Salesforce record Id plus `Product_Group__c`. That is workable but it means the portal is coupled to a field the Nexus programme is still shaping — worth one conversation rather than a silent assumption. Second, `Onboarding_Group__c` is the natural hinge between *what was sold* and *which preparation flow to show*, and it is already named as such — but a hidden sheet listing products without an onboarding team says the mapping is incomplete. Completing it for the products the portal covers is small, concrete work that needs no developer.

---

## Part 5 — Contradictions, gaps and things to be careful with

**Entré Office: separate product, or Entré's entry tier?** The sources disagree, and this is the one most damaging to get wrong.

- The `entre` skill states it as insider knowledge: Entré and Entré Office are *technically separate products*, do not share databases, and there is *no easy upgrade path* — moving up requires a new implementation and a data migration.
- The Infohub page says Entré *"also comes in an SMB packaging — Office!"*
- `PSA Architecture .pptx` plots Office as a `Product` value carrying the `Foundation` package on a single complexity ladder.
- A November 2025 sync note records the action *"Jämföra Office och Entré som paketeringar och skapa tydligare gränsdragning"* — so this is known internally and unresolved.

**Treat Office as a separate product currently being positioned as the entry tier of a shared ladder.** For the portal the practical consequence is concrete: an Office customer and an Entré customer are different provisioning targets, not the same target at different sizes.

**Entré's package names may not be live.** The three tiers rest on a slide marked *Preliminärt* (March 2025) plus Salesforce codes. The `entre` skill — otherwise the deepest internal source — describes Entré's licence model as *"Modulbaserat"* and does not mention Foundation/Professional/Enterprise at all. Either the skill predates the new packaging or the packaging has not rolled out. Unresolved.

**Packages are country-specific.** Foundation/Professional/Enterprise appear only for Sweden. Norway sells Entré Office as three licences with Norwegian-named services and a user-count-banded onboarding ladder that Sweden does not have. Finland has only a thin Office presence. Entré does not appear in Danish at all — the Danish catalogue is Ordrestyring and KlarPris. Any assumption that a package name means the same thing in two countries is unsafe.

**White-label and chain-branded packages are a real category.** `Ahlsell Office` runs as a parallel branded variant of Entré Office in both Sweden and Norway with its own mirrored licence set; `Comfort` and `Bad & Värme` are Swedish chain-branded Entré packages; Integrator is sold white-labelled through a range of named Norwegian partner chains. A portal that models only Aceve-branded products will not fit these.

**Delivery model splits the portfolio more sharply than packaging does.** Every Benelux product except one has no self-service path at all — the entry point is a demo request, and onboarding runs from a few hours of mandatory training to a multi-stage implementation with data migration. **Deddo is the sole exception**: free trial, self-signup, in-product purchase, no services organisation involved. A shared pre-onboarding model has to accommodate that split rather than average over it.

**Products with no packaging data found at all:** Tracked, Publican (nothing published), Syntess Spectrum (no public presence found; appears only as "Atrium/Spectrum" internally). **EDC** could not be resolved as a product name in any catalogue and may be an alias.

**A formal service catalogue does not exist.** `PSA Architecture .pptx` states it plainly: *"A formal Service Catalogue is absent, resulting in no guidance for service inclusion, pricing, or Statement of Work (SoW) creation."* A `Tjänstekatalog.xlsx` exists but its own planning tab still has open items. This is the gap the Nexus programme is closing, and it is the reason so much of the above sits in draft.

---

## What this changes for the portal

Nothing in `PROJECT-BRIEF.md` is contradicted. Two things are sharpened:

- **Design principle 7 is now evidenced, not asserted.** "A hardcoded module or field list anywhere in the codebase is a defect" was a judgement call in August. The portfolio evidence makes it a fact: four packaging archetypes, colliding tier names, country-specific package sets, white-label variants, and a large share of it in draft.
- **The configuration hierarchy has a shape.** *Product code → package → add-ons → onboarding item → module and field set*, with country and legal entity as parallel dimensions rather than as part of the package. Sourced from Salesforce, not maintained by us.

---

## Verification status

- The Infohub page is self-declared *"a work in progress"*. It is the best internal list that exists, not a ratified portfolio register. Lume and Rise are absent from it.
- Entré's Foundation/Professional/Enterprise rests on a slide marked *Preliminärt* and on Salesforce codes; it is contradicted by the `entre` skill. **Unresolved.**
- The Entré module-to-tier mapping exists only as a grid on slides 2–3 of `Nya paketeringen - Licenser.pptx`. It was read through text extraction without layout, so *which* module sits in *which* tier could not be established. Anyone needing that table must open the deck visually.
- `Entré Office - Sync 2025-11-06.loop` is likely the most current statement on the Office-versus-Entré question but could not be opened through the connector. Worth opening by hand.
- The KPD packaging material is a **draft** with several items flagged "not there yet".
- The Salesforce exports were read by targeted search, not end to end — `Products To Services Master List.xlsx` returned 5 of 17 sheets before the read budget ran out, and the Entré/Office export truncated part-way. Absence-of-value findings in those files are strong but not exhaustive; additional package names may exist that are not listed here.
- `Price Books Used 2026.xlsx` is Purview-encrypted and could not be opened through the connector. The pricebook findings rest on the *Pricebooks* sheet of `Products & Pricebooks.xlsx` (2026-06-08).
- The public-website packaging rows in Part 2 (Rekyl, Craftnote, Ordrestyring, KlarPris, Syntess, ENK, Ibis, Deddo, Cafca, KPD, Publican) come from one research pass and have not been independently re-checked.
- This document contains no prices, hours, customer counts or revenue figures, per the standing rule in `STATUS.md` §Figures. The only count is the 28 products listed on the Infohub page, which is verifiable against that page.

## Sources

**Internal — SharePoint**

| Source | Location |
|---|---|
| Products at Aceve (Infohub) | `/sites/infohub/SitePages/Our-Products.aspx` |
| `Products To Services Master List.xlsx` | Nexus (PSA) → 01_Implementation → 02_Discovery → Products & Service Items |
| `Nexus_New_Products_Master_V4.xlsx`, `Master Products_Pre Go-Live_Entré_Office_PRI_Tracked.xlsx` | Nexus (PSA) → 01_Implementation → 05_Deployment |
| `PSA Architecture .pptx`, `PSA Leadership - Job Aids.pptx` | Nexus (PSA) → 01_Implementation |
| `Nya paketeringen - Licenser.pptx` | HVDSE-D Management Team → General → Paketering |
| `Informationsblad_Standardimplementation_Next_*` | Core Delivery Blueprint → Next → Dokument PROMO |
| `SOW Mall_Foundation.docx`, `SOW Mall_Core.docx`, `SOW Mall_Professional.docx` (+ `_Intern` and `_Small` variants) | Core Delivery Blueprint → Next → Dokument PROMO → SOW |
| `Utkast - NY Uppstartsprocess - Entré Office.pdf` | Core Delivery Blueprint |
| Rekyl SOW templates (Starter / Pro / Elite / Enterprise) | Rekyl Process Library |
| `KPD 2026 Pricing & Products_Draftv05052026.xlsx` | /sites/KPD-Sales/Shared Documents/Pricing |

**Internal — bundled skills:** `entre` (Entré and Entré Office), `aceve-product-context` (group context; note its portfolio list is incomplete relative to the Infohub page).

**Public product sites:** rekyl.nu/priser-och-paket · craftnote.de/preise · ordrestyring.dk/priser · klarpris.dk/priser · klarpris.se/priser · syntess.nl · enksoftware.nl · cafcasoftware.be/prijzen · kpd.be · publican.be · ibis.nl · deddo.nl/prijzen · aceve.com

---

*Last updated: 2026-08-20*
