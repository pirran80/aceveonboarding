# Internal Landscape & Synergies — what else is running at Aceve

*Research note, 2026-08-20, Carl Bäckström (+ Claude). Sweep of Confluence, SharePoint and Slack to find initiatives that could feed, fund, block or absorb the Preboarding & Onboarding Portal.*

*Companion to `Competitive-Inspiration-Research.md` (external scan). Read alongside `STATUS.md` — several findings below change existing open questions and one contradicts a standing decision.*

**Source discipline.** Every claim carries a link and a date. Findings are graded:
**[V]** verified against a primary internal document or a named person's own message · **[R]** reported in a secondary/summary document · **[?]** inferred, needs confirmation.
No figures from other programmes are copied into this project — where a number matters it is quoted with its source and date at point of use, per `STATUS.md` §Figures.

---

## 0. The headline, before the detail

Three findings change what "next step" means. If you read nothing else:

1. **Open Question 2 (external customer identity) may already be solved — by One Platform.** Aceve runs a production OAuth2 identity layer with Authorization Code + PKCE and cross-company context switching, already serving Entré, KlarPris, Rekyl, Accurator, Ordrestyring and others. This is the single largest de-risking find in this sweep. It also reframes the resource ask: the portal needs *less* new infrastructure than the current brief assumes. **[V]**
2. **The Salesforce Phase 1 decision is currently blocked at the architecture level, not the resource level.** Aceve's Enterprise Architect told you directly on 2026-06-25 that no integrations are being built from Salesforce until an integration strategy exists, and that point-to-point is explicitly ruled out. `PROJECT-BRIEF.md` §4 puts Salesforce seeding firmly in Phase 1. Those two cannot both stand. **[V]**
3. **Project Nexus is not a database consolidation project — it is the Certinia PSA implementation, and it closed on 2026-06-30.** Its post-closure roadmap contains no customer-facing portal, and its entire 2026 change budget is a capped €80,000 T&M pool already earmarked for Benelux onboarding and internal optimisation. Nexus is therefore neither a competitor nor a funding source for Pre-onboarding — but its closure deck is the best available template for how a PS platform investment gets argued and approved at Aceve. **[V]**

---

## 1. Aceve One Platform — the biggest synergy, and probably the answer to identity

