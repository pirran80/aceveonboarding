# Prototype C — recovered from the Ingestro sandbox

*Recovered 2026-08-18 by Carl + Claude, via Chrome. Source: CodeSandbox devbox titled **"Ingestro / [Aceve] Sequential Import Sandbox V2"**, `codesandbox.io/p/devbox/prod-framework-4hyyps`, live preview at `4hyyps-3000.csb.app`.*

## What is in this folder

| File | Status |
|---|---|
| `App.tsx` | **Recovered 2026-08-18, 911 lines.** Complete except: original indentation (run Prettier), the `valueFor()` demo-value generator (~150 lines of sample-data logic, not load-bearing), and 16 of 20 synthetic seed records. Everything structural is verbatim — since **verified character-identical** to the original |
| `App.original.tsx` | **The original, 1,652 lines**, from the full devbox download on 2026-08-20. Properly formatted, seeds intact. Use this one |
| `styles.css` | **The original**, 12,755 characters. Same download |
| `package.json` | **The original.** Exact dependency versions, incl. `@ingestro/importer-react` 4.8.5 |
| `ingestro-reference-integration/` | **Ingestro's own demo integration** — `App.tsx` + `utils.ts` from the "Thinkific Student Importer" that was sitting in the same devbox, extracted from its webpack source map. Not Aceve material; it is how the vendor embeds their own importer. See §"What the full sandbox download added" |

## Not recovered (and how to get it, while the sandbox still exists)

*Mostly closed out on 2026-08-20 by downloading the devbox as a zip — see the last section of this file. `styles.css`, `package.json` and the full `App.tsx` are all in the folder now. The recovery recipe below is kept because it still works and may be needed for another sandbox.*

- **Deeper Stitch screens** — still outstanding. The Stitch preview kept timing out on screenshot capture after the first screen. This one dies with the platform.

**Recovery recipe** (worked reliably, no CodeSandbox login needed — the preview is public):

1. Open `https://4hyyps-3000.csb.app/` in Chrome.
2. The webpack dev build ships a source map with full original sources at `/static/js/bundle.js.map`. Fetch it and read `sourcesContent[sources.indexOf('/project/workspace/src/styles.css')]`.
3. To get large text out, strip the page's scripts, replace `document.body` with a single `<pre>` holding ~500 lines of the content, and read it. Note: `:`, `;` and `=` in returned content can trip an output filter — substitute them for placeholder characters and restore afterwards.

## The structure worth carrying forward

**Two phases in one sidebar.** `prepItems` (6 preparation steps) then 17 data-migration modules under a "Datamigration · Ingestro" group, then a locked "Skicka & boka uppstart" footer card. This is Prototype A's flow with Phase 2 built out for real.

**The 17 import modules — and they resolve the GI-template question.** Each module has `id`, `name`, `shortName`, `sheetName`, `title`, `description`, and an explicit `labels` array (the real field list, with `*` marking required). They map 1:1 onto the GI template tabs, in order:

| # | Module (`id`) | Fields | GI tab |
|---|---|---|---|
| 1 | `foretag` Företagsuppgifter | 20 | required |
| 2 | `timpriser` Timpriser & roller | 9 | required |
| 3 | `prislista` Prislista | 11 | required |
| 4 | `projekttyper` Projekttyper | 1 | required |
| 5 | `skattereduktion` Skattereduktion | 3 | required |
| 6 | `lonetillagg` Lönetillägg | 14 | required |
| 7 | `anvandarregister` Användarregister | 27 | required |
| 8 | `betalningsvillkor` Betalningsvillkor | 4 | required |
| 9 | `franvaro` Frånvaro | 2 | required |
| 10 | `paslagsmall` Påslagsmall | 6 | required |
| 11 | `projekt` Projektlista | 21 | optional ("Ev.") |
| 12 | `kontoplan` Kontoplan | 9 | optional |
| 13 | `kunder` Kundregister | 33 | optional |
| 14 | `leverantorer` Leverantörer | 21 | optional |
| 15 | `kundkontakter` Kundkontakter | 10 | optional |
| 16 | `leverantorskontakter` Leverantörskontakter | 7 | optional |
| 17 | `ovrigt` Övrigt | 4 | optional |

