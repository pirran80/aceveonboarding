# The Same Pre-Account Pattern in Two Products

*One page for product and delivery leads outside Next. Written 2026-08-20 by Carl Bäckström (+ Claude), from Professional Services' own delivery documentation on SharePoint (`04_Must Win Battles/Core Delivery Blueprint`). Every claim below is sourced; the sources are listed at the end and quoted verbatim where the wording matters.*

*Companion to `PROJECT-BRIEF.md` (what the portal is) and `STATUS.md` (where it stands). This document exists for one purpose: to show that the preboarding portal is not a Next initiative that other products are being asked to adopt.*

---

## The argument in one paragraph

Next and Entré Office document their customer start-up processes separately, in different formats, written by different people, for different delivery models. Read side by side, the first stretch of both is the same process: a contract is signed, a structured set of questions goes out to the customer, someone internal creates the environment by hand, an access mail goes out, and only then does the first session happen. Neither team invented that shape — it is what you get when the product cannot be provisioned until the customer has answered questions, and the questions are asked over mail. **Both teams have already written down, in their own documents, that the manual steps in this stretch should be automated.** That is the portal's scope, and it is why building it once for Aceve is cheaper than each product solving it again.

## Side by side

| Step | Next Foundation | Next Core (PROMO) | Entré Office |
|---|---|---|---|
| 1. Contract | Sales signs, and books the start-up at signature — deliberately far enough out to leave time to create the database | Sales signs; handover to delivery | `Avtalssignering` by Sales |
| 2. Ask the customer | Typeform questionnaire sent from Salesforce, answers land in a case | Per-integration Word templates mailed out (`Kundmall - Integration Fortnox…`, `…Visma Admin…`, `Kundmall - E-invoice…`) | Typeform questionnaire sent from Salesforce, answers land in a case |
| 3. Book | (booked at step 1) | `Uppstartsmöte` booked by the consultant | Booked in Bookings; the booking generates an internal case |
| 4. Create the environment | **The assigned person creates the database** | Database ordered from tekniksupport; grundinformation loaded; integration set-up begun | **The assigned person creates the company, EDI and integration — on an industry-adapted installation** |
| 5. Give access | Welcome mail from a Salesforce template; Cloudlink activation link to the contact person | Access to Next given; subscription started in Salesforce | Welcome mail; in the digital variants, a link to the Learnster course |
| 6. First session | `Uppstart`, then invoicing flows | `Uppstartsmöte`, then kartläggning, configuration, training | `Uppstart` — configuration and training in one, or a self-directed course followed by a session |
| 7. Follow-up | Follow-up meetings, then handover to support | Follow-up, production-start meeting, hypercare, then handover to support | Follow-up, second follow-up, then handover to support |

Steps 1–5 are the portal's scope. Steps 6–7 are delivery and stay where they are.

Next is split into two columns on purpose. Its own two delivery levels differ from each other about as much as either differs from Office — which is the first sign that the variation here is not product variation.

## What is identical

- **A human creates the environment by hand**, from answers that arrived by mail, before the customer can do anything. True in all three columns.
- **The customer answers structured questions before provisioning is possible**, and in Next Foundation and Office by the same mechanism: a Typeform questionnaire sent from Salesforce, with the answers landing in a case. *(The parallel between the two products is our reading of two separate documents, not something PS has written down. What PS has written down is a cross-product remark about where the welcome mail is sent from — see the source table.)*
- **Nothing the customer supplies is validated until a consultant looks at it.** Next's internal checklist makes this an explicit manual step: *"Säkerställ att kund levererat underlag enligt deadline och i rätt format."*

## What actually differs

| | Next Foundation | Next Core | Entré Office |
|---|---|---|---|
| Who creates the environment | Assigned person | Ordered from tekniksupport | Assigned person |
| Industry adaptation | Not in the documented flow | Not in the documented flow | Standard |
| How onboarding is paid for | Packaged scope, billed T&M (`Standard Implementation`) | Packaged scope, billed T&M | Folded into the recurring price (MRR) |

**The differences do not line up along product boundaries.** On who creates the environment, Foundation and Office agree and Core is the outlier. On industry adaptation and pricing, Office is the outlier. There is no single Next-versus-Office split to design around — which is precisely the argument for treating modules, fields and destinations as configuration rather than code (design principle 7 in `PROJECT-BRIEF.md`). A portal built that way absorbs all three rows without either product changing how it sells or staffs.

Office's industry-adapted installation deserves singling out for the opposite reason: it is the only place in this material where provisioning already adapts itself to the customer's answers. It is done by hand, but it proves the concept exists inside Aceve.

## Where this sits in PS's own frameworks

Two product-neutral frames already exist, and the portal fits inside both rather than beside them:

