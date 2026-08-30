# Identity for the Portal — One Platform OAuth2, backoffice SSO, and e-ID

*Technical note, 2026-08-20, Carl Bäckström (+ Claude). Written after the internal sweep in `Internal-Landscape-Synergies.md` surfaced One Platform as a probable answer to the external-identity question that `STATUS.md` lists as blocking.*

*Status: **candidate architecture with known limitations.** Not a decision. Nothing here has been confirmed with the One Platform Core team — every finding is read from internal documentation, and the two questions in §8 must be answered before this can be committed to.*

**Grading:** **[V]** verified against primary internal documentation · **[?]** inferred, needs confirmation.

---

## 1. The verdict in one paragraph

One Platform runs a production OAuth2 identity layer that fits a browser-based customer portal almost exactly, and Aceve staff can keep using their existing Microsoft SSO for the internal backoffice view. These are **two separate identity domains in one application** — customer-facing users authenticate against One Platform, Aceve employees against corporate Entra — and that separation is the correct design rather than a compromise. The cost of adopting it is four known constraints (§5), of which one — the `redirect_uri` whitelist — must shape the portal's URL design from the first line of code, not be discovered later. The single question that decides whether this works at all is whether One Platform can hold an organisation and its invited users **before any product entitlement exists** (§8).

---

## 2. Why this fits the portal specifically

The clearest statement of the fit comes from a KlarPris post-migration analysis explaining why their browser migration succeeded where their API migration did not **[V]**:

> *"The migration succeeded on the frontend not because our code got better, but because the browser supplies the two things OAuth2 requires: an interactive redirect target and a human who owns the password. Strip those away — as every API caller does — and the whole PKCE machinery has nothing to hook onto."*

A preboarding portal is a browser application with an interactive human at every authentication moment. It is the best-case scenario for Authorization Code + PKCE, not an edge case. The grant comparison from the same document **[V]**:

| Grant | Who authenticates | Browser needed | Identifies a *user*? | Portal relevance |
|---|---|---|---|---|
| **Authorization Code + PKCE** | A human, interactively | Yes | Yes | **This is the portal's flow.** In production, "done and verified" for KlarPris web |
| **Client Credentials** | An application | No | No — identifies the app | For the portal's own service-to-service calls (e.g. writing to a product at go-live) |
| ~~Resource Owner Password (ROPC)~~ | Human, via username+password to an API | No | Yes — **but disallowed by One Platform** | Not available. Do not design around it |

