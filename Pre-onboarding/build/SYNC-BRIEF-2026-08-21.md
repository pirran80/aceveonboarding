# Synk-brief — Carl + Pierre, 2026-08-21 07:30–07:55

*Projekt "Gerillacode" / Aceve Onboard. 25 minuter — beslutsmöte, inte genomgång. På svenska som undantag från projektets engelska-konvention: internt arbetsdokument för två svensktalande, arkiveras efter mötet. Syftet är Next Action 16 i `STATUS.md`: konkretisera kundflödet och fastställ första byggsteget.*

---

## Nytt sedan senast (2 min att nämna, inte gå igenom)

- Projektet är omstrukturerat och delbart: kärndokument i roten, `pitch/` (one-pager + deck), `build/` (allt en byggare behöver), `research/`, `reference/`, `archive/`. 147 MB → 12 MB.
- `build/BUILD-SPEC.md` är nu Pierres startpunkt: arkitektur, datamodell, integrationskontrakt, Fas 1-backlog i 8 slices, och en "do not assume"-lista mappad mot öppna frågor.
- `build/registry/next-project.draft.json` — sandboxens 17 moduler och 202 fält konverterade till registry-JSON (typer, obligatoriska fält, värdelistor, alias, Ingestro-destinationer). Utkast i väntan på PS-bekräftelse (Q33), men Pierre kan koda mot formatet direkt.
- `build/CUSTOMER-FLOW.md` + `build/DESIGN-BRIEF.md` — flödet och designen konsoliderade ur alla tre prototyper.

## Besluten som ska ur mötet

**1. Första build-slice.** Förslag: slice 1 i BUILD-SPEC — modulregister + registerstyrd flödesrendering, en datakategori end-to-end. Demo-kriterium: ändra en JSON-fil → flödet ändras. Bevisar hårda regeln "aldrig hårdkodade moduler" från dag ett. *Beslut: ja/nej/justera.*

**2. Stack.** Inte beslutad, medvetet. Ramarna (BUILD-SPEC §4): React-frontend (Ingestro-SDK:n är React), backend med relationslagring + objektlagring, EU-region, i18n, driftbar av IT. *Beslut: vem lägger stackförslag, till när?*

**3. Kravställare.** Pierre föreslog Linnea Norberg (Next Action 17). *Beslut: vem frågar henne, och frågar vi Helena/Jenni först?*

**4. Arbetsfördelning + nästa synk.** Vad gör Pierre resp. Carl till nästa gång, och när ses ni?

## Om tid finns (5 min)

- **Q35 — Nexus/Salesforce-portalen.** OneNote-raden om en "planned community as a portal for external…" är fortfarande obesvarad. Högsta värde per samtal av alla öppna frågor: den avgör om ni bygger bredvid Nexus eller mot dem. Vem ställer frågan, till vem, före nästa beslutspunkt?
- **Ingestro-frågorna** (`build/Ingestro-questions-staging-2026-08-20.md`, Q21–24/26/29): ett vendorsamtal, men synka Eric först — han äger relationen och har "API vs staging" som egen action (Q28).

## Glöm inte (deadlines med datum)

- **Sandboxen går ut 2026-08-31** — 10 dagar. Före/efter-mätningen (kör en riktig kundfil, ta tid — det Magnus bad om 2026-08-10) måste köras innan dess, eller sandboxen förnyas.
- **Stitch-designprompterna** (19k tecken) syns bara för projektägaren i Stitch-editorn — Carl eller Eric måste klistra in dem innan projektet städas (Next Action 1).
- André Ijspelder väntar på Carls fältnivåklassning för Ingestro-integritetsbedömningen (Q25) — den är också ett byggkrav för staging.

## Länkar

`build/BUILD-SPEC.md` · `build/CUSTOMER-FLOW.md` · `build/DESIGN-BRIEF.md` · `build/registry/next-project.draft.json` · `pitch/ONE-PAGER.md` · `pitch/Aceve-Onboard-pitch.pptx` · `STATUS.md` (beslutslogg + 45 öppna frågor)
