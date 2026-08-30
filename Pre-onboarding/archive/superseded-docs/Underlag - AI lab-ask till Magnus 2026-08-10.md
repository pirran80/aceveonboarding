# Underlag — möte med Magnus & Eric, måndag 2026-08-17

**Datumkorrigering:** Tidigare version av detta dokument angav 2026-08-10 som mötesdatum. Det var fel — dagens datum (när detta skrevs) är måndag 2026-08-10, och "måndag nästa vecka" är 2026-08-17. Rättat genomgående nedan.

**Syfte med mötet:** Fånga Magnus uppmärksamhet så att han avsätter resurser i AI lab för detta ändamål, och får beslutsunderlag för att driva frågan vidare uppåt. Mötet ska också svara på: vem bygger detta, nu när Magnus är tillbaka.

---

## 1. Problemet

- ~500 BSO-kunder totalt (555 vid årets start, ~50 avslutade). Styrgruppens mål: topp 130 kunder migrerade; preliminärt ARR-breakeven vid topp 40 migrerade + prisuppräkning. ARR: ~1,78 MEUR (maj 2026).
- **Siffermotsägelse — löst genom borttagning:** kapacitets-, pipeline- och deadlinesiffror för BSO motsade varandra mellan källor och gick inte att verifiera. Samtliga är borttagna ur detta projekt [figure removed — belongs to the BSO Sunset project]. Behövs en siffra: hämta den från BSO Sunset-projektet vid tillfället den ska användas, och ange källa och datum.
- Migreringen är idag till största delen manuell: bara en minoritet av datakategorierna är helautomatiska, resten kräver manuellt arbete eller är villkorliga. Ingen genväg finns med dagens verktyg. [förhållandet borttaget — inte validerat; mät innan det citeras]
- Ingestro-licens finns redan (signerat MSA change order 2026-05-29), men Ingestro bygger inte lösningen åt oss — bekräftat på deras demo 2026-08-06 att Aceve själva måste allokera resurser mot befintlig licens.
- **Stöd för asken, direkt ur styrgruppsdokumentet:** risken "CSM capacity: light-touch migrations risk overwhelming post-migration support" mitigeras enligt dokumentet genom att "Define minimum viable onboarding scope & manage through on-boarding tool." Magnus har alltså redan själv namngivit ett onboarding-verktyg som lösning på en identifierad styrgruppsrisk — det här är inte en ny idé för honom, det är leverans på något han redan äger. Bra krok att öppna mötet med.
- Angränsande risk (samma dokument, ej del av denna ask): PS saknar formellt mandat att prioritera BSO-migrering över annat arbete. Separat fråga, men kan komma upp om Magnus pratar resurser generellt.

## 2. Vad vi vill att AI lab ska lösa (förslag — ej färdigtänkt, stäm av med Eric innan mötet)

**Spår A — akut:** Ett konsultverktyg som automatiserar BSO→Next-migreringen med Ingestro. Detta är det som redan var target för intern demo mitten av augusti. Räddar deadline, ökar PS-genomströmning.

**Spår B — större vision:** Ett self-service pre/onboarding-verktyg där Next-kunder (och senare andra produkter i Aceve-portföljen) kan börja jobba med sin data innan konto/databas finns hos oss, spara progress, med full transparens för både kund och oss. När databas sedan provisioneras kopplas kontot och data importeras via API eller annan effektiv väg.

**Öppen fråga att lösa med Eric före mötet:** Sekventiell modul-för-modul bedöms fortfarande som rätt väg för kunden i Spår B, eftersom kunden ska göra stora delar av jobbet själv. Bulk-upload (som Ingestro föreslog 2026-08-06) är inte fel — men snarare en metod för konsulten att ta fram underlaget/mappningslogiken som sedan matas in i det sekventiella kundflödet, inte en ersättning för kundflödet. Detta är inte färdigtänkt och bör inte presenteras som löst i mötet.

**Kan A och B kombineras utan att tappa tempo?** Inte genom att bygga båda parallellt med samma resurser just nu — B har inga tillsatta resurser än, det är precis det Magnus ombeds besluta. Den realistiska vägen: arkitektera A:s Ingestro-motor (mappning/import) så den går att återanvända som backend när B byggs, och be Magnus om resurser till båda spåren samtidigt men med olika team — inte A först och B "efter sommaren". Om B:s scope (inloggning innan databas, progress-save, helpdesk-koppling) börjar diskuteras som krav på A innan A är levererat, glider augustideadline. Håll isär leverans (A, nu) och arkitekturbeslut som möjliggör B (nu, men utan att blockera A).

## 3. Bevis på tidsbesparing/effekt

**Har vi:** Importmatris (vilka datakategorier som går att flytta automatiskt vs manuellt), friktionspunkter C1–C7, kapacitetssiffrorna ovan.

**Saknar vi:** En faktisk innan/efter-mätning från Ingestro-sandboxen. Vi har ännu inte kört en verklig kundfil genom verktyget och tidmätt resultatet.

**Rekommendation:** Om det finns tid innan måndag, kör en pilot med en verklig BSO-exportfil genom sandboxen (giltig till 2026-08-31) och ta fram en konkret siffra ("X timmar → Y minuter"). En verifierad siffra väger tyngre för Magnus än en beskriven potential.

## 4. Vad vi ber Magnus om

