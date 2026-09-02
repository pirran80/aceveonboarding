# DESIGN-BRIEF — Aceve Onboard, customer-facing portal

*Written 2026-08-20 (Carl + Claude). For whoever designs and builds the UI. Visual identity follows the Aceve master brand design system (the `aceve-branding` skill is the source; key values reproduced below). Interaction patterns are lifted from the validated prototypes — see `CUSTOMER-FLOW.md` for the flow itself. One outstanding source: the original 19k-character Stitch design brief exists but is only retrievable by the project owner in the Stitch editor (`STATUS.md` Next Action 1) — until it is in the folder, intent documented here is inferred from the captured screens.*

---

## 1. Design intent

This portal is the customer's **first working session with Aceve** — often before they have met a consultant. It has to do three things at once: feel like Aceve (trustworthy, calm, professional), make a non-technical customer confident handling their own business data, and make progress unambiguous for several people working in parallel. The competitive scan (`research/Competitive-Inspiration-Research.md`) points the same way: the products that win this category (Rocketlane, GuideCX, Flatfile) win on *clarity of what is left to do*, not on visual flourish.

Guiding qualities: **calm over clever, progress over decoration, one obvious next step at all times — and momentum made visible.** The UX should be self-explanatory, guiding and motivating (Carl, 2026-08-20): every completed step should feel like earned progress, and the customer should always be able to answer "what do I do next, and how far along are we" without asking anyone.

## 2. Visual identity (Aceve master brand)

Product-agnostic rule applies to branding too: the portal carries the **Aceve** master brand, never a product sub-brand (Next, Entré). The product name appears as content ("your onboarding to Next Project"), not as identity. White-label/chain-branded variants (Ahlsell Office etc.) are a known future question (`STATUS.md` Q45) — keep theming token-driven so a brand swap is configuration.

- **Font:** Manrope (Google Fonts), weights 400–800. Web always uses Manrope.
- **Light-first:** white / `#FBFFF0` backgrounds ~70–80%; deep green sections only for hero, dividers and key callouts.
- **Tokens** (CSS custom properties, from the design system):

```css
--aceve-deep-green: #152F1A;   /* headings, dark cards */
--aceve-primary-green: #24462B;/* body emphasis */
--aceve-mid-green: #457951;    /* secondary text, borders */
--aceve-light-green: #BDD78F;  /* accents, progress */
--aceve-accent-green: #E1FFAE; /* badges, highlights, hover */
--aceve-pale-bg: #FBFFF0;      /* card washes */
--aceve-green-500: #92B97A;    /* dividers, secondary icons */
--aceve-near-black: #0B1B11;   /* max-contrast text, sparingly */
```

- **Logo:** Aceve logotype SVG top-left (DEEPGREEN on light); symbol SVG as favicon. Bundled assets from the design system — never redrawn, never hotlinked. (The sandbox hotlinks a logo from `adelisequity.com` and themes on navy `#1a263b` — **do not carry either forward**; the navy was sandbox styling, not brand.)
- **No purple anywhere.** Links use the system link colour.
- Status colours (success/warning/error) must sit on top of the green palette without ambiguity — do not use brand greens as semantic "success" if it collides with accent use; define semantic tokens separately and test them against WCAG contrast.

## 3. Layout

- **Persistent left sidebar = the whole journey.** Both phases and the finish step, always visible, with per-step state. This is the inherited, validated backbone (all three prototypes share it). Grouped headers: FÖRBEREDELSE / DATAMIGRATION / SLUTFÖR (as i18n keys).
- **One step at a time in the main pane.** Each step: title, one-line purpose subtitle, the content, and a footer with status pill + "Nästa steg →".
- **Global progress** as a single percentage over gated steps (Prototype A: progress = % of gated steps complete) plus per-step state badges.
- Generous whitespace, cards for grouping (light accent cards `#FBFFF0`/`#E1FFAE` with deep green text), rounded 8–12 px.

## 4. Interaction patterns to keep (validated in prototypes)