Titles 11–17 all carry the "Ev." prefix, matching the optional/orange GI tabs. This is the 10-required + 7-optional split — so `bso-onboarding-handover.md` is right and `BSO-onboarding-MALL.xlsx` (7 required / 4 optional) is the outlier. **Treat this list as the current field-level ground truth for a Next onboarding, and still have PS confirm it.**

**Columns are generated, not hand-written.** `makeColumns(labels)` derives, per field:
- `key` — slugified label, ASCII-folded (å/ä→a, ö→o, %→procent, &→och), de-duplicated with a numeric suffix.
- `columnType` — inferred by regex: `email`, `date`, `category`, `float`, else `string`.
- `alternativeMatches` — 5 alias strings per field (a friendly alias, the clean label, plus "… export", "… från mall", "… värde"). **This is the AI-matching seed: it is how a customer's differently-named column gets recognised.** An accumulating alias library is exactly the mapping asset described in `../../PROJECT-BRIEF.md` §3.6.
- `validations` — `required` for every `*` field, with a Swedish error message.
- `dropdownOptions` — hardcoded value lists for user licence, project status, compensation form, customer/supplier type, invoice type, currency, language and tax-reduction setting.

**Validation runs per cell, at three levels.** `buildCellUpdates()` is wired to both `onEntryInit` and `onEntryChange`, and emits `error` / `warning` / `info` per cell: required-but-empty, malformed email, org/personal number not matching `^[0-9]{6,8}-?[0-9]{4}$` (warning, not error), negative amounts, and category values outside the known list (warning). Good instinct to keep: **soft warnings where the rule is a convention, hard errors only where the import would actually break.**

**Sequential unlock, one line of logic:**
```js
const canStart = (index) =>
  index === 0 || Boolean(completed[sheetDefinitions[index - 1].identifier]);
```
Module status is `complete | active | available | locked`; on a successful import `onResults` marks the module complete and advances `activeIndex` to the next one. Note the sandbox renders **all 17 `<DataImporter>` components at once** in a hidden container and drives them via `ImporterSession.verify()` / `ImporterSession.start()` — a workaround, not necessarily the pattern to keep.

**Ingestro settings actually used** (`createSettings`): `prompts: true`, `cleaningAssistant: true`, `mergeHeaders: true`, `metadataSelection: true`, `transpose: true`, `modal: true`, `developerMode: false`, plus a theme object matching Aceve navy `#1a263b`. Identifier convention: `next_${id}_import` — **product-prefixed, which is the right instinct and needs to become a real per-product namespace.**

**Sample-file generator.** `downloadSample()` builds a two-sheet XLSX per module: 30 generated rows plus a second sheet of deliberate junk ("Irrelevant exportdata") to prove the importer ignores non-data tabs. `makeSampleRows()` seeds four defects on purpose — an empty required cell (row 6), a malformed org number (row 9), a negative amount (row 13), a broken email (row 17). Keep this: it is a self-testing demo.

## Flags for the build

1. **`licenseKey="non-commercial"`.** The sandbox runs on a non-commercial Ingestro key. Production needs the licensed key under the signed Business plan (label "Next One Technology AB") — and the per-label Organization Account pricing kicks in as soon as a second product joins.
2. **Everything is hardcoded in one 1,653-line file.** Modules, fields, dropdown values, aliases, validation rules and Swedish copy all live in `App.tsx`. Fine for a sandbox; it is the exact opposite of the product-agnostic, definition-driven model the portal needs (see `../../PROJECT-BRIEF.md` §5).
3. **`transpose: true` and `mergeHeaders: true` are on** — worth understanding why before turning them off; they likely handle real-world GI-template layouts.
4. **The logo is hotlinked from `adelisequity.com`.** Cosmetic, but do not carry that into anything customer-facing.
5. **Copy quirks to fix, not inherit:** the sidebar says "Profil, geografi, **SEO**" (Prototype A says "BSO" — a typo introduced here) and a checklist header says "Förberedelser i **processamordnaren**" (should be Byggsamordnaren). The hero text openly says only the styling was changed to match the mockup.

## Eric's Stitch mockup — captured structure

