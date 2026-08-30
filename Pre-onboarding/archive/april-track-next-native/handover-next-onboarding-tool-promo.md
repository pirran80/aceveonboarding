# Handover — Next Project Onboarding Tool

**Från:** Carl Bäckström, Implementation Consultant / AI Champion GPS
**Till:** Dedikerat Claude-projekt: *Next Project Onboarding Tool*
**Datum för handover:** 2026-04-23
**Ursprunglig chatt:** claude.ai — allmän konversation, utanför projekt
**Version:** 1.0

---

## 1. Vad detta projekt är

Ett internt utvecklingsinitiativ inom Aceve Global Professional Services för att bygga ett **interaktivt onboarding-verktyg** som ska leva som en integrerad del av Next Project — Aceves egen construction project management-plattform.

Verktyget ska ersätta den nuvarande processen där PS-konsulter driver kundimplementationer via statiska Excel-checklistor spridda i SharePoint-mappar.

**Kärnprincip som styr alla designbeslut:** Verktyget skriver aldrig till kundens Next-databas. All onboarding-data lagras i Aceves egna system. API-anrop mot kunddatabasen är uteslutande read-only för valideringssignaler — och även dessa har medvetet nedprioriterats i den senaste iterationen (se avsnitt 5.3).

---

## 2. Vem Carl är och hur han vill arbeta

Carl är Implementation Consultant på Aceve GPS och AI Champion för samma team. Han rapporterar in i PS-organisationen ledd av Jenni Meller. Han driver detta som ett stretch-initiativ parallellt med sin ordinarie leverans, inte som ett formellt utvecklingsprojekt.

**Arbetssätt:**
- Verifiera aldrig på egen hand — hämta från levande källor först (Confluence, Helpdesk, SharePoint, Slack, live-databaser)
- Källhierarki: live-verifiering > intern dokumentation > helpdesk > generell kunskap
- Bryt ner stora uppgifter i faser med validering emellan
- Utmana problemformuleringen om det finns en bättre vinkel — Carl vill ha motargument, inte bekräftelse
- Korta, raka, deklarativa meningar. Ingen svada. Inga em-dashes.
- Språket växlar — svenska för konversation, engelska för deliverables. Fråga om målgruppen är oklar.
- Fasat leveransarbete med explicita QA-kontroller
- Bold används sparsamt

**Test-databas som Carl använder:** `project.next-tech.com` databas 987198. Får läsas mot fritt — får aldrig skrivas till utan explicit bekräftelse.

**Konsult-språk vid kundtexter:** "Vi rekommenderar"-stil, inte första person.

---

## 3. Bakgrunden — vad som ledde fram till detta

### 3.1 Nuläge i PS-teamet

Onboarding av Next Project levereras idag på tre paketnivåer:

| Paket | Timmar | Pris (standard) | Ägarskap |
|---|---|---|---|
| Foundation | 28h | 41 720 SEK | Onboarding-teamet (guided/self-service) |
| Core | 34h | 50 660 SEK | PS-teamet (konsultdriven) |
| Professional | Modulbaserat | Add-ons | PS-teamet (modulbaserat) |

Processen styrs av `Interna checkpunkter PROMO Next.xlsx` med ~47 detaljerade checkpunkter grupperade i 6 faser. Filen kopieras per kund och lagras i en kundmapp på SharePoint.

**Strukturella svagheter i nuläget:**
- Checklistorna lever i statiska Excel-filer utan realtidsvy
- Kunden har ingen naturlig ingång till sin status i det system de köpt
- Processresurser (körscheman, mailmallar, kundmallar) spridda i SharePoint
- Kvalitet beroende av individuell konsult, inte av strukturerat verktyg
- Ingen automatisk validering av att konfigurationssteg genomförts

### 3.2 Vad chatten gick igenom (kronologiskt)