- Öppna med kroken i punkt 1: styrgruppens egen riskmitigering namnger redan "on-boarding tool" som lösningen på CSM-kapacitetsrisken. Det gör asken till en leverans på befintligt beslut, inte en ny idé att sälja in.
- Avsätta resurser i AI lab för detta ändamål.
- Besluta vem som faktiskt bygger — öppen fråga till Magnus, inte förberedd av oss (Team Phoenix/Louise, Jonas, extern part, eller annat).
- Mandat att driva frågan vidare uppåt i organisationen om han bedömer att det behövs.

## 5. Skalbarhet

- Efterfrågan: bekräftat högt efterfrågad, inte bara för BSO-migreringen.
- Ägarskap: PS äger verktyget, med produktstöd från Produkt.
- Bredare tillämpning: gäller potentiellt hela Aceve-portföljen (Entré m.fl.), inte bara Next Project.

## 6. Öppna punkter / risker att vara transparent om i mötet

- Bulk vs. sekventiell (se punkt 2) — gemensamt beslut med Eric saknas fortfarande.
- **Pendo — verifierat via #aceve-pendo (2026-08-07).** Ägare/rollout-drivare: Dragos Raducanu. Redan live i produktion: KlarPris, Rekyl, Ordrestyring, och Entré-teamet bygger aktivt in-app-guider (Niklas Struve Poulsen). Hotjar avslutat 17/7 — Pendo session replay ersätter. Governance: "Pendo Centre of Excellence" (SharePoint, tvärfunktionellt ägarskap) siktar på Q3 2026, inte klart än. Dragos har explicit bjudit in till samtal om "onboarding — Pendo Guides support in-app highlights, tooltips, and videos... worth a conversation about self-service capabilities" (Slack 2026-06-10). **Ingen direkt konflikt med vårt verktyg** — Pendo är en guide-/tooltip-lager ovanpå en REDAN levande produkt, inte en datamigrerings-/mappningsmotor för kunder utan databas.

  **Konkret nytta av Pendo — två spår:**
  1. *Post go-live i Next:* bygg en "Välkommen efter BSO-migrering"-guide/checklista med Pendo Guides, samma arbetssätt som Entré-teamet redan visat (Niklas + Claude genererar HTML-block, ~30 min byggtid). Snabb, billig pilot — visar effekt utan att vänta på AI lab-resurser.
  2. *Inuti Spår B:s pre/onboarding-portal:* Pendo Resource Center ("self-serve hub with documentation, video tutorials, and triggered walkthroughs") matchar nästan exakt Carls idé om "koppling mot helpdesk för guidning". Kan ersätta egenbyggd guidningsfunktion i portalen — men kräver att Pendo-skriptet går att lägga på en sida utanför Next/Entré (licens/governance oklar, inte bekräftat).

  Rekommendation: stäm av båda spåren med Dragos innan/kring måndag — dels för att undvika att Magnus uppfattar det som dubbelarbete, dels för att bekräfta licensomfattning för spår 2.
- Felfrekvenssiffran från Ingestro-mötet är borttagen från detta underlag — källan var en AI-genererad mötessammanfattning, inte verifierad mot faktiska exportfiler.

---

## 7. Utfall — mötet genomfört 2026-08-10, 11:00–11:25

**Not:** anteckningarna nedan är AI-genererade av Teams Facilitator (Carl flaggade själv "kontrollera noggrannheten") — behandla som förstautkast, inte ordagrant protokoll. Officiell Teams-transkription är avstängd för tenanten, så detta är den enda källan.

**Deltagare:** Magnus Öhrman, Carl, Eric Lindberg (anslöt via Next-demo-tenant-identiteten "Plåtslageriet", platslageriet@next-tech.com — bekräftat av Carl).

**Utfall — positivt, Magnus efterfrågade konkreta leverabler:**
- Diskussion om att frigöra resurser från ordinarie leveranser. Carl lyfte själv den svåra frågan: vilka projekt pausas/senareläggs om resurser flyttas, givet redan pressad/backloggad utveckling — samma "PS saknar mandat"-risk som i juni-styrgruppsdokumentet, nu levande i rummet.
- Carl drev på för hastighet: tydlig effekt snart, inte uppskjutet till t.ex. mars.
- Resursprofil: inte djup domänkunskap, men förmåga att bygga gränssnitt, jobba med integrationer/databaser, gärna mer seniora.
- **Teknisk riktning (från "Plåtslageriet"):** fristående service UTANFÖR Next-monoliten, direkt mot API:et — färre beroenden, mer flexibilitet.
- Scope fortfarande öppet: brett vs. begränsat, kombinera tillvägagångssätt, anpassa efter kundens förberedelsegrad.
- Magnus: nyttan gäller hela bolaget, inte bara PS — större affärsvärde om applicerbart på fler produkter.
- **Konkret resursuppskattning: 0,5–1 resurs i 1–2 månader**, beroende på hjälp från UX och PS onboarding. Första verkliga siffran för AI lab-asken.
- Prototyp finns redan; fokus på timmar snarare än kostnad; MVP/post-MVP-scope ska definieras.

**Deadline: Magnus återkommer till Carl + "Plåtslageriet" senast onsdag 2026-08-12** med: sammanfattning, punktlista över kompetenser + resursuppskattning, och att affärsvärdet testas/dokumenteras.

**Åtgärder:** Magnus — identifiera vilka ingenjörsresurser som kan allokeras, återkoppla med förslag. "Plåtslageriet" — uppdatera prototypfilen med kompletterande anteckningar.

---
*Utkast — validera med Eric innan måndag. Uppdatera avsnitt 2 och 3 om ni hinner köra en pilot.*
