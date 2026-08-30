# Handover: preboarding-verktyg för BSO (till Pierre)

*Från: Carl Bäckström. Datum: 2026-06-12. För dig som bygger webbprototypen.*

## Vad du tar över

Vi vill ha en preboarding där kunden gör sina förberedelser själv och där ett "klart" automatiskt signalerar till oss. Du erbjöd dig att bygga en prototyp (Slack 11 juni). Det här dokumentet ger dig scopet, det som redan finns, och var gränserna går så att vi inte bygger för brett.

Bakgrund i korthet: BSO sunsettas och kontona ska till Next [figure removed — belongs to the BSO Sunset project]. Vi vill korta ledtiden per kund genom att låta kunden förbereda sig utan vår inblandning. Idén bekräftades på mötet med Tomas W 12 juni och ligger i linje med steeringens "minimum onboarding-scope" (9 juni).

## Dag 1: det här finns redan

Två artefakter ligger i mappen `BSO Sunset` (delad):

- `bso-onboarding.html` — single-file HTML-prototyp, Aceve-branding, localStorage. Visar flödet och CONFIG-blocket (kundnamn, konsult, e-post, länkar). Bra som funktionsreferens.
- `BSO-onboarding-MALL.xlsx` — samma flöde som co-authorad Excel (test av delad SP-mapp). Visar stegen och låslogiken (CTA låses upp när alla steg är klara).

Senaste mallversioner (GI-mall m.m.) finns här: `ACEVE-D - Global Professional Services > Professional Services Hub > 06_Customer Documentation > Next > SE`.

Känd begränsning från HTML-spåret: SharePoint Online kör inte JS i uppladdade HTML-filer, och localStorage är per webbläsare (ingen delad state). Därför behövs en riktig webblösning. Hosting måste godkännas av IT (din egen poäng i Slack), Carl tar den avstämningen.

## Vad prototypen ska göra (låst scope)

Kundens fem steg, ifyllda av kunden själv:

1. Superanvändare + korrekt användarlista (förnamn, efternamn, e-post, roll; minst 2). Roller, vilka ska in i Next, vilka slutar.
2. Företagsuppgifter.
3. Avtal: påslagsmallar, prislista, timpriser (motsvarar GI-mallens vita flikar).
4. Webbinarier: tre stycken, en bock per superanvändare och webbinar, med direktlänk till helpdesk-artikeln.
5. Ansvarsfördelning: läst och bekräftad.

Multi-user: flera superanvändare ska kunna arbeta samtidigt och se varandras progress. Det är därför HTML+localStorage inte räcker.

Completion: när alla steg är klara genererar verktyget **exakt ett ticket** (mot support/onboarding) med superanvändaruppgifter och en uppmaning att bifoga GI-mallen. Det ticketet är startsignalen för oss.

## Utvecklingsmöjligheter inom scope

Den som ger mest värde är inte gränssnittet, utan kopplingen efter "klart":

```
Kund klar  →  ticket  →  IT-access + export körs  →  data i kundmapp  →  pling tillbaka till onboarding
```

Inom scope att tänka in när du bygger:

- **Completion-signalen som trigger.** Ticketet ska bära det som behövs för att starta exportsteget (kund, kontaktperson, IT-kontakt). Tomas/IT kör sedan exportverktyget och lägger filerna i kundmappen.
- **Återanvändbarhet.** Bygg generiskt. Flödet ska funka för icke-BSO-kunder också, BSO är bara första caset.
- **Status/progress per kund** som vi internt kan se (vilka kunder är klara, vilka väntar på vad).

## Utanför prototypens scope (ta inte med)

- Clean cut-märkning av migrerade projekt i Byggsamordnaren. Hör hemma i projektledar-guiden.
- Exportverktygets egna förbättringar (status/års-filter, error-lista på poster under minimikrav). Eget spår, ägare Jonas/Tomas W.
- Standardmallar i kundmappen. Blockerat tills beslut om mallförsäljning är taget (Dennis/Carina).

## Kontakter

- Carl Bäckström, PS: scope, kundens steg, GI-mallens innehåll, IT-avstämning för hosting.
- Tomas W: exportverktyget och datasidan.
- Dennis: beslut om mallförsäljning.

## Nästa steg

1. Carl låser loopen som minsta leverabel på BSO Sunset-mötet (tisdag).
2. Pierre: utkast på webblösning för de fem stegen + multi-user + completion-ticket, med befintliga artefakter som referens.
3. Carl + Pierre: stäm av hosting med IT innan vi går vidare från prototyp.