1. **Initial idé** — Carl ville bygga onboarding-checklistan som interaktiv flik i Next Project under administrationsmenyn
2. **Kartläggning av SOW-dokumenten** på SharePoint — Foundation, Core, Professional SOW-mallar, Interna checkpunkter, mailmallar, kundmallar, processdokument, utbildningsscheman
3. **Utveckling av API-strategi** utifrån next-tech.readme.io — read-only API-anrop, event log, projektstatus-koder
4. **Klargörande att Aceve äger Next** (produktägare, hostar och utvecklar själva)
5. **Diskussion om custom fields** — Carl påpekade att custom fields i kunddatabasen är fel approach eftersom de följer med när kunden skapar egna projekt. Landade i principen "aldrig skriva till kunddatabasen"
6. **Prototyp v1** byggd (React) med 47 checkpunkter, paketdifferentiering, konsult/kundvy, helpdesk-länkar
7. **Konkurrentbenchmark** mot Rocketlane, Valuecase, Pendo, Sana Labs, GuideCX
8. **Omtag** — Carl påpekade att statuskoderna hör till ekonomi-integrationen, inte implementationsprojektet. De 47 checkpunkterna är en administrativ bockningslista, inte en process
9. **Ny modell** utvecklad med tre lager: Process (huvudnav) + Grundinformation (sub-vy) + Kartläggning (sub-vy)
10. **Prototyp v2** byggd med den nya strukturen

---

## 4. Den nuvarande designmodellen

### 4.1 Tre lager

**Lager 1 — Processledning (Aceve-internt)**
6 faser med syfte, ansvar, 3–5 processteg per fas och tydliga övergångskriterier. Källa: `Processdokument/`-mappen i SharePoint. Detta är huvudnavigationen i verktyget.

**Lager 2 — Grundinformation (kunden levererar)**
19 datamängder från kundens grundinformationsmall, omgrupperade i 5 logiska block (per Carls val):
1. 🏢 Företag & verksamhet
2. 💰 Ekonomi & fakturering
3. 📊 Projekt & prissättning
4. 👥 Register (användare, kunder, leverantörer)
5. 🕐 Lön & frånvaro

Varje fält har fyra statuslägen: Väntar → Påbörjad → Mottagen → Validerad. Sub-vy i faserna Installation och Kartläggning.

**Lager 3 — Kartläggning (gemensam kunskapsbyggnad)**
~40 strukturerade frågor i 11 områden från kartläggningsfrågebatteriet. Varje fråga markeras som Standard eller Avvikelse. Avvikelser genererar automatiskt ÄTA-kandidater. Sub-vy i fas Kartläggning.

### 4.2 Fasstruktur

| # | Fas | Syfte | Har grundinfo | Har kartläggning |
|---|---|---|---|---|
| 1 | Initiering | Gemensam förståelse för mål, omfattning, ansvar | Nej | Nej |
| 2 | Installation | Miljön är tekniskt redo | Ja | Nej |
| 3 | Kartläggning | Kundens behov är kartlagda | Ja | Ja |
| 4 | Konfiguration | Systemet speglar kundens processer | Nej | Nej |
| 5 | Utbildning | Kunden kan använda systemet | Nej | Nej |
| 6 | Hypercare | Kunden står på egna ben | Nej | Nej |

### 4.3 Vad som medvetet är UTE ur den nuvarande modellen

- **Projektstatus-koder** (under 40 / 40–89 / 90) — hör till ekonomi-integrationen, inte implementationsprojektet. Var med i v1, togs bort i v2.
- **De 47 detaljerade checkpunkterna** som primär modell — de är en administrativ bockningslista utan riktning. Ersätts av processtegens fokus på fasmål och övergångskriterier.
- **Custom fields i kunddatabasen** — förorenar kundens arbetsyta. All onboarding-data lever i Aceves egna system.
- **API-validering som centralt designelement** — nedprioriterat. Kan lyftas tillbaka i senare fas när grundverktyget är i drift.

---

## 5. Viktiga designbeslut och principer

### 5.1 Native integration i Next Project

Verktyget ska byggas som en **flik i Next Projects administrationsgränssnitt** — inte som ett externt tillägg. Eftersom Aceve äger, utvecklar, hostar och supporterar Next Project är detta ett internt arkitekturbeslut, inte ett externt integrationsprojekt.

### 5.2 Aceve är produktägare — vad det innebär

Alla hinder som externa integratörer har mot Next Projects API existerar inte för Aceve internt:
- Ingen 1 000 SEK/månads-avgift per kunddatabas (den gäller externa partners)
- Ingen registreringsprocess via supportticket
- Full insyn i datamodell, event log, och plattformsarkitektur
- Full kontroll över både produkten och implementationsprocessen

