# Onboarding / Pre-boarding Tool — Summary for Magnus

*Prepared for Magnus's follow-up by Wednesday 2026-08-12, after the meeting on 2026-08-10 (Magnus, Carl, Eric Lindberg).*

---

## 1. Meeting summary

We discussed building a tool to make onboarding/implementation more efficient — both for the acute BSO migration and as a broader solution going forward. The resource building this doesn't need to come from the Next development team, since the solution is meant to be standalone/independent. What's needed instead is capacity from **both PS and Produkt** to support that resource on requirements and how it should integrate — this is not a reallocation of an existing PS or Produkt delivery resource, it's added support capacity around a new, independent build. Carl raised the related question of which existing deliveries might still need support bandwidth reprioritized once that person is in place. Carl pushed for speed — visible effect soon, not deferred. Eric proposed a technical direction: a standalone service outside the Next monolith, talking directly to the API. Magnus asked for this summary: competencies, resource need, and a plan to test and document business value.

## 2. Original idea — reinforced by Ingestro and Eric's work

Core idea (Carl): the customer logs in and can start working with their data **before** an account/database exists with us. The customer saves progress, with full transparency for both customer and us. Sharpened after the meeting:

- **A customer account is needed** to save data and progress — but it does **not** need to be tied to a specific product (Next, Entré, etc.) at this stage. That binding happens at the end, at go-live.
- **Salesforce connection** to reuse existing customer data (so the customer doesn't re-enter what we already have) and let the customer fill in the rest — possibly via an **MCP connector or a data lake**, not necessarily a direct API integration. Approach not decided yet.
- **The customer works independently**, and we check in on the flow in different phases depending on customer and scope — not one generic sequence for everyone. This connects directly to complexity tiering (a high/medium/low model, derived from public company data) — the same logic can drive how much check-in a given customer needs.
- **Data handling is sequential**, not bulk, from the customer's side. We may assist with a bulk upload *into* the tool as a starting point (e.g. an existing export), which the customer then works through step by step, category by category.
- **Transfer to the customer's database/licence** once ready, e.g. via API — not manual export/import.
- **Applicable to more products in the Aceve portfolio**, not just Next Project.

This builds on two things already in place:
- **Ingestro** — licence already signed (MSA change order, 2026-05-29). Their demo on 2026-08-06 confirmed that column matching/AI mapping is already the same engine used in Next today (not new development), and that Aceve builds the solution itself on the existing licence — Ingestro isn't building it for us.
- **Eric's compilation (the Stitch model, 2026-06-17)** — built on Carl's original mockup with a second phase: "Data migration [Ingestro]", one row per data category (chart of accounts, user register, price list, customer register, project list) with import & column matching. That two-phase structure (preparation → data migration) is now the basis for scoping.
- **Eric's proposal from the meeting (2026-08-10):** a standalone service outside the Next monolith, talking directly to the API — this is the architectural answer for how the "transfer to the customer's database/licence" step actually happens.

## 3. Proposed phasing

| Phase | Content | Status |
|---|---|---|
| **1 — Build & go live** | Standalone customer account (not yet tied to a specific product), Salesforce data reuse (Account-level), sequential customer-managed data entry with optional assisted bulk upload into the tool, plus the acute BSO→Next import automation with Ingestro. Goal: deployed and live against customers within the period. | Matches the resource estimate below (up to 1 FTE, 1–2 months). |
| **2 — Product binding & scale-out** | Bind the account to the specific target product (Next, Entré, etc.) at go-live, phased check-ins by customer complexity tier, API-driven transfer into the customer's provisioned database/licence, decide ownership/operations/further development. | Not yet scoped or resource-estimated. |
| **3 — Portfolio scale & guidance layer** | Generalise to other Aceve portfolio products; evaluate Pendo for in-app guidance once Pendo is live on Next (not yet). | Requested, not started. |

## 4. Competencies required

- **Fullstack developer, senior, AI-native working style** — able to build with modern AI-assisted development *and* act as a thinking partner who can develop and push back on the idea as it evolves, not just execute a fixed spec. Comfortable with APIs, databases and integration work; deep BSO/Next domain knowledge not required.
- **Frontend/UX** — for the customer-facing self-service portal. Support needed from the UX team.
- **Salesforce integration** — mainly Account-level objects (company info, contacts, regions). An internal owner for Salesforce already exists — loop them in to confirm exact fields/objects and integration approach (MCP vs. data lake).
- **Data mapping / Ingestro competence** — to build on what already exists (Data Importer SDK, column matching).
- **PS onboarding input (part-time)** — process and domain knowledge feeding into the solution.
- **Product support** — ownership sits with PS, supported by Produkt (already agreed).

## 5. Resource estimate

Up to **1 FTE for 1–2 months**, with the explicit goal that the solution is **deployed and live against customers** by the end of that period — not just scoped or prototyped further. The FTE needs to be fullstack and able to co-develop the idea as it emerges, not only execute a brief. After that period, ownership, operations, and further development need to be assigned — open decision, not yet made.

**Salesforce data flow should be included in Phase 1**, not deferred — it delivers large benefit and increases the value of the tool already at the pre-boarding stage, before any product-specific work starts.

## 6. Business value — tested and documented

**What we have (verified):**
- June 2026 steering report: the risk "CSM capacity: overwhelming post-migration support" is mitigated in that same document by "define minimum viable onboarding scope & manage through on-boarding tool" — the fix is already named, in Produkt's own reporting. Capacity and pipeline figures [figure removed — belongs to the BSO Sunset project].
- Import matrix: only a minority of data categories are fully automatic today; the rest require manual work. [ratio removed — not validated; measure before quoting]
- Targets: top 130 customers migrated; preliminary ARR breakeven at top 40 migrated + price uplift.

**What's missing — and how to test it before the next check-in:** an actual before/after measurement. The Ingestro sandbox is valid until 2026-08-31. Run a real BSO export file through it and produce a concrete number ("X hours → Y minutes"). That's the fastest way to deliver what Magnus asked for — tested and documented, not just described.

## 7. Scalability

Confirmed as highly requested, not just for BSO. Ownership: PS, supported by Produkt. Applicable across the whole Aceve portfolio (Entré and others), which increases the value per resource invested compared with a BSO-specific build.

## 8. Open questions to resolve before this goes to Magnus

- Confirm exact Salesforce fields/objects to sync (Account-level: company info, contacts, regions — some of this is already reflected in the existing prototype) and the integration approach (MCP connector vs. data lake) with the internal SF owner.
- Phasing by customer complexity: is a high/medium/low classification the right basis, or does a customer from another legacy source need a different model?
- Pendo: not live on Next yet, unclear how/if it would sync — push to Phase 2 or 3, not urgent now.
- Confirm the sequential-with-assisted-bulk-load model (section 2) reflects what Eric and Carl agreed, since it replaces the earlier, less precise "sequential vs. bulk" framing from before this meeting.

---
*Draft — validate with Eric before sending to Magnus. Run the Ingestro pilot (section 6) if there's time before Wednesday.*
