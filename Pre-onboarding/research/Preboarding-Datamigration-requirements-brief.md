# Preboarding & Data Migration for Next (Aceve) — requirements brief and handover

*Owner: PS (initiative lead). Date: 2026-06-17. For: technical/Ingestro lead, build/web, contract owner and steering (works as sync material, build brief and decision basis). Status: idea and foundation ready, handed over for execution. Roles are kept open on purpose.*

## Summary

A self-service tool where the customer prepares and migrates their own data, and where each completed step drives the next on our side. Two phases: Phase 1 Preparation (existing mockup) and Phase 2 Data Migration via Ingestro (extended in Stitch). The driver is BSO Sunset, but the tool must work for all new Next customers from the start, and is built to broaden across Aceve over time.

The goal is to capture as much of the customer's database as possible: ongoing projects and works plus the surrounding information around them, so the migration into our Aceve products is as seamless as possible.

## Goals and success criteria

All four matter:
- Shorter lead time from signed agreement to go-live.
- Less PS time per customer onboarding.
- Better data quality on the way in (fewer errors and reworks at import).
- More customers through the migration queue.

## Audience

The customer's superusers use the tool self-service. Internally it touches PS/onboarding, technical support and Next PS. This brief is for the team that executes and builds, and also serves as a decision basis upward.

## Scope

In scope now: Phase 1 (preparation), Phase 2 (data migration via Ingestro), and Validate and go-live.

Later (separate tracks, not core scope): product mapping (funnel to the right product), lead generator, ongoing imports via Ingestro Data Pipelines, and CRM/Salesforce integration (see Broader vision).

Out of scope: clean-cut marking in Byggsamordnaren (project manager guide), template sales.

## The solution

**Phase 1 — Preparation (foundation, exists as a clickable mockup).**
Welcome with an agreement gate, Company details (incl. country and language), Their business and background (geography, BSO toggle, IT contact for BSO), Superusers, Webinars, Responsibility and data handling, Prepare and upload. Hosted, multi-user, works for BSO and new Next customers.

**Phase 2 — Data migration via Ingestro (extended in Stitch).**
One row per data category: Migration plan, Chart of accounts, User register, Hourly rates and roles, Price list, Customer register, Project list. Per category: import and AI column matching against Next's semantic model.

**Validate and go-live.**
Review and sign-off following Ingestro's principle "AI proposes, rules execute" before going live.

**Completion loop.**
"Done" creates a ticket. For BSO today: technical support runs an export to the customer folder on SharePoint, then Next PS for kickoff. With Ingestro, the data intake moves into the tool itself.

## Ingestro (formerly Nuvo) — the engine behind it

The migration engine. Two products: Data Importer SDK (embedded self-service, what Next calls "Nuvo") and Data Pipelines (automated ETL). Frontend processing (data handled in the browser) is a GDPR plus. "AI proposes, rules execute" gives traceability. Open key question: is Data Pipelines covered by the recently signed contract? That determines whether we can start directly or need a new purchase.

## Ingestro scope: two tracks

Ingestro splits naturally into two tracks for us, matching its two product shapes.

**Track 1 — Embedded in our pre-onboarding tool (customer self-service).**
Use the Ingestro Data Importer SDK (the product behind "Nuvo") embedded white-label in the tool's frontend. The customer uploads their files, Ingestro AI maps them to Next's target data model, validates and cleans, the customer reviews, then imports with one click. Import data is processed in the browser and never passes Ingestro's servers (GDPR by design). Supports a dynamic target model per customer and 50+ UI languages. This is Phase 2 realised as an embedded importer, and the path to "preboarding becomes onboarding" where the customer populates the product themselves.

**Track 2 — PS consultant tooling (match and batch imports that arrive another way).**
For data that reaches us through other routes (a BSO export, files a customer sends, SFTP or email drops), give PS its own Ingestro workspace to match and batch imports:
- Interactive: run the Importer SDK from the Ingestro User Platform or the no-code configurator (Customer Data Onboarding shape) for hands-on, one-off imports with AI mapping and review.
- Automated and batch: Data Pipelines with input connectors (HTTP(S), SFTP, email, Azure Blob, AWS S3, GCS), AI mapping to the target model, scheduled or event-triggered runs, and a single monitoring view of all runs. Unlimited pipelines, users and file size.