### 5.3 Läs, skriv aldrig

Verktyget läser från kunddatabasen via API för valideringssignaler, men skriver aldrig. Detta är en fundamentalt viktig princip som Carl var mycket tydlig med. Skäl:
- Kundens Next-databas är deras operativa verktyg från dag ett
- Aceve-interna fält förorenar kundens vy och skapar städbehov
- Custom fields följer med när kunden skapar egna projekt framöver
- Onboarding-status tillhör Aceves leveransprojekt, inte kundens affärsprojekt

### 5.4 Två användarvyer

**Konsultvy** — full detaljnivå för PS-konsulten. Alla processteg, alla checkpunkter, alla länkar, anteckningsmöjlighet.

**Kundvy** — förenklad progress-vy med enbart de steg kunden äger eller delar med Aceve. Direktlänkar till Next Helpdesk-artiklar. Ska kännas som "min onboarding-resa", inte som en administrativ vy.

### 5.5 Paketdifferentiering

Verktyget filtrerar innehåll baserat på vilket paket kunden tecknat. Foundation visar minst, Professional mest. Kopplingen är till fasmål och grundinfo-scope, inte till listade checkpunkter.

### 5.6 Länkbibliotek per checkpunkt

Varje relevant punkt har upp till tre länktyper:
- 🔵 **Helpdesk-länk** (för kunden) — Next Helpdesk-artiklar
- 🟠 **Process Library-länk** (för konsulten) — SharePoint /Next Process Library
- 📎 **Kundmall-länk** — direktlänk till rätt importmall

---

## 6. Konkurrentbenchmark — kortversion

Genomfördes för att förstå landskapet och identifiera differentieringsmöjligheter. Se full analys i lösningsspecifikation v0.2.

**Direkta konkurrenter (implementation onboarding):**
- **Rocketlane** — PSA + customer onboarding, AI-agent Nitro, $19–99/user/månad
- **Valuecase** — collaborative customer spaces, ingen kundlogin krävs
- **GuideCX** — purpose-built onboarding, vitmärkt kundportal

**Angränsande kategorier (inte direkt konkurrens):**
- **Pendo** — user/product onboarding (in-app guidance), inte customer onboarding
- **Sana Labs** — förvärvat av Workday mars 2026, fokus på employee learning

**Aceves unika konkurrensfördelar:**
1. Nativ produktintegration (ingen tredje part kan bygga in verktyget i produkten)
2. API-driven verifiering utan kundbelastning (kunden bockar inte manuellt)
3. Produkt-till-process-synergi (onboarding-logik speglar produktens interna struktur)

**Inspirera från konkurrenter:**
- Rocketlane: template library, CSAT-mätning per milstolpe, risk-detektion
- Valuecase: engagement-tracking, ingen kundlogin, variable-driven content
- Pendo: in-app checklists, kontextuella tooltips, progressive disclosure

---

## 7. Nyckelfiler och källor

### 7.1 SharePoint-källor (verifierade under chatten)

**Ansvar för Foundation:** Onboarding-teamet (guided/self-service). Kunden gör mycket själv, helpdesk-baserat.

**Ansvar för Core & Professional:** PS-teamet (produktion). Kräver konsultexpertis, för komplexa för self-service — undantag är befintliga kunder som lägger till ett nytt bolag i gruppen.

Källa: `Next Onboarding - Delivered Products.docx` i `05_Team Workspaces/Onboarding/Next/`

### 7.2 Dokument PROMO (huvudmapp för leverans)

Sökväg: `oneaceve.sharepoint.com/sites/aceve-d_globalprofessionalservices/Shared Documents/04_Must Win Battles/Core Delivery Blueprint/Next/Dokument PROMO/`

**Kärnfiler:**
- `Interna checkpunkter PROMO Next.xlsx` — 47 checkpunkter, 6 faser (används som referens, inte primär modell)
- `Aceve PROMO Next.xlsx` — projektöversikt
- `Projektmall_Next.xlsx` — projektplansmall

**Informationsblad per paket:**
- `Informationsblad_Standardimplementation_Next_Foundation.docx`
- `Informationsblad_Standardimplementation_Next_Core.docx`
- `Informationsblad_Standardimplementation_Next_Proffesional.docx` *(stavas så i filnamnet)*