Source: [OnePlatform OAuth2 — The API-Login Problem](https://hvdgroupcom.atlassian.net/wiki/spaces/KlarPris/pages/1640235010/OnePlatform+OAuth2+The+API-Login+Problem) (David Doria, last modified 2026-07-31)

**Note on the source.** That document was written to explain a *failure*. Reading it as a warning against One Platform would be the wrong conclusion — the failure it documents is specific to headless/API callers, and it states plainly that the browser flow works. It is cited heavily here precisely because it is the most honest internal account of where the boundaries are.

---

## 3. Customer side — Authorization Code + PKCE

**What exists, verified from the One Platform service inventory [V]** — [Overview admin and backend](https://hvdgroupcom.atlassian.net/wiki/spaces/ONE/pages/1225981967/Overview+admin+and+backend) (Johan Lauri, last modified 2026-03-26):

- `Portal.Web.Auth` (`auth.entrecloud.se`) — the hosted login UI. Themeable per product, per the authentication brief, so the portal can present an Aceve-branded login without hosting credentials itself.
- `Portal.WebApi.Auth` — token issuance, login, 2FA, OTP, SSO, **guest tokens**.
- `POST /Authentication/changecontext`, `GET /Authentication/availablecompanies`, `GET /Authentication/availablesubdivisions` — context switching between companies and subdivisions without re-authenticating.
- `POST /Authentication/2fa/verify`, `POST /Otp/enable` — second factor available out of the box.
- `POST /Guest` — a guest-token endpoint. **Purpose unconfirmed [?]** — see §8.

**What this buys the portal.** The password never touches Aceve's portal code; multi-factor exists without building it; the multi-entity customer case (holding companies, subsidiaries) is handled by a platform primitive rather than portal logic. All three are non-trivial to build and all three are already there.

---

## 4. Internal side — backoffice on corporate Entra

`STATUS.md` Open Questions 11 and 15 both circle an internal backoffice view: which customers are stalled, where, and who gets the alert. That view is used by Aceve employees, not customers.

**Recommendation: point the backoffice at Aceve corporate Entra directly, and do not route staff through PCB.**

Rationale:
- Aceve staff already exist in Entra and already sign in with it daily. Internal SSO through Microsoft is in active use — referenced, for example, in a `#data-finance` thread about IT blocking applications at the Microsoft SSO layer **[V]**.
- One Platform's Entra federation carries a hard prerequisite: *"Users need to exist in PCB before they can authenticate via Entra. Entra handles authentication; user accounts still need to be created in One Platform first."* **[V]** — [What One Platform Authentication Unlocks](https://hvdgroupcom.atlassian.net/wiki/spaces/~712020ab44d21c60114f05b6c8b4cf5c155400/pages/1199505447/What+One+Platform+Authentication+Unlocks+for+Your+Business). Putting every PS and CS employee into PCB to read a dashboard is administrative overhead with no benefit.
- Staff are not customers. Keeping the two populations in separate directories avoids a whole class of permission and data-exposure mistakes.

**Note:** One Platform does ship `Portal.Web.SSOProxy — Microsoft Azure AD OAuth proxy`, and `CRUD /Companies/SSOSetting/{companyId}` allows SSO configuration per customer company **[V]**. So routing backoffice through One Platform is *possible*. It is simply not the cleaner option, and the recommendation above should be tested against the One Platform team's own view rather than assumed.

**Design consequence:** the portal is a **multi-IdP application** from day one — two audiences, two identity providers, one codebase. That is a standard pattern, but it needs to be a stated requirement for whoever builds it, not an afterthought discovered in week three.

---

## 5. Four constraints to design around

All four are verified from internal documentation. The first is the one that changes how the portal is built.

### 5.1 The `redirect_uri` whitelist — plan for it now **[V]**

For Authorization Code + PKCE, the return URL must be whitelisted on the One Platform side. From the KlarPris analysis:

- **Exact match, character for character** — scheme, host, path, and any trailing detail.
- **No self-service.** Adding, changing or removing a URL means contacting the One Platform team and waiting.
- **Volume grows.** KlarPris predicts *"at least ~15 URLs"* across environments, subdomains and entry points, and notes it grows with every new market or surface.
- The whitelisted value is matched at `/connect/authorize` **and** must be replayed byte-for-byte at `/connect/token`, so it constrains the whole flow, not just the return leg.

**What broke for KlarPris, and how the portal avoids it.** They needed to redirect a user to login mid-flow, during basket creation, where the return URL's query parameters varied per request. Exact-match whitelisting cannot accommodate that, forcing them to either pre-register every combination (impractical) or strip the URL down and lose the user's context.

**Design rule for the portal, stated plainly: return URLs must be static. Carry case, step and customer state in application state or server-side session — never in the return URL's query string.** A preboarding flow that resumes a customer mid-case is exactly the shape of application that would otherwise walk into this.

The document also notes the realistic mitigation to ask One Platform for: a **path wildcard on a fixed host** (`https://fixed-host/*`) rather than a host wildcard, since loose wildcards are an open-redirect risk that most OAuth servers correctly refuse. Phrase the request that way and it can be said yes to.

### 5.2 Never pass a token to the target product **[V]**

The mental model has to flip. From the same source:

> *"Today the products share a token; the OAuth2 model shares an SSO session. 'Switch from KlarPris to KlarCalc without logging in again' is achievable — but by having KlarCalc do a full (silent) PKCE round-trip that rides the existing HVD session, not by KlarPris shipping it a token. Passing tokens is exactly the part that breaks."*

**Consequence for the go-live handoff.** When the portal hands a finished customer over to Next, Entré or another product, the compliant pattern is that the target product runs its own silent PKCE flow against the shared One Platform SSO session. The portal does **not** mint or forward a credential. Worth writing into the handoff design before anyone builds the convenient version.

Note this is live tension, not settled doctrine: the One Platform team proposed removing token hand-off entirely and presenting a login page instead, and **Product rejected it** for KlarPris because it removes a feature users rely on daily. The cross-product switching question is open at platform level **[V]**.

### 5.3 Headless user authentication is unsolved **[V]**

ROPC is forbidden; Client Credentials authenticates the application, not the user. There is currently **no sanctioned way for a non-browser caller to prove which user it acts for.**

Mostly irrelevant for a browser-first portal — but it constrains anything automated that must act *as a named person*. Scheduled reminder jobs, backoffice automation acting on a consultant's behalf, or a future API for partners all hit this. Design such functions as service-authenticated (Client Credentials) with the acting user resolved and audited in the portal's own database, and be explicit that One Platform has not verified that user's identity.

### 5.4 Do not copy Accurator **[V]**

Accurator is recorded as having "completed" its API OAuth2 migration by accepting a token, calling a legacy *"does this user exist?"* endpoint, and storing the token — which never expires. The analysis names this directly:

> *"Accurator's approach reintroduces the exact vulnerability the migration was meant to close: a credential that never expires... 'Accurator migrated' is true organizationally but false technically."*

Flagged here because it is the cheap path, it exists as internal precedent, and someone will suggest it.

---

## 6. What else comes with PCB — worth more than the login

Adopting One Platform identity brings a service catalogue that maps onto portal requirements already specified in `PROJECT-BRIEF.md` and `ASSETS.md`. Verified from the service inventory and API reference **[V]** — [Overview admin and backend](https://hvdgroupcom.atlassian.net/wiki/spaces/ONE/pages/1225981967/Overview+admin+and+backend), [Portal Cloud — Web API reference](https://hvdgroupcom.atlassian.net/wiki/spaces/ONE/pages/1230667783/Portal+Cloud+Web+API+reference):

| Service | What it does | Maps to |
|---|---|---|
| `Portal.WebApi.BankID` | Swedish BankID: Auth, Sign, Collect, Cancel, Wait. mTLS transport | The agreement gate and the `ansvar` step (`ASSETS.md` §1) — signing, not just a checkbox. See §7 on coverage outside Sweden |
| `Portal.WebApi.Bisnode` | Company search / credit data | Design Principle 4 (*never ask for data we already hold*) at the very first step. See caveat below |
| `GET /Companies/GetCompanyByFiscalID/{fiscalId}` | Company lookup by org number | Ties directly to the Salesforce de-duplication work (`Internal-Landscape-Synergies.md` §5b) where org number is becoming the enforced master key. ⚠ documented as having a *known timeout on the subdivision path* |
| `Portal.WebApi.Filedrop` | Temporary file upload/download | The `filer` (prepare & upload) step |
| `Portal.WebApi.Mail` | Email, templates, bulk send | Superuser invite flow |
| `Portal.WebApi.Sms` | SMS via SMS Teknik, used for 2FA OTP | Second factor / fallback |
| `Portal.WebApi.Translations` | i18n — **EN, SV, FI, NO, DA** | **Gap.** The portal spec requires eight languages (adds nl, de, fr — `PROJECT-BRIEF.md` §3.8). Five of eight come from the platform; three do not |
| `POST /Users/addorupdatecompany` | Attaches a user to a company | Suggests user and company are separable — user created first, company attached after. **Hint, not confirmation** — see §8 **[?]** |

**Two caveats before treating this list as a shopping basket.**

- **Bisnode was rebranded in 2021** (to Dun & Bradstreet). An internal One Platform services review flags exactly this: *"⚠️ Rebranded 2021 - confirm integration is current."* **[V]** — [OP Services - Review & Strategic Direction](https://hvdgroupcom.atlassian.net/wiki/spaces/ONE/pages/1266515976/OP+Services+-+Review+Strategic+Direction). Note the coincidence worth raising with David Kibingua Norström: the Salesforce data team is separately evaluating a move **from Guava to Dun & Bradstreet** for company enrichment. Two functions, possibly converging on the same vendor, apparently unaware of each other.
- **This is an inventory, not an entitlement.** Which of these services the portal may consume, and on what terms, is a conversation with One Platform Core, not a given.

---

## 7. E-ID beyond Sweden — the concern is right, and there is already an answer

**The concern.** `Portal.WebApi.BankID` is documented as *Swedish* BankID only **[V]**. Aceve operates in SE, NO, DK, FI, NL, BE, DE and FR. A signing step built on Swedish BankID alone would be a Sweden-shaped feature in a product whose founding principle is that nothing may assume one market (`PROJECT-BRIEF.md` §3.1, §3.8). That is the same failure mode as building a Next-shaped tool, in a different dimension.

**The answer already exists internally.** From a bi-weekly Aceve Rise demo, 2026-06-22 **[V]** — [meeting notes](https://hvdgroupcom.atlassian.net/wiki/spaces/MFS/pages/1521287172/2026-06-22+Bi-weekly+Aceve+Rise+demo):

> *Jovan Dimitrijevic demoed the **SigniCat** integration enabling digital quotation signing via BankID or SMS OTP... email with quotation PDF sent to customer, signing via **BankID (SE) or iDIN (NL)**, SMS OTP as fallback for testing. Eric Deiman to verify iDIN signature works in production for NL.*

Signicat is an e-ID aggregator — one integration, many national schemes. Aceve Rise has already built against it and already covers two countries plus a fallback. That is a working internal pattern to reuse rather than a vendor to evaluate from scratch.

**Corroborating signal:** the PaymentsHub technical manual references *"Direct authentication services such as BankID or MitID"* **[V]**, so Danish MitID is in use somewhere in the estate too. Coverage across the portfolio is broader than the PCB BankID service alone suggests.

**Recommended position for the portal.** Treat strong e-ID as **optional and per-market, never as a gate on completing onboarding**:

1. **Default:** the agreement/responsibility step is a recorded confirmation — who confirmed, when, from where — as in the inherited flow today. This works in all eight countries on day one and blocks nobody.
2. **Where a market has e-ID and the legal text warrants it:** upgrade that step to a signature via an aggregator (Signicat is the internal precedent), with BankID for SE/NO, MitID for DK, iDIN for NL, and so on.
3. **Never make e-ID mandatory to proceed.** A German or French customer must be able to complete onboarding without one. If a signature is genuinely required, that is a Legal question tied to Open Question 8, not a UX default.

**Related, and worth knowing before choosing anything:** e-signature tooling is *already being consolidated*. Miguel Casco's Technical Debt Task Force lists *"Decommissioning of old integrations and look into consolidation of our E-Signature tools"* as in-scope, global **[V]** — [#salesforce-release-comms, 2026-04-30](https://hvdgroupone.slack.com/archives/C09CMCGJ8US/p1777556875883889). GetAccept is in use for sales contracts. **Do not pick a signing vendor for the portal independently** — join that consolidation, or at minimum ask where it landed. Picking separately is how Aceve ends up with a fourth signing tool.

---

## 8. The two questions that decide this

Everything above is contingent on these. Both are for the One Platform Core team — **Johan Lauri** is the documented author of the relevant pages and the natural first contact.

> **Q1 — Pre-product identity.** Can One Platform hold an organisation and its invited users with **no product entitlement attached**? The portal's founding requirement is that the account is not bound to a product until go-live (decision 2026-08-10, `PROJECT-BRIEF.md` §1). PCB is organised around companies and product enrolment. `POST /Users/addorupdatecompany` suggests user and company are separable, but that is an inference from an endpoint name. **[?]**

> **Q2 — What is `POST /Guest` for?** A guest-token endpoint exists in `Portal.WebApi.Auth`. If it is intended for exactly this — an authenticated identity that precedes full account provisioning — it may be the mechanism. If it is for something else entirely (anonymous sessions, support impersonation), it is a red herring. Documented nowhere found in this sweep. **[?]**

**Secondary questions for the same conversation, in priority order:**

3. Can we get a **path wildcard on a fixed host** for `redirect_uri`, or must every URL be individually registered? What is the turnaround for a whitelist change?
4. What is the sanctioned pattern for the **go-live handoff** to a target product, given that token passing is explicitly not it, and given the cross-product switching question is still open at platform level?
5. Is the **Bisnode** integration current post-rebrand, and is company lookup available to a new consuming service?
6. What is the **lead time and capacity** to onboard a new service to One Platform authentication? The 2026 business plan records 3 developers in Core; this is architecturally right but may not be fast.

---

## 9. What this changes

- **`PROJECT-BRIEF.md` §5** — identity moves from *"Unresolved"* to a named candidate with known limitations, pointing here. Applied 2026-08-20.
- **`STATUS.md` Open Question 2** — should be re-scoped from *"not started"* to the two specific questions in §8. Not yet applied; see `Internal-Landscape-Synergies.md` §9.
- **A new requirement for whoever builds this:** the portal is a multi-IdP application (customers on One Platform, staff on Entra), and its return URLs must be static. Both are cheap if known on day one and expensive to retrofit.

**What this does not change.** Hosting (`STATUS.md` Open Question 3) is untouched by this note and remains the critical path flagged since June. One Platform answers *who the user is*, not *where the portal runs*.

---

*Last updated: 2026-08-20 by Carl Bäckström (+ Claude). Nothing in this document has been confirmed with the One Platform Core team.*
