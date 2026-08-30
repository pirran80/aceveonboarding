# Points for the next Ingestro sync

*Drafted 2026-08-20 (Carl + Claude). Revised the same day after reading the Ingestro email history — see "What the email history changed" at the bottom, which matters more than the draft itself.*

*Framing: at the 2026-08-06 sandbox walkthrough, Harmen Juffer's own action item was to send the Calendly link and recording, then **request 5–6 points from us for the next sync**. This is that list. It is not a cold question email — it is the thing they asked for, which is why it should get a real answer.*

*Recipients: **Harmen Juffer** (ran the sandbox demo, so the technical points land with him) and **Chris Zhang** (CSM), with **Orlando Neto** (solution engineer) on copy. Internally: **Eric Lindberg** — see the coordination note below, he should see this before it goes out.*

---

## The email

**Subject:** Points for our next sync — importer state, field-value mapping, mapping reuse

Hi Harmen, Chris,

Following up on the sandbox walkthrough on 6 August, and the points you asked us to bring to the next sync. We have since done the internal design work on the portal the importer will sit inside, and six questions have come out of it that we cannot answer from the documentation.

Context in two sentences, because it explains why these six and not others. We are building a customer-facing onboarding portal where a new customer prepares and imports their own data **before** we have provisioned an account, licence or database for them — several people at the customer contributing different data categories over days or weeks, with both the customer and Aceve confirming the data before anything is written to the target product. That shape puts weight on state, on mapping reuse across customers, and on exactly what leaves the browser.

**1. Does a partially completed import survive a page reload or a new session?**

If a user is midway through mapping or reviewing and closes the browser, is any of that state recoverable, or does the import start again from file upload? We have assumed it does not survive — which follows from frontend processing — and have designed so that our portal, not the SDK, holds state between sessions. We would rather have that confirmed than discover we rebuilt something you already provide.

**2. The opt-in "AI Mapping for field values" — what exactly leaves the browser?**

This is the most important one for us. Our understanding is that column-header matching happens client-side, but that this opt-in feature processes actual field *content*. Specifically: what is transmitted and to which model or subprocessor, is any of it retained or used for training, is it currently enabled on our licence, and can it be enabled or disabled per import rather than per account? This is being asked in parallel by our privacy team as part of a vendor assessment, so a written answer is more useful to us than a verbal one.

**3. Mapping reuse across customers — how is it actually persisted?**

Two related things. First, the **"Auto Remember Function"** listed in Appendix 1 of our plan: we have not found a description of it anywhere — does it persist mappings, and is that scoped per end user, per data schema, or across all imports on our licence? Second, we want to build our own library of source-column-to-target-field mappings, accumulated from every approved import, and feed it back in by generating column definitions including `alternativeMatches` at runtime from our own database. Is that supported, and how does your matching engine's own learning interact with aliases we supply — do they complement each other, or does one override the other?

**4. Partial submit and error-row export.**

In the demo you showed valid rows being submitted immediately while error rows are exported for correction. We want to build on that. How does the corrected set come back — is there a supported path for re-submitting only the corrected rows against the same target model, and what does the SDK return to us for each part so we can track a partially imported data set?

**5. How is an upload counted against our monthly contingent?**

Our plan includes 7,000 file uploads per month under the label "Next One Technology AB". We would like to be precise about what increments that counter: a file selected, a completed import, or something else. In particular: a multi-file upload, and the error-row re-submit in point 4 — one upload or two? This decides a real design choice for us, namely whether we push users to correct data inside the importer or to fix and re-upload.

**6. "Data Flows" / the no-code flow builder — what is its status?**

Chris mentioned a new product called Data Flows in June, and Harmen demoed a no-code flow builder on 6 August. We are not clear whether these are the same thing, how either relates to Data Pipelines, or whether either is included in or available as an add-on to our Business plan. Not urgent for our first phase, but we would rather know now than design around its absence and find out later.

Happy to take these on a call — but for 2, 3 and 5 we would like the answer in writing either way, since they feed a design decision and a privacy assessment.

Best regards,
Carl Bäckström
Professional Services, Aceve

---

## What the email history changed

Five things came out of the Ingestro thread that were not in the project folder. Two of them change the draft, and one changes who should send it.

**Eric already owns "API vs staging" as an action item.** The Fathom recap of the 2026-08-06 meeting lists, for Eric: *"Align w/ Magnus on resources; then define implementation plan (API vs staging, client IDs, bulk pre-pop, error handling)."* The staging question is not new and it is not unowned — it has been sitting with Eric since 6 August, and he is also the Ingestro relationship owner. Sending vendor questions on the same topic without syncing with him first risks duplicate work and a mixed message to Ingestro. **Talk to Eric before this goes out.** The upside is that `PROJECT-BRIEF.md` §5.1 is a concrete proposal he can react to, which is a better starting point than an open question.

**"AI Mapping for field values" is a real exception to the privacy story.** André Ijspelder's email of 2026-08-20 describes it as an opt-in feature that determines *"whether Ingestro processes actual field content, rather than just column headers."* Everything in the project folder says data never leaves the browser. If this feature is enabled, that is not the whole picture — and the staging argument in §5.1 partly rests on it. This is now question 2, and it is the one that matters most.

**A verified, dated commercial fact worth recording.** Per the same email: Ingestro confirmed **in writing on 2026-08-19** that the 2022 contractual restriction on importing special-category, credit, financial, biometric, genetic or under-16 data no longer applies under the 2026 contract. That is a written vendor confirmation, not project memory, and it is directly relevant to what may be held in staging.

**The field-level data classification is already outstanding, and it is on Carl.** André is asking for legal basis, country, tool/DPA link and retention period per field. That is exactly what the staging model needs in order to be legal, and someone is already waiting on it. It is not a new task — it is Open Question 25 with an owner and a requester attached.

**Ingestro proposed bulk upload over sequential.** At the 6 August meeting they argued the sequential model was too slow for large migrations and proposed a single bulk file up front, with the customer self-cleaning across all categories in one session; Eric confirmed it was feasible by reading from blob storage. Carl's 2026-08-10 decision — sequential, with optional assisted bulk load-in — already resolves this, and the staging model in §5.1 supports both. Worth knowing that the vendor's instinct ran the other way, and why, before the next conversation.

**One figure deliberately not carried across.** The Fathom recap contains a legacy-data error rate, and contradicts itself about it two lines later. It is an AI-generated meeting summary — the exact source `STATUS.md` §Figures already ruled out for this specific figure. It stays out. The re-reading is independent confirmation that removing it was right.

## Notes before sending

- **Do not mention a second product or a second label.** Organization Accounts are priced per label; signalling a second brand in passing weakens the position when that negotiation actually happens.
- **No volumes, no timelines.** Nothing in this project quotes customer counts or deadlines. The questions do not need them.
- **Ask for written answers on 2, 3 and 5** even if they offer a call. These go into `PROJECT-BRIEF.md` §5.1 as verified facts, and a call leaves nothing citable.
- **The sandbox closes 2026-08-31.** Eleven days from this draft. The before/after measurement Magnus asked for on 2026-08-10 needs that sandbox, and it is still outstanding (`STATUS.md` Next Action 2). It does not depend on any answer in this email.