Why this matters for ASAP: Track 2 can start on Ingestro's own User Platform with little or no integration, so PS can gain time savings quickly, in parallel with building Track 1 into our tool. Track 1 needs embedding (developer effort, white-label) and ties to the tool's UX, so it is the larger build.

Open question for the Ingestro meeting: which products and plan tier the signed contract covers (Importer SDK tier, and whether Data Pipelines is included or an add-on), since that gates Track 2's batch and automation.

## Matching and verification (the heart of the BSO case)

**Flexible source, standard target.** BSO is highly flexible: the same field can mean different things depending on how each customer used it. Next is standardized, every column has one purpose. The core job is per-customer pattern recognition: understand how a given customer used BSO, then map it onto Next's fixed columns. This maps to Ingestro's AI layer: the Mapping Module (semantic, context-aware, learns from every approved mapping), the Contextual Engine (auto-transforms variable files without pre-written rules; add-on below the Custom plan) for BSO's variability, and Prompts plus the Cleaning Assistant for the messy remainder. A well-mapped BSO format becomes a reusable asset for the next customer on the same system, which is the compounding win across a population of accounts on the same legacy system. Note: Ingestro acts on the extracted file, not the live BSO database, so the "AI that knows BSO" is really an accumulated, curated BSO-to-Next mapping library that we own.

**Verification layer before import.** After AI mapping, a human review and approval step before anything is written to Next. This is the Importer SDK's native review screen: required vs optional fields are shown and enforced, errors and outliers are flagged, the user edits per segment, and only an explicit confirm commits the import. Two checks stack here: mapping verification (right BSO column to right Next column) and data verification (data correct and complete, mandatory fields satisfied). The same component runs either consultant-led or customer self-service, so we can take over the import or the customer can do it themselves. The import is a controlled, gated write, never automatic. In our tool this is the "Validate and go-live" step.

## Agreement and data handling (change vs the mockup)

If the customer confirms a signed agreement exists, the consent block should be replaced by a short informational text, along the lines of: "In your signed agreement you have given us permission to process your data for migration, including AI-supported handling under the DPA and GDPR." The customer is the data controller, Aceve is the processor. EU AI Act is taken into account. Exact wording is owned by Legal, tied to the new Next agreement with the BSO addendum.

## Timeline

- Within a few working days: this brief (plus mockup and Stitch) is handed to the team, who build on with their own tools and knowledge.
- June to July: build, accounting for the holiday period.
- Early August: a live, launched solution. Baseline = Phase 1 (BSO and Next) hosted and in customer hands. Stretch = Phase 2 included, at least one data category end to end via Ingestro, ideally full.

## RACI

R = Responsible, A = Accountable, C = Consulted, I = Informed. Roles are kept open (no names).

| Activity | R | A | C | I |
|---|---|---|---|---|
| Idea, requirements, direction | Initiative owner (PS) | Initiative owner (PS) | Technical lead, Build | Steering |
| Ingestro meeting, contract and capability | Technical/Ingestro lead | Contract owner | Legal | Initiative owner |
| Build Phase 1 (preparation, hosted) | Build/Web | Technical lead | Initiative owner, IT | Steering |
| Build Phase 2 (Ingestro data migration) | Build/Web, Ingestro tech team | Technical lead | Initiative owner | Steering |
| Hosting setup | IT | Technical lead | Build/Web | Initiative owner |
| Legal text (agreement reference, DPA, EU AI Act) | Legal | Contract owner | Initiative owner | Build/Web |
| Data export for BSO (interim, pre-Ingestro) | Technical support | Technical lead | Initiative owner | Customer |
| Validation and go-live | Next PS | Technical lead | Initiative owner | Customer |

## Ownership

The initiative and core idea are driven by PS (initiative owner), who also sets part of the requirements. Execution and build are handed to the technical/Ingestro lead and build/web roles, with the Ingestro tech team on the platform side, the contract owner on the agreement, Legal on the confirmation texts, and IT on hosting.

## Decisions and dependencies

- Hosting (IT): lead time, needs to start early for August.
- Ingestro Data Pipelines in the contract: determines the Phase 2 path.
- Build capacity over the summer.
- Architecture: build Phase 1 "Ingestro-ready" (data model and upload that match the data categories) so Phase 2 fits without a rebuild.