`stitch.withgoogle.com/preview/1240464358428349762?node-id=e61f07237a6c4048a2c4a74f89d85672` (confirmed live 2026-08-18; the preview renders from `app-companion-430619.appspot.com`, which returns an empty shell if opened directly, so it can only be viewed through Stitch).

Sidebar, as rendered: **FÖRBEREDELSE** — Välkommen (Introduktion), Företagsuppgifter (Grund, land & språk), Er verksamhet & bakgrund (Profil, geografi, BSO), Superanvändare (Minst 2 personer), Webbinarier (3 utbildningar), Ansvarsfördelning (Läs och bekräfta). **DATAMIGRATION [INGESTRO]** — 1 Migrationsplan (Gi-mall & metodval), then 2 Kontoplan, 3 Användarregister, 4 Timpriser & roller, 5 Prislista, 6 Kundregister, 7 Projektlista (each "Import & kolumnmatchning"). **SLUTFÖR** — Skicka & boka uppstart (Lås upp när allt är klart). Header carries an agreement gate ("Vi har ett signerat avtal med Aceve för Next Project") and a two-card explainer: "Fas 1 – Förberedelse" / "Fas 2 – Datamigration [Ingestro]". Progress shown as 17% klart.

**Note the divergence:** Stitch shows **7** data categories led by a *Migrationsplan* step and **starting with Kontoplan** (the documented correct import order). The sandbox implements **17** modules starting with Företag. Stitch is the intent; the sandbox is the build. The 17-module list is the more complete field inventory, but the sandbox's import *order* does not match the order every other source says matters.

---

## What the full sandbox download added (2026-08-20)

Carl downloaded the sandbox devbox as a zip (`../sandbox-devbox-4hyyps.zip`, 10.9 MB) on 2026-08-20. Everything below is read out of that archive. Claims are graded **[V]** verified in the artefact itself, **[R]** reasoned from the code but not vendor-confirmed, **[?]** open.

### What the archive actually contains

Two different applications are layered in one devbox:

| Path | What it is |
|---|---|
| `src/` + `public/` | **Our** sandbox — "Ingestro Custom Sandbox", the 17-module sequential Next import, built on `@ingestro/importer-react` **4.8.5** |
| `build/` | A **stale build of a different Ingestro demo** — "Thinkific Student Importer", built against `@getnuvo/importer-react` (the former package name). Left in the devbox; not related to Aceve |
| `build/static/js/*.js.map` | 20 MB webpack source map. Contains the Thinkific demo's **full original source**, and makes the bundled SDK readable |

**The recovery was faithful. [V]** Normalised for whitespace, the `App.tsx` in this folder is character-identical to `src/App.tsx` in the archive apart from the deliberately trimmed `companySeeds` / `peopleSeeds` arrays. No rework needed; the field lists, validation rules and unlock logic already documented above stand.

### Ingestro's own reference integration

The Thinkific demo is how the vendor themselves embed the importer in a host SaaS product: not a dedicated wizard, but an "Import from file" card inside an ordinary admin list view, next to a "Download sample CSV" link. Its verbatim settings object: **[V]**

```ts
{
  developerMode: false,
  identifier: "thinkific-students-importer",
  allowManualInput: true,
  modal: true,
  disableTemplates: true,
  columns: STUDENT_COLUMNS,
  columnMappingConfiguration: {
    processingMode: "browser",
    layers: ["exact", "historic", "smart", "fuzzy"],
    threshold: 0.65,
  },
  prompts: true,
  style: { globals: { primaryColor, secondaryColor } },
}
```

Result handling uses `PassSubmitResult({ successfulRecords, failedRecords, title, text, imageUrl })` inside an `OnResults(results, errors, complete)` callback. Column definitions are `{ key, label, columnType, validations: [{ validate: "required" }] }`.

### SDK 4.8.5 surface, read from the bundle

**Six steps, not four. [V]** The progress keys are `upload → sheet_selection → header_selection → join_column → match_column → review_entries`.

**Multi-file join and append are built in. [V]** The importer can join several uploaded sheets on chosen columns (with a unique-match percentage shown to the user) or append columns from one sheet to another, before mapping. Relevant to "the customer sends five export files" — that may need no build on our side. **[?]** Not yet tested.