**Uppstartsmöte-material:**
- `Uppstartsmöte_Next_Project_kund.pptx` (för kund)
- `Uppstartsmöte_internt_Next_Project.pptx` (internt stöd)
- `Mall Uppstartsmöte internt stöddokument.docx`

**Hypercare:**
- `Next_hantering hypercare_ärende_draft.docx`

**Kundmallar (fylls i av kund):**
- `Kundmall - E-invoice att fylla i senast XX.docx`
- `Kundmall - Integration Fortnox att fylla i senast XX.docx`
- `Kundmall - Integration Visma Admin att fylla i senast XX.docx`

**Mailmallar (12 st):**
Uppstartsmöte, Välkommen, Tillgång till Next Project, Uppföljning efter uppstartsmötet, Projektavstämning, Beställning databas, Beställning C-Invoice, Beställningsmall ärende hypercare, ÄTA-hantering

**Processdokument (per fas — VIKTIGA, källa för v2-modellen):**
`Dokument PROMO/Processdokument/`
- `Process_Initiering_Draft.docx`
- `Process_Installation_Draft.docx`
- `Process_Kartläggning_Draft.docx`
- `Konfiguration_Process_Draft.docx`
- `Utbildning_Process_Draft.docx`
- `Hypercare_Process_Draft_.docx`
- `Process_Hypercare_Draft_Gammal.docx` (äldre version, ignoreras)

**Utbildningsmaterial:**
`Dokument PROMO/Utbildningar körscheman/`
15 körscheman: Grundutbildning (fungerar för Foundation), Fakturering och ekonomi, Tid och lön, ÄTA, Budget och Prognos, Anbud/Avtal, Avvikelse, Planering (inkl Next Planning), Next Docs, Next eInvoice, SVA, Byggservice AO-flöde, Maskinuppföljning + agenda-PPT

**SOW-mallar:**
- `SOW Mall_Foundation.docx` — 28h, 41 720 SEK (i `Dokument PROMO/SOW/`)
- `SOW Mall_Foundation_Intern.docx`
- `SOW Mall_Core_UnderProcess_DelvisRensad.docx` — 34h, 50 660 SEK (i `Core Delivery Blueprint/Next/`)
- `SOW Mall_Core_UnderProcess.docx` (äldre)
- `SOW Mall_Professional_UnderProcess.docx` — modulbaserat

### 7.3 Next Process Library (intern kunskapsbas)

Sökväg: `oneaceve.sharepoint.com/sites/aceve-d_globalprofessionalservices/Next Process Library/`

**Kärndokument:**
- `GUIDE_Admin Startup New Customer.docx` — steg-för-steg workorder till välkomstmail
- `BSO till Next (Kunds PL To-Do).docx`
- `Intern instruktion - Onboarding Vehicle.docx`
- `CHECKLISTA NEXT c-INVOICE 2021.xlsx`
- `Checklista e-Invoice version 3 - 2025-05-15.xlsx`

### 7.4 API-dokumentation

**Publik dokumentation:** `https://next-tech.readme.io/docs/getting-started`

**Nyckelinsikter (kom ihåg — dessa gäller externa integratörer):**
- Autentisering via `client_id` + `client_secret` + `database_number`
- 1 000 SEK/mån per kunddatabas (760 SEK i partnerprogram) — gäller inte Aceve internt
- Testmiljö kostnadsfri
- Rate limit på requests
- Event log-tillgängliga objekt: `AdditionalWorkOrder`, `CostRevenue`/`VoucherRow`, `CustomerOrSupplier`, `Invoice`, `Project`, `SupplierInvoice`, `Time`/`Booked Hours`, `WorkOrder`, `WorkOrderRow`
- Custom fields finns implementerat för projekt — läs/skapa/uppdatera via API. **Undviks medvetet i denna design.**
- Kritisk begränsning: Inte alla operationer genererar event log-poster

### 7.5 Uppladdade filer under chatten (från Carl)

Tre Excel-filer bifogades sent i konversationen och användes för att bygga v2-modellen:

1. `Interna_checkpunkter_Kund_XX_AB.xlsx` — anonymiserad instans av interna checkpunkter (47 rader, 6 faser + Projektavstämningar)

