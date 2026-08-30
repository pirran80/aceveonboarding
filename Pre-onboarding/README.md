# Aceve Onboard — Preboarding & Onboarding Portal

Working name: **Aceve Onboard** (adopted 2026-08-20, provisional — see `STATUS.md` decision log).

A web portal where a new Aceve customer prepares and migrates their own data — **starting before we have provisioned an account, licence or database for them**, which is the main track, and **continuing through the implementation** when a database exists and some data is already migrated (scope clarified by Carl 2026-08-20; see `STATUS.md` decision log). Product-agnostic by design; the first delivery case is one product's migration wave, and a second product has expressed interest verbally (Carl, 2026-08-18 — not yet documented in writing).

Owner: Carl Bäckström, Professional Services. Co-lead: Pierre Lindbom (build, since 2026-08-20). Technical counterpart from the start: Eric Lindberg — the Stitch design model, the Ingestro sandbox, the standalone-service architecture steer, and the ongoing Ingestro vendor relationship. Carved out of the BSO Sunset project 2026-08-18.

**North star:** time to value — for the customer and for Aceve. Reuse data we already hold (Salesforce, our products), capture everything as configuration, automate as far as verified behaviour allows — with fully self-service onboarding as the north-star end state — and keep the same status visible to both sides.

## Folder structure

```
/                  Core documents — start here
pitch/             One-pager and pitch deck (what to show a stakeholder)
build/             What a builder needs: build spec, customer flow, design brief,
                   open vendor questions
research/          Evidence base: identity, internal landscape, portfolio/packaging,
                   competitive scan, cross-product pattern, original requirements brief
reference/         Load-bearing artefacts: recovered Ingestro sandbox source, mapping
                   transformer, Prototype A mockup, signed MSA, Salesforce one-pager
archive/           Historical. Superseded prototypes and documents. Do not build from these
```

## Read in this order

| Audience | Read |
|---|---|
| Stakeholder, 5 minutes | `pitch/ONE-PAGER.md` (deck: `pitch/Aceve-Onboard-pitch.pptx`) |
| Anyone picking this up cold | This file → `PROJECT-BRIEF.md` §1–3 → `STATUS.md` first paragraph |
| **Builder (/fullstack-engineer)** | `build/BUILD-SPEC.md` → `build/CUSTOMER-FLOW.md` → `build/DESIGN-BRIEF.md` → `reference/prototype-C-ingestro-sandbox/RECOVERY-NOTES.md` |
| Deciding or changing direction | `PROJECT-BRIEF.md` (stable) + `STATUS.md` (volatile: decisions, people, 45 open questions) |

Core documents:

| File | What it holds | Volatility |
|---|---|---|
| `PROJECT-BRIEF.md` | Vision, design principles, scope, architecture, data-model direction | Stable — change only if the direction changes |
| `STATUS.md` | Where it stands, decision log, people, open questions, next actions | **Update this one** |
| `ASSETS.md` | Every inherited file, what is in it, verdict on reuse vs. discard | Update when assets change |
| `build/BUILD-SPEC.md` | The consolidated engineering brief: data model, module registry, integration contracts, phase-1 backlog, do-not-assume list | Update as build decisions land |

## The five rules that survive every rewrite

1. **Product-agnostic by construction.** Nothing in data model, URLs, terminology or UI may assume any specific product. A hardcoded module or field list is a defect. Steps and fields will keep evolving and will vary by product, country and customer size — that variation lives in configuration, never in code.
2. **Every field carries its destination** — Ingestro import mapping, product API configuration field, or provisioning parameter — resolved at go-live.
3. **Never ask for data we already hold.** Salesforce seeds the portal; the portal enriches Salesforce back.
4. **AI proposes, rules execute — human confirmation is the default, full self-service is the north star.** Nothing is written to a live product database without explicit confirmation, until a flow is verified well enough to graduate to automation per product and customer type. Tools read, never write, unless Carl explicitly says otherwise.
5. **No unvalidated figures anywhere in this project** — this explicitly includes legacy BSO programme figures, the historical source of the rule. See `STATUS.md` §Figures before quoting any number.

## Conventions

- Documents in English (audience includes non-Swedish-speaking developers and Ingestro).
- Nothing is stated as fact without a source or an explicit "unverified" flag. Claims carried from working sessions rather than documents are labelled *(project memory)*.
- Restructured 2026-08-20: the former `Onboarding Portal - handover/` folder was dissolved into the structure above; `.bak` files, a duplicate zip and the `BSOExcel` executable folder were deleted (the export tool is owned outside this project — see `PROJECT-BRIEF.md` §6). File locations in older documents may reflect the pre-2026-08-20 layout; `ASSETS.md` carries the location map.