## Recommendation (the way forward)

Do not build everything at once, but build Phase 1 so Phase 2 fits without a rebuild. Launch Phase 1 ASAP, architect the data model and upload to be Ingestro-ready, and run an Ingestro PoC in parallel. This avoids both the perfection trap and the throwaway trap.

## Broader vision (later, do not lose it)

The tool can grow beyond Next: a product funnel that maps the customer (country, industry, size) to the right Aceve product, a public lead generator at the top of the funnel, and ongoing imports via Data Pipelines after go-live.

A further future possibility is to connect the whole preboarding-to-onboarding flow to Salesforce, building a strong link to CRM and the customer journey as a whole. This is further out, but worth designing toward so the data and events can feed CRM later.

These are kept outside core scope until the foundation is in place.

## Latest sync notes (17 June)

From a call with the technical/Ingestro lead and a chat with the product sponsor:

- Hosting is the critical path. Getting the tool hosted is the first blocker for an August launch; start with IT, who will route to the right owner. The sponsor has other items IT must host, so there is shared urgency.
- Cloud Link / Fortnox. The onboarding flow should connect to the existing Cloud Link onboarding wizard; chosen integrations are set up and connected to Fortnox Cloud Link. Imports must run in a specific order to avoid database problems.
- Import order and technical limits. Imports run stepwise (start with chart of accounts; price lists are the common failure point and can be skipped and resolved separately). Next's import can time out around 10,000 rows depending on machine and connection. Known limit, solvable with batching and queue handling.
- Validation in two layers. Frontend validates to reduce bad imports; backend validates to guarantee data quality. Complements the verification layer above.
- System mirroring and supplier register. BSO and Next are different systems and Next needs the data to mirror correctly. Open decision: clean the supplier register in the economy system, or import and match from different sources.
- Resourcing. The initiative lead owns the idea and drive but not the licenses or full build knowledge, so dedicated resources are required. Internal-within-Next vs external; a fact-based savings case eases the internal route. A specific team owns certain technical parts; a named developer and possibly other consultants are candidates. Approach framed as fast and "guerrilla", with the technical/Ingestro lead as a key person and the sponsor actively pushing.
- Contract reviewed. Signed Change Order = Ingestro Data Importer Business Plan (EUR 1,199/month, 7,000 uploads/month, label "Next One Technology AB"): includes the embeddable onboarder, AI mapping and cleaning, unlimited users/schemas/file size, frontend processing, GDPR. NOT included: Contextual Engine (the module for BSO variability) and Data Pipelines (Track B automation), both need an add-on or upgrade. Multi-brand expansion is priced via Organization Accounts per Label (EUR 208/700 per month). Confirm a signed DPA is in place.
- Sponsorship and resourcing. Approved by the PS and product leads, with the caveat that it must not eat all the initiative lead's time. Strongest near-term path to a live August solution: fund a dedicated builder (needs a short Business Case); the internal AI Product Lab is a candidate resource. Next BSO sync to define the "bare minimum" that helps BSO.
- Ingestro meeting (the "guests"). Targeted for Thursday morning. The technical/Ingestro lead prepares a small case to estimate development effort and show savings; the initiative lead updates notes and the presentation, including English.
- Timeline confirmed. The solution needs to be in operation ("open running") by mid-August.

## Risks

- Speed versus "right from the start" (see Recommendation).
- Ingestro contract and technology unknown until the meeting.
- Holiday capacity in July.
- The mockup is not production-built: real form controls, validation and WCAG 2.1 AA are needed in the build.
- GDPR and EU AI Act text must be approved by Legal.

## Open questions

- Exact August scope for Phase 2 is set after the Ingestro meeting.
- Hosting path and lead time.
- Which data category is piloted first in Phase 2.

## Next steps

1. Hold the Ingestro meeting (contract, Data Pipelines, what is possible).
2. Hand over this brief, the mockup and the Stitch model to the build team.
3. Secure hosting (IT) and build capacity over the summer.
4. Build Phase 1 Ingestro-ready, run a Phase 2 PoC in parallel.
5. Launch Phase 1 in early August, Phase 2 included if possible.