**What it is.** Not a database-consolidation project (that was the working assumption in your question). One Platform is a shared-services layer: *"One Platform is not a product — it's how we think about products."* It provides authentication, licensing, payments and data handling across autonomous products. Confluence space `ONE`, page authored by **Johan Lauri**. **[V]** — [Welcome to Aceve One Platform](https://hvdgroupcom.atlassian.net/wiki/spaces/ONE/pages/747274306/Welcome+to+Aceve+One+Platform) (last modified 2025-11-13)

**Why it matters more than anything else in this document.** `STATUS.md` Open Question 2 — *"External customer identity: which mechanism, whose infrastructure, what lead time from IT?"* — is listed as **blocking a build start** and **"not started."** It may be substantially answered already.

From the One Platform authentication brief (DRAFT, March 2026, Johan Lauri) **[V]** — [What One Platform Authentication Unlocks](https://hvdgroupcom.atlassian.net/wiki/spaces/~712020ab44d21c60114f05b6c8b4cf5c155400/pages/1199505447/What+One+Platform+Authentication+Unlocks+for+Your+Business):

| Capability | Status per the brief | Relevance to the portal |
|---|---|---|
| **OAuth2, Authorization Code + PKCE** | In production. Login page themeable per product | This is exactly the flow a standalone external-facing portal needs. It is not a research project — it is running |
| **OAuth2 Client Credentials** | In production | Covers service-to-service calls when the portal writes to a product at go-live |
| **Context switching** — a user moves between company/subsidiary/unit without re-authenticating | Available | Directly relevant to multi-entity customers, and adjacent to the "account not bound to a product" requirement |
| **Microsoft Entra federation** | Live (example cited: Entré ↔ Entré Vehicle) | Relevant for larger customers with corporate IdP |
| **Entra Sync** (auto-provisioning from Entra into PCB) | **In discovery**, blocked on a company-mapping design problem | Not available; do not plan around it |

Products already on One Platform authentication per that page: **Entré, Rekyl, KlarPris, KlarCalc, Accurator, Ordrestyring (partial, API-based), Aceve Pay, Open Banking, Card Billing, Data Platform.** In rollout or planning: **Next Planning, Dox, Field, Craftnote.** **[V]**

> **Strategic note worth more than the technical one.** The product list above is *the exact argument* `PROJECT-BRIEF.md` §3.1 is trying to make about product-agnosticism — and One Platform has already won it. Building the portal's identity on One Platform means the portal is structurally a One-Platform-native service from day one, not a Next-shaped tool with a portability promise attached. That is a materially stronger answer to Open Question 13 than anything currently in `STATUS.md`.

**The open question this does not close — and it is the important one.**
The brief states plainly: *"Users need to exist in PCB before they can authenticate via Entra. Entra handles authentication; user accounts still need to be created in One Platform first."* **[V]**

PCB (Portal Admin backend) is organised around **companies and product enrolment**. The portal's founding requirement is an organisation and its users existing **before any product binding** (`PROJECT-BRIEF.md` §1, and the 2026-08-10 decision that the account is not bound to a product until go-live). Whether PCB can hold an organisation and invited users with **no product entitlement attached** is unresolved and is the single question that determines whether One Platform is the identity answer or only part of it. **[?]**

**Two secondary flags on One Platform, both worth knowing before you lean on it:**
- **Capacity is thin.** The 2026 business plan records 3 developers in Core, and a separate staffing page flags a single QA covering all domains as a risk. Leaning on One Platform is architecturally right but may not be fast. **[V]** — [One Platform Business Plan 2026](https://hvdgroupcom.atlassian.net/wiki/spaces/~712020ab44d21c60114f05b6c8b4cf5c155400/pages/744685602/One+Platform+Business+Plan+2026+Summarized+version), [Staffing Needs 2026](https://hvdgroupcom.atlassian.net/wiki/spaces/~712020ab44d21c60114f05b6c8b4cf5c155400/pages/752255045/One+Platform+Staffing+Needs+2026)
- **There is a known OAuth2 hand-off gap.** A KlarPris-side analysis describes a legacy authentication endpoint that only answers *"does this user exist"*, and states that a token passed from one system to another does not authenticate the user in the other. Read this before assuming SSO between the portal and a target product is free. **[V]** — [OnePlatform OAuth2 — The API-Login Problem](https://hvdgroupcom.atlassian.net/wiki/spaces/KlarPris/pages/1640235010/OnePlatform+OAuth2+The+API-Login+Problem)

**One Platform's own roadmap contains an adjacency worth watching.** Its top-five 2026 initiatives include a **"Marketplace & Discovery Portal"** with a goal of *"one-click product installs"* and self-service licensing. `PROJECT-BRIEF.md` §4 explicitly parks the product funnel / lead-generation track as out of Phase 1 scope. That parked idea has an owner elsewhere. Not a conflict today — but if the portal later reaches for the funnel, that is One Platform's territory and needs a conversation, not a land grab. **[V]**

**Suggested action.** One meeting with Johan Lauri, one question: *can PCB hold an organisation and its invited users before any product entitlement exists, and what is the lead time to stand that up?* This is a higher-value 30 minutes than anything else currently on the Next Actions list, it needs no developer, and it can unblock the item `STATUS.md` calls blocking.

---

## 2. Project Nexus — Certinia PSA. Closed. Not what the question assumed.

**What it actually is.** Announced by **Robert Gillberg** on 2026-01-07 in `#ps-buse-all`: Aceve signed for **Certinia Professional Services Cloud**, named the initiative **Project Nexus** *"because it connects the customer journey end to end, from Sales to Professional Services to Support to Finance."* **[V]** — [Slack announcement, 2026-01-07](https://hvdgroupone.slack.com/archives/C08B514L5L2/p1767769206706039)

**Timeline. [V]**

| Date | Event | Source |
|---|---|---|
| 2026-01-07 | Contract signed, initiative named | Slack, Robert Gillberg |
| 2026-06-03 | Go-live, Nordic scope (SE, NO, FI, DK). Quote-to-Cash live end-to-end: Salesforce → PS Cloud → NetSuite | [Robert Gillberg, #ps-buse-all](https://hvdgroupone.slack.com/archives/C08B514L5L2/p1780500081386019) |
| 2026-06-05 | Managed Services (Spaulding Ridge) begins | SteerCo #5 deck |
| 2026-06-30 | **SteerCo #5 — project formally closed.** P1/P2 defects zero | `Nexus_SteerCo5_Closure.pptx` |

**Post-closure roadmap (H2 2026 → 2027), verbatim from the closure deck. [V]**
Managed Services (Jul→Dec) · Optimization (Jul→2027: *account-level visibility, billing enhancements, dashboards, automation*) · Onboard new acquisitions (Sep→2027: KPD & ENK, then Cafca/Syntess/Ibis) · Governance & CoE (2027) · OneAceve scope dependency (Jul→Aug).

**There is no customer-facing portal anywhere in that roadmap.** **[V]**

**Funding reality — this is why Nexus is not a piggyback.** The closure deck puts the total 2026 new ask at **€164,150**, of which the change-work component is a **capped €80,000 T&M pool**, and Decision 2 on the actions slide is explicitly about *allocating that €80,000 by priority between Belgium onboarding and optimisation, "deliver highest value first, stop at the cap."* **[V]** — `Nexus_SteerCo5_Closure.pptx` (SharePoint: *Global Professional Services > 04_Must Win Battles > Nexus (PSA) > 01_Implementation > 00_PMO > 02_Reporting > SteerCo > Close Out*)

**Verdict: adjacent, not overlapping — and not a funding route.** Nexus is Aceve's *internal* delivery backbone; Pre-onboarding is the *customer-facing* front door before delivery starts. They meet at exactly one point: the completion signal. `PROJECT-BRIEF.md` §4 specifies *"exactly one ticket, carrying what the receiving side needs to act."* Post-Nexus, the natural receiving object is a PS Cloud project auto-created from a Salesforce Closed/Won — which the closure deck confirms is live. **[V]** That is a concrete, cheap integration point and a good story for a steering audience: *the portal fills the front of the pipe that Nexus just built the back of.*

**Two Nexus lessons worth stealing for your own resource ask.** The closure deck is the clearest available example of how a PS platform investment is argued at Aceve, and it is in a folder you can read:
- It caps every T&M item and states *"pay external only for external work."* Your ask (`STATUS.md`: up to 1 FTE, 1–2 months) would land better framed the same way — a capped envelope with a named deliverable, not a headcount request.
- Its "Ownership Gap" slide splits 18 functions into *move internal now / build over time / keep external by design*. That is a ready-made structure for answering `STATUS.md` Open Questions 11 and 15 (who owns the portal's technical faults, who staffs the alert queue) — questions currently open with no name attached. Borrow the format.

**People note.** Robert Gillberg moved to the **CFO organisation** on 2026-06-01, with Jenni Meller noting his Nexus transition would be gradual and he would continue supporting the next phase. **[V]** — [PS Pulse #1, 2026-06-01](https://hvdgroupone.slack.com/archives/C0B23EK368P/p1780296184515289). He is therefore a Nexus-history contact and a finance-side route, not the current Nexus owner. `STATUS.md` currently lists him under Salesforce as *"possibly involved — unverified, Carl uncertain."* That entry should be corrected: he is verified, but on PSA/Nexus and now Finance, not Salesforce integration.

---

## 3. Certinia customer portal — complement, not either-or. But the claim is unverified.

Your question: *does Certinia's customer portal option make Pre-onboarding redundant?*

**Short answer: no, and the evidence that it could is weaker than it looks.**

**Where the claim comes from.** A document in your own OneDrive, `PSA - Key Benefits of Certinia for Low-Touch Onboarding.docx` (2025-10-30), lists as benefit #3: *"Certinia provides self-service portals and dashboards for customers and partners, allowing them to track progress, access resources, and complete onboarding steps independently."* **[R]** — that specific claim is footnoted to **rsmus.com**, an implementation-partner marketing site, and the document is AI-generated from a mix of vendor and partner sources. It is not a verified statement about Aceve's licence or configuration.

**Counter-evidence, from Aceve's own Salesforce org documentation.** The Confluence page listing existing profiles and permission sets records a **Community User / Customer Community** profile with **0 Active and 0 Inactive users.** **[V]** — [Existing Profiles and Permission Sets](https://hvdgroupcom.atlassian.net/wiki/spaces/Salesforce/pages/1274052631/Existing+Profiles+and+Permission+Sets). The capability shell exists in the org; nobody is using it. There is no evidence in any source found of a deployed, licensed, customer-facing Certinia/Experience Cloud community at Aceve.

**The decisive test, and it is one question.** Certinia's portal is Salesforce Experience Cloud. Experience Cloud authenticates a **Contact attached to an Account** in Salesforce. Pre-onboarding's founding requirement is a customer working **before an account, licence or database exists on our side** (`PROJECT-BRIEF.md` §1). So:

> *Can a Certinia/Experience Cloud community authenticate an external user who has no Salesforce Contact record, no product entitlement and no licence — and let several such users collaborate on shared state?*

If yes, it is a serious candidate and Open Question 2 has two answers to compare. If no — which the architecture suggests, though this has **not been verified against Aceve's licence** **[?]** — then Certinia's portal is a *delivery-phase* customer view (project status, documents, tasks, once a project exists in PS Cloud) and Pre-onboarding is the *pre-delivery* front door. Those are sequential, not competing.

**Recommended framing either way: complement.** The clean division is that Certinia/PS Cloud owns the internal delivery record and the post-signature project view; Pre-onboarding owns the pre-provisioning customer experience and the data migration. The handoff is the completion ticket (§2 above). Note also that Experience Cloud licences are priced per external user — a per-customer cost that a self-hosted portal does not carry, relevant given the licence-cost sensitivity already flagged in Open Question 7.

**Action:** put the one question above to whoever now owns the PSA platform (post-closure this sits with the PS organisation; the closure deck names the Director, Process & Operating Standards as setting standards but explicitly *not* owning the system — so the owner needs establishing). Do not settle this from vendor marketing.

---

## 4. Salesforce — a hard architectural blocker that outranks the resource question

This is the finding that most needs your attention, because it contradicts a standing decision.

**`PROJECT-BRIEF.md` §4 and the 2026-08-10 decision log:** Salesforce seeding at Account level is **in Phase 1**, *"Carl's call — it delivers most of the perceived value at the preboarding stage and is not deferrable."*

**What Aceve's Enterprise Architect told you, 2026-06-25 [V]** — Miguel Casco (Enterprise Architect, verified via Slack directory), DM:

> *"There is currently no integration being done from SF or other backends until there is a proper integration strategy in place"*
> *"we are avoid[ing] point to point integrations [as] these are not scalable"*
> *"Andrew and I are defining the strategy [for] how to integrate at scale and have a shared vision between Product to Backends and backends to other apps in the backends"*

[Thread, 2026-06-25](https://hvdgroupone.slack.com/archives/D0BD40LRZK8/p1782399505214849)

**Reading this correctly matters.** This is not a rejection of your use case. It is a freeze pending an architecture decision, and Miguel confirmed the middleware/iPaaS discussion is exactly what he and Andrew are working on. `STATUS.md` Open Question 4 already asks the right question (*"MCP connector vs data lake vs iPaaS/middleware"*) and Next Action 5 already books the meeting. What this finding changes is the **status**: it is not "needed early, not blocking" — for the Phase 1 scope as currently written, it *is* blocking, and it is blocked on someone else's decision that you do not control.

**Two honest options, and they should be put in front of whoever approves the resource:**
- **(a)** Keep Salesforce seeding in Phase 1 and accept that Phase 1 cannot start until the integration strategy lands. Timeline unknown, owned externally.
- **(b)** Move Salesforce seeding to Phase 1b, build the portal to be seedable (a clean inbound interface that Salesforce, a CSV, or a consultant can populate), and connect it when the strategy allows. Phase 1 delivers without an external dependency.

Option (b) is the one I would argue for, and it is consistent with an existing design principle rather than a retreat from it: Principle 4 says *never ask for data we already hold* — it does not say the data must arrive by live API on day one. It also strengthens the product-agnostic case, since a seedable interface serves Entré Office as readily as Next.

**Team change to note:** **Luis Mota** joined as **Salesforce Architect** on 2026-06-15, with Miguel handling transition. **[V]** — [#salesforce-release-comms](https://hvdgroupone.slack.com/archives/C09CMCGJ8US/p1781519993075229). Miguel remains Enterprise Architect. Route architecture questions accordingly.

---

## 5. Data consolidation at Finance — two separate things, one real synergy

Your question referenced "the data consolidation Finance is working on." The sweep found **two distinct initiatives**, and the synergy is in the second, not the first.

### 5a. Data Platform — Azure lakehouse **[V]**
Confluence space `dataplatform`. Azure Databricks (ingestion/transform) → ADLS Gen2 (storage) → Synapse (processing) → Power BI, plus an NL2SQL chatbot. The space description states it was *"originally set up to produce KPIs for the FP&A Function."* A separate page describes DataPlatform as *"Aceve's EDI platform"* — the space covers both, so be precise about which is meant in conversation.
— [DataLake POC Overview](https://hvdgroupcom.atlassian.net/wiki/spaces/dataplatform/pages/742621288/DataLake+POC+Overview), [Data Platform space](https://hvdgroupcom.atlassian.net/wiki/spaces/dataplattf/overview)

**Relevance to Pre-onboarding: low, and worth saying so.** This is analytics infrastructure for internal reporting, not customer master data. It is a *consumer* of onboarding telemetry, not a dependency. If the portal later emits events (customer started, category imported, stalled at step N), Data Platform is the natural sink — which is a Phase 2/3 conversation and a nice-to-have, not a synergy to chase now. Note also that Data Platform already runs on One Platform authentication (§1), so the plumbing exists.

### 5b. Salesforce account de-duplication — **the real synergy** **[V]**
Slack channel `#project-salesforce-data-clean-up`, led by **David Kibingua Norström (Data & Analytics Director**, verified via Slack directory). From his own meeting notes, 2026-07-08:

- **"One org number = one account."**
- **Merge, never delete** — related records (contacts, opportunities, tasks, contracts, assets) reassign to the master.
- Master selection: customer over prospect; then most recently modified AND owned by a real/active user.
- Salesforce team preparing **mandatory org-number enforcement at lead→account/opportunity conversion**, plus a duplicate validation rule (org number + fuzzy name match), with **org number enriched via Guava so users just confirm it**.
- Separate evaluation underway: **switch company-data vendor from Guava to Dun & Bradstreet** for broader European coverage.
- Sequencing: accounts first, then leads (Sweden), then contacts.

[Meeting notes 2026-07-08](https://hvdgroupone.slack.com/archives/C0BDUPTBWVC/p1783528217894499) · [Lead de-dup notes 2026-07-09](https://hvdgroupone.slack.com/archives/C0BDUPTBWVC/p1783688761656439)

**Why this matters directly.** `PROJECT-BRIEF.md` §5 already puts `org.nr` on the Organisation entity. If org number is becoming Aceve's enforced master key for customer identity — which is precisely what this project is implementing — then Pre-onboarding should:

1. **Adopt org number as its own organisation key**, not an incidental field. Free alignment with where the company is going.
2. **Use the same enrichment vendor** (Guava today, possibly D&B) so a customer confirms rather than types their company details — which is Design Principle 4 applied at the very first step of the flow, and a small, visible UX win.
3. **Feed org number back into Salesforce at capture.** A new customer completing the portal has *just confirmed* their org number. That is exactly the data the de-dup project is struggling to obtain reliably at lead stage. Note David's explicit finding: *"Marketing does not capture org number. Leads come in from Account Engagement (Pardot) keyed only on email address, so there is no reliable org-number match at lead stage."* **[V]**

**That last point is a genuine two-way value argument, and it is rare.** Most of Pre-onboarding's business case is PS-internal (consultant time). This one is not: the portal is a *reliable org-number capture point at the earliest customer touch*, which is a named problem for the Data & Analytics function. It costs the portal nothing to provide. It is worth a conversation with David Kibingua Norström — and it gives you an ally outside PS, which Open Question 13 says is the scarce thing.

**Caveat before using it:** this is my inference from two documents, not something David has agreed to. **[?]** Put it to him as a question, not a claim.

---

## 6. Customer Journey initiative — Open Question 10 is answered

`STATUS.md` Open Question 10 (raised by Sofie, 2026-08-19) asks whether a "kundresa" initiative already exists and who owns it. **It does.**

**Jenni Meller**, 2026-06-10 in `#ps-buse-all` **[V]** — [message](https://hvdgroupone.slack.com/archives/C08B514L5L2/p1781119110043269):

> *"Customer Journey Workshop" — cross funktionell workshop med representanter från alla funktioner för att identifiera opportunities och pain-points (=> konkreta förbättringsåtgärder med ägare). Vi har valt att fokusera på **nykund Entré** just för denna övning... Readout från denna session kommer att delas ut efter måndag.*

Three things make this more useful than it first appears:

- **It focused on new-customer Entré** — which is Pre-onboarding's stated second product case (`PROJECT-BRIEF.md` §3.1). The workshop already gathered cross-functional pain points on exactly the journey you want the portal to fix, for exactly the product whose buy-in you need in writing (`STATUS.md` Next Action 3).
- **It produced "konkreta förbättringsåtgärder med ägare"** — improvement actions with named owners. If the portal addresses any of them, that is documented, cross-functional demand rather than a PS opinion. **Get the readout.**
- **Jenni Meller is your own manager** for this initiative (per `STATUS.md` People). This is the cheapest possible ask in the entire document.

**Correction to `STATUS.md`.** Open Question 10 currently records the person to raise it with as **Jenny Jubner** (Head of Global Customer Success). Based on this find, the Customer Journey Workshop was communicated and organised by **Jenni Meller** (Head of Professional Services). Both may be involved — CX and PS were shaping H2 plans jointly — but the workshop with a readout is Jenni Meller's. Ask her first. **[V]**

---

## 7. ONE Aceve Commercial Excellence — the programme that already promised your outcome

A programme-level update from **Paul Simpson** (Transformation Lead — ComEx Salesforce Programme) and **Jonas Renström** (Commercial Excellence Lead), 2026-04-27 in `#aceve-all` **[V]** — [message](https://hvdgroupone.slack.com/archives/C07SSR97KCY/p1777304743348259), contains this under *"How this helps our customers"*:

> *"**Better onboarding and support** — as Certinia and Salesforce come together, customers will see a **more structured onboarding flow** and more predictable delivery."*

and under next steps:

> *"Project Nexus is targeted to go live in May with the connection between Salesforce/Certinia bringing alignment and efficiency to **Onboarding processes**."*

**Why you need to know this — and it cuts both ways.**

The **risk**: a promise to improve customer onboarding has already been made to the whole company, attributed to Nexus + Salesforce. Anyone hearing your proposal cold may reasonably ask *"didn't we already do this?"* You need a one-sentence answer ready. The honest one: *Nexus improved how Aceve runs onboarding internally; it did not give the customer anywhere to do their part, and it does not move data.*

The **opportunity**: the company has committed, at programme level and in writing, to better customer onboarding. Pre-onboarding is the only initiative found in this sweep that actually delivers a customer-facing surface for it. That is a mandate hook comparable to the June 2026 BSO steering line already cited in `PROJECT-BRIEF.md` §2 — and a better one, because it is portfolio-wide rather than BSO-specific, which is precisely the framing problem `STATUS.md` §Figures says costs cross-product buy-in.

**Also note the H2 CCO strategic priorities** (Jenni Meller, PS Pulse #3, 2026-07-03) **[V]** — [message](https://hvdgroupone.slack.com/archives/C0B23EK368P/p1783101315502909): *1. Retention Ownership · 2. **One System to Work In** · 3. Improve Product Alignment · 4. Improve Sales Alignment · 5. Voice of the Customer.*

**"One System to Work In" is a framing hazard for this project and should be met head-on.** A brand-new standalone portal can be read as a *second* system, directly against a stated CCO priority. The counter is available and should be rehearsed: the portal is not a system Aceve staff work in — internal work continues in PS Cloud. It is the customer's surface, and it *feeds* the one internal system rather than competing with it. Building it on One Platform identity (§1) makes that argument materially stronger, because it is then demonstrably part of the shared platform rather than a sixth silo.

---

## 8. Smaller finds worth logging

| Find | Detail | Relevance |
|---|---|---|
| **Training-portal requirements already exist** | `training_management_software_requirements_acvnl.xlsx` (Carl's OneDrive, 2025-11-17) contains requirements including *"Customer Self-Service Portal"* and *"Branded Registration Portal"*, marked CRITICAL/Must | Feeds `STATUS.md` Open Question 16 (Marcus's training-portal link). Someone has already written requirements for a customer-facing training surface — check overlap before scoping it as new **[V]** |
| **Process-System-Data Landscape** | `Process-System-Data Landscape.xlsx` (Janni Bilenberg, 2025-12-08) maps *"Aceve Core Business Processes (to be defined & aligned)"* incl. Idea-to-Product, with exec sponsors | Likely the authoritative map of which process has which owner. Worth reading before claiming ownership of "customer onboarding" as a process **[V]** |
| **Nuvo/Ingestro expertise is with Team Phoenix** | Granath (via Carl, 2026-04-01): *"Team Phoenix som är bäst på Nuvo/Ingestro-funktionaliteten"* | Confirms the `STATUS.md` People entry. Also: a Next release note (2025-04-07) records a Nuvo version upgrade restoring cut/paste in imports — version alignment is a live, recurring matter **[V]** |
| **JSON import in Next is undocumented** | Severin Maric, 2026-03-12: nobody at Aceve knows the required JSON format for Nuvo import; asks whether the .json icon should be removed | Small but real: if the portal offers JSON as an input path, this is a known gap, not a solved one **[V]** |
| **Certinia partner model is unresolved** | Nexus closure deck, slide 9: two partners (Capgemini for Salesforce, Spaulding Ridge for PSA); *"Aceve cannot absorb or deliver this internally today, no capacity, not the competence"*; three options tabled, no decision | Directly relevant to Open Question 13. There is precedent — very recent, at SteerCo level — for Aceve resourcing platform work externally because internal capacity does not exist. That is the exact argument Marcus Leijon made on 2026-08-19 about consultant-resourcing this build **[V]** |
| **Younium / MRR data known-problematic** | `Younium Data Problems` (Confluence, dataplattf space) lists duplicates, missing historical data, mapping gaps | Relevant if anyone asks the portal to source or reconcile subscription data. Don't assume that data is clean **[V]** |

---

## 9. What this changes in `STATUS.md`

Proposed edits, for your approval — I have not applied them:

| Item | Change |
|---|---|
| **Open Question 2** (external identity — blocking) | Re-scope from *"not started"* to a single specific question for Johan Lauri: can PCB hold an organisation + invited users with no product entitlement? Add One Platform OAuth2/PKCE as the leading candidate mechanism |
| **Open Question 4** (Salesforce) | Escalate from *"needed early, not blocking"* to **blocking for Phase 1 as currently scoped**, citing Miguel Casco 2026-06-25. Add the (a)/(b) options from §4 as a decision for you to take |
| **Open Question 10** (kundresa) | Substantially answered — Customer Journey Workshop, Jenni Meller, 2026-06-10, focused on nykund Entré, readout exists. Correct the contact from Jenny Jubner to Jenni Meller. Reduce to: *obtain the readout* |
| **Open Question 11 / 15** (ownership, alerts) | Add the Nexus closure deck's *move internal now / build over time / keep external* framework as the structure for answering these |
| **Open Question 13** (Next's dev responsibility) | Add two supporting data points: One Platform is the portfolio-wide home for shared services (so the portal is structurally not a Next deliverable), and the Nexus SteerCo precedent of externally-resourcing platform work for lack of internal capacity |
| **Open Question 16** (training portal) | Add the existing `training_management_software_requirements_acvnl.xlsx` requirements as prior art |
| **People** | Correct **Robert Gillberg** (verified: announced Project Nexus 2026-01-07, moved to CFO organisation 2026-06-01 — not a Salesforce integration contact). Correct **Miguel** to **Miguel Casco, Enterprise Architect** (verified). Add **Johan Lauri** (One Platform), **David Kibingua Norström** (Data & Analytics Director), **Luis Mota** (Salesforce Architect, from 2026-06-15), **Paul Simpson** / **Jonas Renström** (ONE Aceve ComEx) |
| **Next actions** | Add: (1) 30 min with Johan Lauri on PCB pre-product identity — highest value, no dev needed; (2) obtain the Customer Journey Workshop readout from Jenni Meller; (3) put the org-number capture proposition to David Kibingua Norström; (4) decide Salesforce (a) vs (b) |

---

## 10. What this sweep did not find

Stated explicitly so nobody reads absence as evidence:

- **No competing customer-facing pre-onboarding portal anywhere at Aceve.** The concept appears to be genuinely unclaimed.
- **No database-consolidation project matching the description in the original question.** "Aceve One" is One Platform (shared services), and Nexus is Certinia PSA. Neither consolidates customer databases. If such a project exists it is under a name not surfaced by these searches. **[?]**
- **No verified statement about Aceve's Certinia Experience Cloud licence entitlement.** Only the zero-active-users data point and vendor marketing.
- **Nothing found on hosting or IT lead time** (Open Question 3), which remains untouched by this sweep and is still flagged as critical path since June.
- **Slack DMs and private channels were searched**, so the coverage is broad — but Confluence personal spaces, Teams chats and email were only partially covered. A find's absence here is weak evidence.

---

*Last updated: 2026-08-20 by Carl Bäckström (+ Claude).*