2. `Projektuppföljning_Next_-_Kund_XX.xlsx` — 5 flikar:
   - Projektavstämning (agenda-mall för avstämningsmöten)
   - Aktivitetslista (processteg × aktivitet × deadline × ägare × status)
   - Checklista Kartläggning (~40 frågor i 10 områden)
   - Nedlagd tid (uppföljning av timmar)
   - ÄTA (registrering av tilläggsarbeten)

3. `Kund_XX_AB_-_Grundinformationsmall_att_fyllas_in_senast_XX.xlsx` — 19 flikar:
   - Läs detta först!, Företag, Timpriser, Prislista, Användarregister, Betalningsvillkor, Projekttyper, Skattereduktion, Lönetillägg, Frånvaro, Påslagsmall, Projekt, Ev. kontoplan, Ev. kunder, Ev. leverantörer, Ev. kundkontakter, Verksamhet, Ev. leverantörskontakter, Övrigt

**OBS:** Excel-filerna var trunkerade (saknade EOCD-header). Extraherades manuellt via zip-parsing. Om projektet får nya versioner av samma filer kan de behöva samma behandling.

---

## 8. Vad som är levererat hittills

### 8.1 Filer i outputs

Följande filer producerades under chatten och är tillgängliga i användarens outputs-mapp:

| Fil | Version | Beskrivning |
|---|---|---|
| `next-onboarding-tool.jsx` | v1 | Första prototypen med 47 checkpunkter |
| `next-onboarding-solution-spec.md` | v0.1 | Första lösningsspecifikationen |
| `next-onboarding-solution-spec-v2.md` | v0.2 | Utökad spec med API-detaljer och konkurrentbenchmark |
| `next-onboarding-tool-v2.jsx` | v2 | Nuvarande prototyp — process som huvudnav, grundinfo och kartläggning som sub-vyer |

### 8.2 Vad prototyp v2 innehåller

