# Ingestro discovery call — prep and agenda

*Internal Aceve prep before the call with Ingestro (solution engineer, plus growth and CEO cc'd). Owner: initiative lead (PS). Date: 2026-06-17.*

## Goal of the call

Validate that Ingestro can power our BSO-to-Next migration at scale (and broader Aceve later), and agree a small PoC plus the commercials. Anchor on the concrete BSO case to get momentum, and signal the wider vision so they see the scale.

## Before the call (internal, 15 min)

- Align who leads (technical/Ingestro lead) and who covers PS and migration strategy.
- Confirm with the contract owner what the signed agreement already covers.
- Bring: this brief and the requirements brief, the clickable mockup (Phase 2 hook visible), and 2–3 real BSO exports from customers who used the data differently.

## The use-case to give them (60 seconds)

Customers migrating from on-prem BSO to Next Project, at volume [figure removed — belongs to the BSO Sunset project]. Data can be extracted to Excel per category (chart of accounts, user register, hourly rates, price list, customer register, project list, and more). BSO is flexible and free-form; Next is standardized. Recurring and at volume, not a one-off. Goal: capture as much of the customer's database as possible (ongoing projects and the surrounding information) for a seamless migration.

## Agenda

1. Use-case and scale (5 min)
2. Track A — embedded self-service importer in our tool (10)
3. Track B — PS-run match and batch (10)
4. Matching: flexible source to standard target (10)
5. Verification layer before import (5)
6. Commercials, contract, PoC (10)
7. Next steps (5)

## Questions

### Track A — embedded in our tool (customer self-service)
- Can we embed a white-label Importer SDK in our web tool, with a dynamic target model per customer and 50+ UI languages?
- Frontend processing (data stays in the browser) — confirm the GDPR story.
- Developer effort and time to a first working embed?

### Track B — PS match and batch
- Can we start on the Ingestro User Platform with little or no integration?
- Data Pipelines for files arriving via SFTP, email or cloud storage; scheduled or event-triggered; one monitoring view?
- Unlimited pipelines, users and file size — confirm.

### Matching (flexible to standard)
- Does the Mapping Module's learning persist and reuse across different customers on the same source (BSO), so each new customer is faster?
- Does the Contextual Engine handle BSO's per-customer variability without rules per customer, and is it required here (it is an add-on below Custom)?
- Can we pre-load our own BSO knowledge as reusable target-model presets and mapping templates?
- For ambiguous BSO fields (same column, different meaning per customer), how does it disambiguate?

### Verification layer
- Does the review screen separate required vs optional and block confirm until mandatory fields are satisfied?
- Per-segment and per-category review with bulk edit (Prompts, Cleaning Assistant) in the same screen?
- Can the same import switch between customer-reviews-and-imports and consultant-reviews-and-imports?
- Is there a dry-run or preview against Next before the real commit, and a full audit log of changes and approver?

### Commercial and contract

What we already have (signed Change Order, effective 15 Jun 2026):
- Ingestro Data Importer Business Plan, EUR 1,199/month, 7,000 file uploads/month included (+EUR 0.05 per extra), under the label "Next One Technology AB".
- Business Plan includes: embeddable white-label onboarder, admin dashboard, unlimited users, unlimited data schemas, custom styling, AI column matching, multi-language matching, automatic mapping, dynamic import, cleaning functions, custom regex, server callbacks, user-specific data models, multiple file upload, step handler, unlimited file size, frontend ("no data entry") processing, fully GDPR. SLA 99.5% uptime, priority email support 12h.
- Multi-brand expansion is priced: additional Organization Accounts per Label at EUR 208.33/month (up to 1,200 imports/year), stepping to EUR 700/month (4,200 imports). This is the Aceve-wide path.

Not in the current plan, confirm cost and upgrade:
- Contextual Engine (the module for BSO's per-customer variability) — add-on, not in Business.
- Data Pipelines (Track B automation and batch) — separate product, not in Business.
- Self-hosted AI model (Custom plan only).

Still to confirm:
- Is a signed DPA in place (needed for our data-handling text)?
- PoC/test key; renewal-increase terms. Note: contract auto-renews and has no termination for convenience before term end.

## PoC proposal

One BSO customer, 1–2 data categories, end to end: export, AI map, verify, import to Next. Success criteria: shorter lead time, less PS time, clean data in. Tie to our timeline: something to show within days, a live solution in early August.

## Roles on the call

Technical/Ingestro lead drives; PS/initiative lead covers migration strategy and the tool vision; build/web for feasibility; contract owner and CEO for commercials.
