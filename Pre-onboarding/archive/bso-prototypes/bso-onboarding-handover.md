# Handover: BSO Onboarding Tool

## Bakgrund

Aceve PS hanterar sunset av produkten BSO [figure removed — belongs to the BSO Sunset project] och migrerar dessa kunder till Next Project.
Som del av detta har vi byggt ett enkelt onboarding-verktyg — en självständig HTML-fil — som kunden
använder för att förbereda sig inför uppstartsmötet med sin konsult.

---

## Vad som är byggt

**Fil:** `bso-onboarding.html`

En single-file HTML-app med Aceve-branding (Manrope, grön palett). Inga externa beroenden utöver
Google Fonts. Fungerar offline. State sparas i `localStorage`.

### Funktioner

1. **Setup-modal (konsultens steg)**
   - Öppnas automatiskt när filen är i "mallläge" (CONFIG-värden innehåller sentinel `%%KUNDNAMN%%` etc.)
   - Konsulten fyller i: kundnamn, konsultnamn, konsultens e-post, länk till ansvarsfördelningsdokument
   - Knapp "Generera och ladda ner kundfil" skapar en kund-specifik HTML-fil via `document.documentElement.outerHTML` + string replacement av sentinel-värden → triggar nedladdning som `{KundNamn}-onboarding.html`
   - Kunden får sin egna fil utan modal

2. **Progress bar** — beräknas dynamiskt baserat på antal valida superusers × 3 webbinarier + 2 steg

3. **Steg 1 — Superanvändare**
   - Dynamiskt formulär: förnamn, efternamn, e-post per person
   - Min 2 personer krävs (validerade med `firstName.trim() && lastName.trim() && email.includes("@")`)
   - Lägg till/ta bort rader
   - `updateUser()` triggar `renderWebinars()` direkt så checkboxarna uppdateras i realtid

4. **Steg 2 — Webbinarier (3 st)**
   - Per webbinar: länk till helpdesk-artikel + en checkbox per registrerad superanvändare
   - Alla tre måste bockas av för alla superanvändare för att steget ska räknas som klart

   | # | Titel | URL |
   |---|-------|-----|
   | 1 | Ny i Next | https://helpdesk.next-tech.com/hc/sv/articles/24122929562524-Webinar-Ny-i-Next-2025-12-02 |
   | 2 | Grundläggande ekonomiflöde i Next | https://helpdesk.next-tech.com/hc/sv/articles/22232333563676-Webinar-Grundl%C3%A4ggande-ekonomifl%C3%B6de-i-Next-2025-09-09 |
   | 3 | Budget, inköp och prognos | https://helpdesk.next-tech.com/hc/sv/articles/26692106514716-Webinar-Budget-ink%C3%B6p-och-prognos-2026-04-09 |

5. **Steg 3 — Ansvarsfördelning**
   - Länk till dokument (konfigureras av konsulten i setup-modal)
   - Enkel checkbox: "Vi har läst och förstår ansvarsfördelningen"

6. **Steg 4 — GI-mall**
   - Visar vilka flikar som ska fyllas i (de vita, ej de orangea)
   - Vita flikar: Läs detta först!, Företag, Timpriser, Prislista, Projekttyper, Skattereduktion, Lönetillägg, Användarregister, Betalningsvillkor, Frånvaro, Påslagsmall
   - Orangea flikar (ej obligatoriska nu): Projekt, Ev. kontoplan, Ev. kunder, Ev. leverantörer, Ev. kundkontakter, Ev. leverantörskontakter, Övrigt

7. **Steg 5 — Boka uppstartsmöte (CTA)**
   - Låst tills alla steg är klara
   - Öppnar ett förifyllt `mailto:` till konsultens e-post med alla superanvändare listade + instruktion att bifoga GI-mallen
   - Skapar därmed ett ZD-ärende automatiskt om konsultens e-post är kopplad till Zendesk

---

## Tekniska detaljer

```
STATE_STRUCTURE = {
  users: [{id, firstName, lastName, email}],
  webinarChecks: {"userId_webinarId": bool},
  ansvarRead: bool,
  giDone: bool
}

STORAGE_KEY = "bso_v2_" + btoa(encodeURIComponent(CONFIG.kundNamn)).slice(0,16)
IS_TEMPLATE = CONFIG.kundNamn === "%%KUNDNAMN%%"
```

State sparas till localStorage vid varje förändring. Kunden kan stänga webbläsaren och fortsätta.
OBS: localStorage är webbläsar-lokalt — fungerar ej för delad state mellan flera användare.

---

## Känd begränsning + nästa möjliga steg

**Problemet:** Kunden vill kunna lägga filen i en delad SharePoint-mapp så att alla superanvändare
kan bocka av sina webbinarier och alla ser varandras progress.

**Varför HTML+localStorage inte fungerar för detta:**
- SharePoint Online blockerar JavaScript-exekvering i uppladdade HTML-filer
- localStorage är per webbläsare/dator — ingen delad state

**Rekommenderade alternativ (diskuterade men ej byggda):**

| Alternativ | Komplexitet | Passar för |
|---|---|---|
| Microsoft Lists | Låg — inga byggen | Enkel tracking, konsulten ser alla kunder |
| Power Apps Canvas App | Medel — ~halvdag | Exakt samma UX, SharePoint-lista som backend, inbäddas på SP-sida |
| SPFx web part | Hög | Fullständig enterprise-lösning |

**Rekommendation:** Bygg en Power Apps Canvas App med en SharePoint-lista som backend.
Appen ska replikera samma steg-för-steg-flöde som HTML-verktyget men med multi-user state.

---

## Uppdrag för Opus

Hjälp mig designa och bygga Power Apps-versionen av detta onboarding-verktyg.

**Önskad arkitektur:**
- **SharePoint-lista** som backend (en rad per kund, kolumner för varje checkbox-steg)
- **Power Apps Canvas App** som frontend — samma flöde som HTML-appen ovan
- Konsulten skapar ett nytt "ärende" för varje kund
- Superanvändarna loggar in med sitt Microsoft-konto och bockar av sina steg
- Konsulten kan se progress för alla sina kunder

**Leverans jag behöver:**
1. Datamodell för SharePoint-listan (kolumner, typer, relationer)
2. Skiss på Power Apps-skärmar och navigationsflöde
3. Eventuella formler/expressions för de kritiska delarna (progress-beräkning, unlock-logik för CTA)
4. Tips på vad som kan vara knepigt i Power Apps för just detta flöde

**Constraints:**
- Aceve använder Microsoft 365 / SharePoint Online
- Ingen extern infrastruktur — allt ska leva inom M365
- Aceve-branding (grön palett, Manrope) om möjligt i appen