- `Aceve Professional Services - SOW.docx` describes **Aceve's standardized delivery lifecycle** as eight Core Implementation Phases, from *Sales to Delivery Handoff* through to *Ongoing Support*. Steps 1–5 above map onto the first two, *Sales to Delivery Handoff* and *Planning & Scope*, plus the front half of *Configuration*.
- `Core Process Architecture.xlsx` holds a five-phase Onboarding model — Handoff, Setup, Enable, Activate, Handover to Support — each with a purpose written in the customer's voice (*"Our tenant is prepared for us."*). That phrasing is close to portal copy already. But its `Master Register` shows all seventeen processes at status **Not started**, its version history reads `0.00`, and *Last Reviewed* is blank: it is a frame with no content, not an agreed standard. Treat it as the shape to align with, not as authority to cite.

There are at least four phase models in circulation — eight SOW phases, five in Core Process Architecture, six in Next's PROMO checklist, and Certinia's own Template → Phases → Milestones → Tasks. Reconciling them is not this project's job, but the portal has to pick one, and picking the product-neutral one is the only choice consistent with building this once.

## The two sentences that make this document unnecessary to argue

From Next's Foundation process draft, on the step where the database is created:

> **"DETTA STEG BORDE AUTOMATISERAS!!"**

And on the questionnaire, in the same document:

> **"kund får ofta svara på samma fråga massa gånger"**

From Entré Office's start-up process, annotating the flow diagram:

> **"De gula markeringarna är automationer som idag inte fungerar"**

Two products, two authors, no coordination, same conclusion. The portal is the shared answer to a problem both teams have already written down.

## What this asks of a product team

Nothing structural, and no development time. Concretely, three things:

1. **Confirm the pattern holds for your product.** If your start-up flow does not look like steps 1–5, that is important and changes the design — say so.
2. **Name the questions you ask a customer before provisioning**, in whatever form they exist today. They become field definitions; they are not rewritten.
3. **Say what a provisioning parameter is in your product** — industry template, modules, country, legal entity, or something we have not met yet.

The portal is built product-agnostic by construction, not by intention. That only survives if a second product is in the room while it is designed rather than after.

## Verification status

- The Next and Entré Office process documents are both drafts. The Office one is marked `Utkast`, dated 2025-03-18, and carries unresolved author comments. The Next Foundation SOW documents are marked `DRAFT`. **Neither is a ratified process.** They are used here as evidence of how the work is actually described by the people doing it, which is what the argument needs — but nothing here should be quoted as settled Aceve process.
- Entré Office's interest in the portal has so far been expressed verbally (Carl, 2026-08-18) and through a delivery-side feedback session on 2026-08-19. It is not a written commitment from Office product leadership. Getting that in writing is an open action in `STATUS.md`.
- This document contains no capacity, volume, effort or cost figures, per the standing rule in `STATUS.md` §Figures.

## Sources

All on the PS SharePoint, `Shared Documents/04_Must Win Battles/Core Delivery Blueprint`:

| Document | Used for |
|---|---|
| `Utkast - NY Uppstartsprocess - Entré Office.pdf` | The Office flow, all three variants; the industry-adapted installation; the annotation on broken automations |
| `DRAFT_Foundation - SOW process.docx` | The Next Foundation flow; Typeform sent from Salesforce; the Cloudlink activation link; both quoted sentences. Also PS's own cross-product remark, on the welcome mail: *"Välkomstmail skickas via mailmall i Salesforce. (Entré skickar från Zendesk, visa gärna vid tillfälle)"* |
| `Next/Dokument PROMO/Interna checkpunkter PROMO Next.xlsx` | The Next Core flow: database ordered from tekniksupport, and the manual check *"Säkerställ att kund levererat underlag enligt deadline och i rätt format"* |
| `Next/Dokument PROMO/Kundmall - Integration Fortnox att fylla i senast XX.docx`, `Kundmall - Integration Visma Admin att fylla i senast XX.docx`, `Kundmall - E-invoice att fylla i senast XX.docx` | The customer question batteries that become field definitions |
| `Aceve Professional Services - SOW.docx` | The eight Core Implementation Phases, described there as *"Aceve's standardized delivery lifecycle"* |
| `Core Process Architecture/Core Process Architecture.xlsx` | The five-phase Onboarding model, its customer-lens purpose statements, and its own version/review status |

One document sits elsewhere, under `04_Must Win Battles/Nexus (PSA)/01_Implementation`:

| Document | Used for |
|---|---|
| `PSA Architecture .pptx` | That Office folds onboarding into MRR pricing; that Next sits under `Standard Implementation` — *"Fixed scope, predefined timeline, packaged pricing but billed as T&M"*; and PS's existing service-catalogue delivery model **Onboarding**, characterised as *"Highly templated, minimal consultancy, remote delivery. Fixed price."* and used for *"SaaS or volume segments"*. That model already describes what this portal is for |

---

*Last updated: 2026-08-20*
