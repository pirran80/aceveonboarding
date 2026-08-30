# Aceve Onboard

**Customers start delivering their own onboarding the day they sign — before we have provisioned anything.**

*One-pager, 2026-08-20. Owner: Carl Bäckström (PS), co-lead Pierre Lindbom (CS), technical counterpart Eric Lindberg (architecture & Ingestro, with the project from the start). Working name, provisional.*

---

## The problem

Onboarding cost per customer is consultant time, and consultant time does not scale — so PS capacity, not demand, sets the pace for every Aceve product, in every country. And the customer waits: between signature and first consultant contact, nothing happens, which delays go-live, first value and first invoice. Meanwhile we ask customers for data we already hold — the same information is requested repeatedly across sales, delivery and Word-attachment questionnaires (the current process's own documentation records the customer complaint: *"kund får ofta svara på samma fråga massa gånger"*).

## What Aceve Onboard is

A web portal where a new customer prepares and migrates their own data **before** an account, licence or database exists — logging in the day they sign — and which stays in use **through the implementation**, migrating remaining categories into the live database through the same validated flow. Product-agnostic by construction: Next Project is case one (driven by the BSO sunset), Entré Office has expressed interest, and nothing in the design assumes either.

- **Seeded from Salesforce.** The customer confirms what we know; they never re-enter it. The portal enriches Salesforce back — one source of truth, one completion record when done.
- **A guided, sequential flow** — company details, superusers, trainings, responsibility split, then data migration category by category. Several people at the customer work in parallel; both sides see the same status the whole time.
- **The data migration happens in the portal**, powered by the Ingestro Data Importer we already license and already use inside Next: AI proposes column mappings and cleaning, the customer confirms, per-cell validation catches errors at the source. Both the customer and Aceve approve before anything is written anywhere.
- **Configuration as part of the flow.** Integration and setup questions (today: Word attachments) become portal steps whose answers carry a destination — an import mapping, a product API field, or a provisioning parameter. Human confirmation is the default; verified flows can graduate to full automation per product and customer type. North star: a small customer delivered end to end, fully self-service.
- **Every approved mapping is a reusable asset.** Each customer migrated from a legacy system makes the next customer on that system cheaper — automation compounds instead of resetting per project.

## Why now

- The June 2026 BSO steering report already names an onboarding tool as the mitigation for CSM capacity risk: *"Define minimum viable onboarding scope & manage through on-boarding tool."* This is delivery on an existing decision, not a new idea.
- The migration engine is **already licensed** (Ingestro Data Importer Business, signed MSA change order 2026-05-29) and is the same component running inside Next today — reuse, not new development.
- The flow is validated: three prototypes, reviewed with PS/CS practitioners across Next and Entré Office, source code recovered and in hand.
- Practitioner estimate from Office delivery (Sofie Johansson & Gustav Öberg, CS, 2026-08-19): PS/CS admin time per customer drops from roughly 2 hours to roughly 30 minutes with the tool. *A qualified practitioner estimate, not yet a timed measurement — a real before/after on one customer file is next.*

## What it means

For the customer: value from day one, one place to see what is done and what remains, never answering the same question twice. For Aceve: shorter signature-to-go-live (time-to-money), fewer consultant hours per customer, higher data quality at import, and an onboarding capacity that scales with customers instead of headcount — across products and countries.

## Where it stands & the ask

Carl (PS) and Pierre (CS) are building now — frontend first from the validated flow, then Salesforce/Ingestro/product-API integrations, with documentation, tests and secure data handling as requirements from the start. PS owns the tool; Produkt supports. In parallel, the formal resourcing ask stands: **up to 1 FTE fullstack for 1–2 months to take it deployed and live against customers**, plus IT engagement on hosting and external customer identity — the critical path, unresolved since June.

*Sources for every claim: project documentation (`PROJECT-BRIEF.md`, `STATUS.md`). This document carries no BSO programme figures and no unvalidated numbers, by standing project rule.*