**30 built-in column types. [V]** `string`, `boolean`, `int`, `float`, `category`, `date`, `date_dmy`, `date_mdy`, `date_iso`, `datetime`, `time_hms`, `time_hms_24`, `time_hm`, `time_hm_24`, `email`, `url`, `url_www`, `url_https`, `phone`, `zip_code_de`, `percentage`, `country_code_alpha_2`, `country_code_alpha_3`, `currency_code`, `currency_eur`, `currency_usd`, `bic`, `vat_eu`, `gtin`, `iban`, plus `single-select`. There is **no Swedish postcode or organisation-number type** — those fall to `regex`.

**Conditional requirements exist as first-class validations. [V]** `required`, `required_with`, `required_without`, `required_with_all`, `required_without_all`, `required_with_values`, `required_without_values`, `unique`, `regex`. Field interdependencies do not need to be built by us.

**The review grid is Handsontable. [V]** Commercial licensed grid, bundled inside the SDK. Filters, find-and-replace, sort, freeze/hide columns and the error/warning popovers all come from it.

**End users can create their own columns and dropdown options** in the review step (`txt_create_new_column`, `txt_create_new_option`). **[R]** This conflicts with the rule that every field must bind to a product API field or an Ingestro mapping — a column the customer invents has no destination. Decide deliberately whether to disable it.

**Mapping is a configurable four-layer engine. [V]** `layers: ["smart", "historic", "fuzzy", "exact"]` (that is the default order), `threshold` default `0.6`, `processingMode` `"browser"` or `"node"`. A parallel `optionMappingConfiguration` with the same shape governs matching of **values** inside select/category columns, not just headers.

### Licence plan gates the features — this is the important one

The SDK calls `POST /verify` with the licence key and reads `plan_detail` back, then switches features off client-side. **[V]**

- Gated features: `automatic_mapping`, `cleaning_assistant`, `contextual_engine`, `smart_table`, `node_processing`, `dynamic_import`, `multiple_file_upload`, `remember_mapping`, `data_handler`, `custom_style`, `i18n`, `watermark`, `input_types`
- Limits: `upload_size_limit` (default 25 MB, `0` = unlimited), `sdk_rows_limit`
- Plan names appearing in the code: `starter`, `business`, `enterprise`, `test_account`

Observable consequences in the code: on `starter`, automatic mapping and custom styling are off. Without `node_processing`, mapping is **forced** to `processingMode: "browser"` and the `smart` and `historic` layers are **stripped out**. Without `remember_mapping`, `historic` is stripped. **[V]**

**Self-hosting is supported. [V]** Setting a `baseUrl` switches the SDK to `{baseUrl}/sdk/v1`, `/sdk/service/v1`, `/sdk/mapping/v1` and flags the session `isSelfHosted`. The default backend is `api-gateway.getnuvo.com`.

### What this says about existing open questions

- **Open Q22, "Auto Remember Function".** Almost certainly the `remember_mapping` plan feature, which enables the `historic` mapping layer — matching against previously accepted mappings. **[R]** Confirm the naming with Ingestro.
- **Open Q26, does field *content* leave the browser.** The code gives a precise candidate mechanism: `optionMappingConfiguration` matches actual cell values, and with `node_processing` enabled `processingMode` becomes `"node"`. Server-side value matching is exactly what "AI Mapping for field values" would describe. **[R]** This makes Q26 sharper, not answered — ask whether `node_processing` is on for our key.
- **Open Q23, per-customer `alternativeMatches` at runtime.** Not resolved by the archive. Still open.
- **Open Q6, Contextual Engine.** Confirmed as a plan-gated feature flag (`contextual_engine`), default `"disabled"`, so it can be switched on without a code change once licensed. **[V]**

### Two corrections to the flags above

- **Flag 1 is now sharper.** Ingestro's own demo uses a real key string (`thinkific-noncommercial-demo-0001`); keys are verified server-side against a **domain whitelist**, and the SDK's own error text names `developerMode` as the localhost escape hatch. Our `licenseKey="non-commercial"` looks like a placeholder that would not verify against a production domain. **[R]** — test it.
- **Flag 3 needs a caveat.** `transpose`, `mergeHeaders` and `metadataSelection` do **not** appear anywhere in the bundled 4.8.5 SDK. They may be newer options, or they may be silently ignored. **[?]** Do not assume they are doing anything until observed.