- 6 faser med syfte, ansvar, 3–5 steg och övergångskriterier
- 5 grupperade grundinformationsblock med 4-stegs statushantering
- 11 kartläggningsområden med Standard/Avvikelse-markering
- Automatisk räknare för avvikelser som blir ÄTA-kandidater
- Paketväxling Foundation/Core/Professional
- Konsult/kundvy-toggle
- Aceve-branding (deepGreen #152F1A, accentGreen #E1FFAE, Manrope-font)
- Persistent lagring via `window.storage`

### 8.3 Vad som INTE är byggt

- Native integration i Next Project (kräver produktdialog)
- OAuth/SSO mot Next-ID (kräver Next plattformsteamet)
- API-koppling mot faktisk kunddatabas
- ÄTA-generering från avvikelser (bara UI-flagga finns)
- Salesforce/Certinia-koppling
- Fungerande delning mellan konsult och kund
- Backend/persistent lagring över sessioner för multipla användare

---

## 9. Öppna frågor att driva vidare

### 9.1 Interna beroenden

| Beroende | Ansvarig | Status |
|---|---|---|
| Native Next-flik vs. fristående webb-app | Next produktteam + PS-ledning | Öppen |
| OAuth/SSO-endpoint för Next-ID | Next plattformsteam | Öppen |
| Interna API-rättigheter | Next produktteam | Öppen |
| Standardiserade Helpdesk-artiklar per steg | Next Support/Content | Öppen |
| Förvaltning av checklistinnehåll vid SOW-uppdateringar | PS-teamet | Öppen |
| Koordinering mot Project Nexus (Certinia PSA) | PS + Certinia-team | Öppen |

### 9.2 Frågor att ställa till Next produktteam

1. Kan onboarding-modulen byggas som en native flik i Next Project admin-gränssnittet?
2. Finns eller planeras OAuth 2.0/SSO för Next-ID att använda i interna verktyg?
3. Vilka API-endpoints är tillgängliga internt utan externa partnerbegränsningar?
4. Hur hanteras förvaltning av checklistinnehållet när SOW-mallar uppdateras?
5. Finns utvecklingskapacitet i Next-teamet för en onboarding-modul under 2026?
6. Kan data från onboarding-verktyget matas in i Certinia/Project Nexus när det går live?

---

## 10. Föreslagen roadmap

### Fas 1 — MVP (Q2–Q3 2026)
Lansera grundverktyget utan API-integration
- Prototyp v2 utökad med backend
- Fungerande delning konsult ↔ kund
- SSO-integration (Aceve intern för konsult, tokenlänk för kund)
- Live-koppling till Next Helpdesk-artiklar per checkpunkt

### Fas 2 — API-integration (Q4 2026 – Q1 2027)
Automatisk verifiering
- Read-only API-koppling mot kunddatabaser
- Auto-validering av fas 2–6 checkpunkter (om lämpligt — Carl var skeptisk)
- Event log-baserad Go-live-detektion (om lämpligt)
- OAuth/SSO med Next-ID
- CSAT-mätning vid varje fas

### Fas 3 — Intelligent onboarding (Q2 2027+)
AI-driven processoptimering
- Risk-detektion (inspirerat av Rocketlane Nitro)
- AI-genererade körscheman baserade på kundens verksamhetsprofil
- Automatisk dokumentgenerering (SOW, mailmallar)
- In-app guidance i Next Project
- Integration mot Certinia/Project Nexus

---

## 11. Direkta nästa steg för det nya projektet

1. **Verifiera att alla SharePoint-länkar fortfarande fungerar** — Aceve strukturerar om ibland
2. **Diskutera med Carl** om prototyp v2 är rätt utgångspunkt eller om det finns nya insikter
3. **Kontakta Next produktteamet** — presentera prototyp v2 och lösningsspecifikation v0.2 som diskussionsunderlag
4. **Workshop med 2–3 PS-konsulter** för att validera fasstrukturen och grundinfo-grupperingen
5. **Bestäm arkitekturansvar** — vem bygger MVP (PS AI Hub, extern utveckling, Next produktteam)
6. **Uppdatera lösningsspecifikationen** till v0.3 med v2-modellen (den nuvarande spec:en beskriver fortfarande 47-checkpunktsmodellen)

---

## 12. Personer och kontexter att känna till

**Louise Högren** — PO Team Phoenix, produktkontakt för PS i Next Project-frågor.

**Jenni Meller** — Leader för PS-organisationen.

**AI Hub-kanalen på Slack** — där PS AI-initiativ diskuteras. Carl driver där.

**Nyckelkanaler i Slack:**
- `#next-productknowledge-next-project` (C084KLS6XMW)
- `#next-customeroperations` (C083GB3JSVD)
- `#next-importfel` (G0849HKHWL9)

**Atlassian cloudId:** `1fdfa55e-71fb-436b-a03e-55469feffbab`

**AI Tracker List (SharePoint):**
`Global Professional Services - Professional Services Hub/04_Must Win Battles/AI/AI Tracker/AI_Tracker_List.xlsx`

---

## 13. Skills som är relevanta för detta projekt

Följande skills är särskilt relevanta att åberopa i det nya projektet:

- `next-project` — kunskapsbas om Next Project (moduler, PS-metodik, best practices)
- `next-project-api` — API-detaljer om något behöver dubbelkollas
- `aceve-branding` — visuell identitet för verktyget
- `aceve-consultant-voice` — konsulttonalitet vid kundtexter
- `aceve-product-context` — bakgrund om Aceve och produktportföljen
- `frontend-design` — för fortsatt prototyputveckling
- `nepd-helper` — om feature request behöver skickas till Next produktteamet
- `knowledge-lead` — om kunskapsdokument behöver produceras för PS-teamet

---

## 14. Sammanfattning i tre punkter

1. **Vad som byggs:** Ett interaktivt onboarding-verktyg som ska leva som en flik i Next Project. Ersätter statiska Excel-checklistor med process-driven leverans, strukturerad datainsamling, och vägledd kartläggning.

2. **Var det står:** Prototyp v2 finns i React (`next-onboarding-tool-v2.jsx`). Lösningsspecifikation v0.2 finns (behöver uppdateras till v0.3 med v2-modellen). Ingen backend, ingen API-koppling, ingen produktdialog påbörjad.

3. **Vad som är kärnprincip:** Aceve är produktägare, verktyget ska vara nativt i Next, verktyget skriver aldrig till kunddatabasen, tre lager samverkar (process + grundinfo + kartläggning), avvikelser i kartläggning triggar ÄTA-kandidater.

---

*Strictly confidential — only for internal use*