1. **Entry states the signed agreement as a fact — no confirmation checkbox.** *(Changed 2026-08-31, Carl: supersedes the original "agreement gate" checkbox.)* Entry is triggered by the closed-won opportunity in Salesforce, so the signed agreement is already a fact when the customer lands; the welcome step opens with an informational notice ("Ni har signerat avtal med Aceve för [produkt] — därför är ni här") and a single "Kom igång" action that opens the flow and stamps the entry. The original checkbox belonged to a different scenario — the portal as a lead-generating surface with self-signup — which is possible later scope, not today's flow.
2. **Sequential unlock with visible lock states.** Step states: `complete | active | available | locked`. The final step, when locked, lists **exactly what is outstanding** by name — never a bare disabled button.
3. **Country + language route the journey** — and say so to the customer: *"Land och språk styr vilken produkt och vilka webbinarier ni lotsas till."* Routing made visible builds trust.
4. **Prefilled ≠ empty.** Salesforce-seeded fields render as confirmed values to review, visually distinct from fields the customer must fill. Never present a form that asks for what we already know.
5. **Legacy-source toggle with conditional blocks.** "Which system are you coming from" reveals per-source fields and export-route guidance (e.g. BSO → IT contact).
6. **Repeating-row people editor with a live validity counter** ("1 giltiga · minst 2 krävs") and per-row delete. Per-user × per-webinar check matrix.
7. **The method matrix (Migrationsplan).** One row per data category, type badge (DIREKTIMPORT / EXCEL / INTEGRATION / MANUELLT), method chips per row (GI-mall / Excel / Integration / källexport / Hoppa), plus a collapsed "done manually after go-live" group. This screen is the customer's mental model of the whole migration — invest here.
8. **Semantic model shown before import.** Target fields as chips, mandatory highlighted, with the plain-language caption that AI auto-matches their columns against these. Sets expectations before the importer opens.
9. **Import method cards**: GI-mall sheet (disabled until GI-mall uploaded, showing which sheet it will use) / upload Excel / skip ("done manually after go-live") — skipping is a first-class, guilt-free choice.
10. **Errors vs warnings, honestly.** Per-cell: hard error only where the import would break; warning where the rule is a convention; info otherwise. Mirror this in copy tone.
11. **Consent split in three** (read & understood / AI-tools approval / inform-your-staff obligation) under a DATABEHANDLING OCH AI heading — pending Legal wording (`STATUS.md` Q8).
12. **Multi-user presence.** Assignee chip per data category; progress made by a colleague visibly attributed ("Uploaded by Anna, 2 Sep"). The predecessor died on invisible colleagues — make collaboration visible.

## 5. Ingestro embed

Follow the vendor's own integration pattern (their reference integration): the importer opens as a **modal from a card inside the step**, not as a bespoke full-screen wizard. Theme it with brand tokens via the SDK's style settings (`custom_style` is plan-gated — verify, `STATUS.md` Q29). The six SDK steps (upload → … → review) are the vendor's UI; our design job is everything before and after the modal.

## 6. Language, tone, i18n

- **8 languages from day one:** sv, en, no, da, fi, nl, de, fr. All copy through i18n keys from the first commit; no hardcoded strings, including validation messages.
- Tone: consultant voice — "vi rekommenderar", plain language, no system jargon. Explain *why* a step exists in one line under each title (the Stitch subtitles are the template).
- Swedish copy quirks in the sandbox to fix, not inherit: "SEO" (should be BSO), "processamordnaren" (should be Byggsamordnaren).
- **No unvalidated figures in UI copy** — the Stitch "~75% automatisk konvertering" line is banned under `STATUS.md` §Figures.

## 7. Accessibility and quality bar

- **WCAG 2.1 AA is a requirement.** Prototype A explicitly fails it (no form semantics); do not inherit that. Real `<form>` semantics, labels, described errors, focus management in the step flow and the modal, full keyboard navigation.
- Contrast-check all green-on-green combinations; the pale greens fail on white for text — use them for fills, not type.
- Touch targets ≥ 44 px; the portal will be used on laptops but must survive a tablet.
- Empty, loading, error and stalled states designed for every step — a data-migration portal spends most of its life in partial states.

## 8. Backoffice view (internal)

Separate surface, same design system, denser: customers × categories × status grid, stall flags, approval queue. Entra-authenticated. Requirements in `STATUS.md` Next Action 9 / Q11 / Q15. The loose Stitch "ACEVE PORTAL" settings screen (see RECOVERY-NOTES §"One artefact, not a design decision") is **not** part of the customer design but its three mapping toggles are a reasonable starting set here.