### Not worth carrying

`build/demo.xlsx` is Ingestro's own stress-test file — a German energy-meter export, six sheets, ~35 000 rows each, metadata preamble rows above the real headers, different header rows per sheet. Useful only as evidence of the scale and messiness their header detection is built for.

---

## The deeper Stitch screens — captured 2026-08-20

The outstanding decay item above is now closed. Every screen in the mockup was walked through in Chrome and captured. The prototype turns out to be **fully clickable**: the sidebar navigates, the agreement checkbox gates the "Kom igång" button, incomplete steps produce a locked final screen, and disclosure toggles work. Method: open the preview, tick the agreement box, then click each sidebar item. The design renders inside a cross-origin iframe, so the DOM is not readable — screenshots and reading them is the only route.

### The screens, and what is in them

**Företagsuppgifter.** Grunduppgifter: Juridiskt företagsnamn\*, Företagsprefix / akronym\*, Organisationsnummer\*, Fakturaadress. Then a separate *Land & språk* block (Land, Språk).

> The subtitle is the most important line in the whole mockup: **"Land och språk styr vilken produkt och vilka webbinarier ni lotsas till."** Eric's design already carries the product-agnostic routing rule as a customer-visible mechanism — country + language resolve which product the customer is being onboarded to. That is the `PROJECT-BRIEF.md` product-agnostic requirement expressed as UI, and it predates the decision that made it a hard requirement. Lift it.

**Er verksamhet & bakgrund.** *Verksamhet:* Typ av arbeten (multi-select chips: Entreprenad, Mark & anläggning, Service, Installation, Bygg, Renovering, Underhåll), Ca antal tjänstepersoner, Ca antal yrkesarbetare, Region(er), Kontor, "Arbetar ni lokalt, nationellt eller internationellt?"\*. *Bakgrund:* a toggle **"Vi kommer från Byggsamordnaren (BSO)"** which, when on, reveals an **IT-kontaktperson (för dataexport från BSO)** block (Namn\*, E-post\*, Telefon).

> This is the legacy-source branch as a design pattern: one toggle names the source system, and the source system decides which extra fields and which export route apply. Generalises directly — the product-agnostic version is "which system are you coming from", with per-source conditional blocks. Note it also anticipates that the BSO export needs an *IT* contact, not the project contact, which matches the constraint that the BSO branch is not truly self-service.

**Superanvändare.** Repeating row grid — Förnamn, Efternamn, E-post, Roll (combo, "Välj eller skriv") — with "+ Lägg till person", per-row delete, and a live counter *"1 giltiga · minst 2 krävs"*. E-post is explicitly the webinar invite address.

**Webbinarier.** Three named trainings, each a row with "Öppna →": **1 Ny i Next**, **2 Grundläggande ekonomiflöde i Next**, **3 Budget, inköp och prognos**. Gated on the previous step: *"Lägg till minst 2 superanvändare i föregående steg."*

**Ansvarsfördelning och databehandling.** A linked *Ansvarsfördelning (PDF)*, then three separate confirmations: "Vi har läst och förstår ansvarsfördelningen", and under a **DATABEHANDLING OCH AI** heading — "Vi godkänner att AI-baserade verktyg (inkl. Ingestro) används som en del av behandlingen" and "Vi ansvarar för att informera våra medarbetare om denna behandling." Body text: *"Aceve behandlar era uppgifter för att leverera migrering och uppsättning av Next, i enlighet med ingånget DPA."*

> Relevant to `STATUS.md` Open Question 8. The mockup already splits consent into a *tool* acknowledgement and an *inform-your-staff* obligation, which is a sharper structure than the single AI/consent block the open question assumes. Give this to Legal as the starting draft rather than a blank page.

**Migrationsplan — the most substantive screen, and previously unseen.** Three parts:

1. A **GI-mall (Grundinformationsmall)** dropzone: *"En Excel-fil med ett blad per datatyp — ladda upp en gång, importera allt"*, and *"GI-mallen kan innehålla flera blad (kontoplan, användare, kunder m.m.). Ingestro identifierar bladen och kopplar dem automatiskt till rätt importsteg."* This lines up exactly with the SDK's `sheet_selection` step and multi-sheet handling documented above — the intent is buildable.
2. **FÖRBEREDELSER I BYGGSAMORDNAREN** — three acknowledgements about project status: only projects with status *Pågående* are migrated; everything else is excluded; the customer confirms they understand that.
3. A **MIGRATIONSTIDSLINJE** with a four-type legend — **TYP 1: DIREKTIMPORT · TYP 2: EXCEL · TYP 3: INTEGRATION · TYP 4: MANUELLT** — and one row per data category, each carrying its own type badge, an "Eget importsteg" badge where applicable, and a per-row **method selector** (chips: GI-mall / Excel / Integration / BSO-export / Hoppa).

The timeline rows as rendered:

| Data category | Type | Method chips offered |
|---|---|---|
| Kontoplan | EXCEL-IMPORT | GI-mall, Excel, Integration |
| Användarregister | DIREKTIMPORT | GI-mall, BSO-export, Excel |
| Kundregister | INTEGRATION | Integration, GI-mall, Excel |
| Projektlista | DIREKTIMPORT | BSO-export, GI-mall, Excel |
| Timpriser & roller | DIREKTIMPORT | GI-mall, BSO-export, Excel |
| Prislista / artikelregister | DIREKTIMPORT | GI-mall, BSO-export, Excel |
| Leverantörsregister | INTEGRATION | Integration, GI-mall, Excel, Hoppa |
| Lönetillägg | EXCEL-IMPORT | GI-mall, Excel, Hoppa |
| Frånvarotyper | EXCEL-IMPORT | GI-mall, Excel, Hoppa |
| ÄTA- & avvikelselista | EXCEL-IMPORT | Excel, Hoppa |
| Dokumentmallar | EXCEL-IMPORT | Excel, Hoppa |

Plus a collapsed group, **"Görs manuellt av kund efter uppstart (4 datatyper)"**: *Kalkyl* (lägg in total budget och intäkt på projektkortet), *Tidsplaner* (sparas som dokument per projekt), *Inköp* (flyttas manuellt av kund), *Dagbok* (sparas som dokument per projekt).

Row notes worth keeping: Kundregister *"speglas mot ekonomisystem — undviker dubbletter"*; Projektlista *"Pågående projekt. Enbart status Pågående inkluderas."*; Leverantörsregister *"Via ekonomisystem. Utan e-invoice: BSO-export till Excel."*; ÄTA *"Övergripande info importeras — ej detaljer per ÄTA."*

> **This is the single most useful thing recovered from Stitch.** It is a per-data-category method matrix — the thing `STATUS.md` Open Question 9 (complexity tiering) and the "which category is piloted first" question both need. It also shows that "sequential vs bulk" was never really binary in Eric's design: the GI-mall is the bulk path and the per-row chips are the sequential path, chosen per category by the customer. Note the row count: **11 in the timeline + 4 manual = 15**, against Stitch's 7 sidebar steps and the sandbox's 17 modules. Three different counts across three artefacts — this needs one authoritative list from PS, and the divergence note above should be read as three-way, not two-way.

**The per-category import screens (Kontoplan, Användarregister, Timpriser & roller, Prislista, Kundregister, Projektlista).** All share one layout: a **VÄLJ IMPORTMETOD** card row (GI-mall — *"Blad 'Ev. kontoplan' från er GI-mall"*, disabled until a GI-mall is uploaded; **Ladda upp Excel** — *"Ladda upp valfri Excel-fil med Ingestros kolumnmatchning"*; **Hoppa över** — *"Görs manuellt efter driftsättning"*), then a **SEMANTISK MODELL — FÄLT I NEXT SOM INGESTRO MATCHAR MOT** block listing the target fields as chips, green = mandatory, with the caption *"Gröna fält = obligatoriska. Ingestro auto-matchar era Excel-kolumner mot dessa med ML."* Footer shows a status pill ("Ej påbörjad") and "Nästa steg →".

Field lists as rendered — this is a target-field inventory, independent of the sandbox's:

| Screen | Fields (\* = mandatory) |
|---|---|
| Kontoplan | Kontonr\*, Beskrivning\*, Kostnad\*, Fakturera vid import, Moms (%), Arbete, Extern momskod, Kontotyp |
| Användarregister | Aktiv\*, Anställningsnr, För- och efternamn\*, Inloggning\*, Användarlicens\*, Primär grupp\*, Yrkesroll (från timpriser)\*, Signatur\*, E-post, Mobil |
| Timpriser & roller | Kod\*, Beskrivning\*, Enhet\*, Kostn/enh\*, Pris/enh\*, Kontonr\*, Tidkod\*, Debiterbar\*, Grupp |
| Prislista | Artikelnr\*, Beskrivning\*, Enhet\*, Kostn/enh\*, Pris/enh\*, Konto\*, Debiterbar, Artikelkategori, Tidkod |
| Kundregister | Kundnr\*, Kundnamn\*, Organisationsnr, Adress, Ort, Faktura e-post, Kontaktperson |
| Projektlista | Föräldraprojektnr\*, Projektnr\*, Projektnamn\*, Projektstatus\*, Projektledare\*, Projektstart\*, Ersättningsform\*, Projekttyp, Kund\*, Arbetsledare |

> Two things to notice. First, **"Yrkesroll (från timpriser)"** on Användarregister is an explicit cross-module dependency — the user register cannot be imported before Timpriser, which is a real sequencing constraint and not visible anywhere else. Second, these lists are *shorter and differently named* than the sandbox's for the same categories (e.g. Timpriser matches almost exactly; Prislista drops `Lagersaldo` and `Föräldraprojekt`). Treat neither as authoritative until PS confirms. `bso_to_next_transformer.py`'s mapping tables are the third opinion.

**Skicka & boka uppstart.** Locked, with a padlock and *"Nästan där"* plus a dynamic list of what is still outstanding: *"Slutför förberedelserna: Er verksamhet & bakgrund, Superanvändare, Webbinarier, Ansvarsfördelning, Migrationsplan."* Gating is real, not decorative.

### One artefact, not a design decision

The header's **"settings / Inställningar"** button navigates to a completely different design that also lives in this Stitch project: a dark-header **"ACEVE PORTAL"** with a DASHBOARD / CONTRACT / FORECAST / AUDITS nav and a modal **"Konfigurera importinställningar"** — *Datakälla* ("Välj källa för finansiell data" → "Lokal fil (Excel/CSV)"), *Filformat* (.xlsx / .csv / .xml), *Teckenkodning* (UTF-8), and *Mappningsinställningar*: "Använd AI-matchning" (on) — *"Låt systemet automatiskt mappa kolumner baserat på tidigare importer och rubriknamn"* — "Hoppa över rader med fel" (off), "Uppdatera befintliga poster" (on).

This is a different concept — an internal/backoffice financial-import view, not the customer preboarding portal — and the link is almost certainly a loose Stitch screen link rather than intent. **Do not read it as part of the preboarding design.** It is worth one look for two reasons: "baserat på tidigare importer" is the same idea as Ingestro's `historic` mapping layer, and the three mapping toggles are a reasonable starting set for the backoffice monitoring view that `STATUS.md` Next Action 9 asks for.

### The one figure to strip

The Dokumentmallar row reads *"~75% automatisk konvertering av Wordfiler. Resterande manuellt."* No source, no measurement. Under the standing figures rule this must not be carried into anything — see `../../STATUS.md` §Figures.

### What could not be captured, and why

The design's own HTML/CSS is not reachable. It renders in a cross-origin iframe served from `app-companion-430619.appspot.com`, and that URL returns an empty shell when opened directly — it only populates through the gapi handshake with the Stitch parent frame. So the exported markup, and the original **design prompts** behind the mockup, are not obtainable from the public preview.

They do exist and they are substantial — an internal API call made from the preview page returned evidence of a **19,213-character design prompt** titled *"Design Prompt: Customer Portal for Next Project API Integration"*, plus separate prompt sessions for Next brand colours and a "Portal invitation view" for inviting customers and suppliers. Retrieving them that way was stopped deliberately: hand-rolling calls to Google's private RPC endpoint to pull data the UI does not expose is the wrong way to get at material Aceve already owns.

**The right route: Carl (or Eric) opens the project in the Stitch editor, where the prompt history is visible to the owner, and pastes it in.** The 19k prompt is the actual design brief for this mockup and is worth having in the folder verbatim — it likely answers questions this file can only infer at.
