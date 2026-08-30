//@ts-nocheck
import React, { useMemo, useState } from "react";
import { DataImporter, ImporterSession } from "@ingestro/importer-react";
import * as XLSX from "xlsx";
import "./styles.css";

const importerStyle = {
  globals: {
    primaryColor: "#1a263b",
    fontFamily: "Inter, sans-serif",
    textColor: "#1a263b",
  },
  buttons: {
    primary: {
      backgroundColor: "#1a263b",
      color: "#ffffff",
      ":hover": {
        backgroundColor: "#2c3b55",
        transform: "translateY(-1px)",
      },
    },
    import: {
      backgroundColor: "#1a263b",
      color: "#ffffff",
      ":hover": {
        backgroundColor: "#2c3b55",
      },
    },
  },
  dropzone: {
    root: {
      border: "1px dashed #cbd5e1",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      transition: "all 0.2s ease",
    },
    content: {
      title: {
        color: "#1a263b",
        fontWeight: "700",
        fontSize: "18px",
      },
      description: {
        color: "#64748b",
      },
    },
  },
};

const rawSheetDefinitions = [
  {
    id: "foretag",
    name: "Företagsuppgifter",
    shortName: "Företag",
    sheetName: "Företag import",
    title: "Import 1: Företag",
    description:
      "Grunduppgifter för det egna företaget, inklusive adress, bankgiro, momsregistrering och fakturatexter.",
    labels: [
      "Företagsnamn*",
      "Person/Org.nr.*",
      "Momsreg.nr.*",
      "Bankgiro*",
      "Plusgiro",
      "Adress*",
      "Adress 2",
      "Adress 3",
      "Postnr.*",
      "Ort*",
      "Land",
      "Besöksadress",
      "Besöksadress 2",
      "Besöksadress 3",
      "Telefon",
      "Fax",
      "Epost",
      "Webadress",
      "Fakturatext F-skatt*",
      "Fakturatext dröjsmålsränta*",
    ],
  },
  {
    id: "timpriser",
    name: "Timpriser & roller",
    shortName: "Timpriser",
    sheetName: "Timpriser import",
    title: "Import 2: Timpriser",
    description:
      "Roller, timkostnader, debiteringspriser, konton och tidkoder som används vid tidrapportering.",
    labels: [
      "Kod",
      "Beskrivning",
      "Enhet",
      "Kostn/enh",
      "Pris/enh",
      "Kontonr",
      "Tidkod",
      "Debiterbar",
      "Grupp",
    ],
  },
  {
    id: "prislista",
    name: "Prislista",
    shortName: "Prislista",
    sheetName: "Prislista import",
    title: "Import 3: Prislista",
    description:
      "Artiklar, maskiner, material, utrustning och debiterbara prisrader som kan plockas till projekt.",
    labels: [
      "Artikelnr*",
      "Beskrivning*",
      "Enhet*",
      "Kostn/enh*",
      "Pris/enh*",
      "Konto*",
      "Debiterbar",
      "Artikelkategori",
      "Lagersaldo",
      "Tidkod",
      "Föräldraprojekt",
    ],
  },
  {
    id: "projekttyper",
    name: "Projekttyper",
    shortName: "Projekttyper",
    sheetName: "Projekttyper import",
    title: "Import 4: Projekttyper",
    description:
      "Ytterligare projekttyper som ska läggas upp för kategorisering och uppföljning av projekt.",
    labels: ["Namn*"],
  },
  {
    id: "skattereduktion",
    name: "Skattereduktion",
    shortName: "Skattereduktion",
    sheetName: "Skattereduktion import",
    title: "Import 5: Skattereduktion",
    description:
      "Standardinställningar för ROT, RUT och skattereduktionsunderlag.",
    labels: [
      "ROT-kostnadskonton*",
      "Standardinställning kundfaktura*",
      "Standardtyp ROT/RUT-arbete",
    ],
  },
  {
    id: "lonetillagg",
    name: "Lönetillägg",
    shortName: "Lönetillägg",
    sheetName: "Lönetillägg import",
    title: "Import 6: Lönetillägg",
    description:
      "Lönetillägg som milersättning, traktamente, jour och andra artiklar kopplade till lönefil.",
    labels: [
      "Artikelnr*",
      "Beskrivning*",
      "Artikelkategori",
      "Enhet*",
      "Kostn/enh*",
      "Pris/enh*",
      "Konto*",
      "Visa i mob enh",
      "Favorit i mobil enh",
      "Ta med offert",
      "Debiterbar",
      "Ägarprojekt",
      "Lagersaldo",
      "Tidkod*",
    ],
  },
  {
    id: "anvandarregister",
    name: "Användarregister",
    shortName: "Användarregister",
    sheetName: "Användare import",
    title: "Import 7: Användarregister",
    description:
      "Användare som ska kunna logga in i Next, inklusive licens, behörighetsgrupp, yrkesroll och personuppgifter.",
    labels: [
      "Aktiv*",
      "Anställningsnr",
      "För- och efternamn*",
      "Inloggning*",
      "Användarlicens*",
      "Primär grupp*",
      "Yrkesroll (från timpriser)*",
      "Signatur*",
      "E-post",
      "Mobil",
      "Telefon",
      "Namn",
      "Adressrad 1",
      "Adressrad 2",
      "Postnr",
      "Ort",
      "Land",
      "Startdatum",
      "Slutdatum",
      "Födelsedatum",
      "Språk",
      "Organisatoriskt projekt",
      "Närmaste anhörig",
      "Telefon anhörig",
      "Relation till anhörig",
      "Personnr",
      "Externt orgnr",
    ],
  },
  {
    id: "betalningsvillkor",
    name: "Betalningsvillkor",
    shortName: "Betalningsvillkor",
    sheetName: "Betalningsvillkor import",
    title: "Import 8: Betalningsvillkor",
    description:
      "Betalningsvillkor och antal dagar som används vid kundfakturering.",
    labels: ["Kod", "Beskrivning*", "Antal dagar*", "Kod*"],
  },
  {
    id: "franvaro",
    name: "Frånvaro",
    shortName: "Frånvaro",
    sheetName: "Frånvaro import",
    title: "Import 9: Frånvaro",
    description:
      "Frånvarotyper som semester, sjukfrånvaro, VAB och övrig ledighet med tidkoder.",
    labels: ["Beskrivning*", "Tidkod*"],
  },
  {
    id: "paslagsmall",
    name: "Påslagsmall",
    shortName: "Påslagsmall",
    sheetName: "Påslagsmall import",
    title: "Import 10: Påslagsmall",
    description:
      "Normaliserad TDM för påslagsmallens huvuduppgifter och kontobaserade påslag.",
    labels: [
      "Påslagsmall kod*",
      "Påslagsmall beskrivning*",
      "Standard",
      "Kontonr*",
      "Kontobeskrivning",
      "Påslag %*",
    ],
  },
  {
    id: "projekt",
    name: "Projektlista",
    shortName: "Projekt",
    sheetName: "Projekt import",
    title: "Import 11: Projekt",
    description:
      "Pågående eller aktuella projekt till driftstart med projektledare, kund, status, ersättningsform och adress.",
    labels: [
      "Föräldraprojektnr*",
      "Projektnr*",
      "Projektnamn*",
      "Projektstatus*",
      "Projektledare*",
      "Projektstart*",
      "Ersättningsform*",
      "Projekttyp",
      "Kund*",
      "Kundkontakt",
      "Kundreferens",
      "Kostnadsställe",
      "Arbetsledare",
      "Projektkategori",
      "Typ av uppdrag",
      "Noteringar",
      "Projektslut",
      "Påslagsmall",
      "Adress",
      "Adressrad 2",
      "Ort",
    ],
  },
  {
    id: "kontoplan",
    name: "Kontoplan",
    shortName: "Kontoplan",
    sheetName: "Kontoplan import",
    title: "Import 12: Ev. kontoplan",
    description:
      "Resultatkonton, kostnadsmarkeringar, moms, arbete och kontotyper från ekonomisystemet.",
    labels: [
      "Kontonr*",
      "Beskrivning*",
      "Kostnad*",
      "Fakturera vid import",
      "Moms",
      "Arbete",
      "Extern momskod",
      "Artikelnr på faktura",
      "Kontotyp",
    ],
  },
  {
    id: "kunder",
    name: "Kundregister",
    shortName: "Kunder",
    sheetName: "Kunder import",
    title: "Import 13: Ev. kunder",
    description:
      "Kundregister med kundnummer, kundtyp, fakturauppgifter, kontaktvägar, betalningsvillkor och skattereduktionsfält.",
    labels: [
      "Kundnr*",
      "Kund*",
      "Kundtyp*",
      "Valuta*",
      "Person/Orgnr*",
      "Namn*",
      "Adressrad 1",
      "Adressrad 2",
      "Postnr",
      "Ort",
      "Land",
      "E-post",
      "Faktura e-post",
      "Telefon",
      "Fax",
      "Fakturatyp",
      "Elektronisk adress",
      "Notering",
      "Entreprenadbolag",
      "Ingen moms",
      "Leverantör nr",
      "Betalningsvillkor",
      "IBAN",
      "SWIFT/BIC",
      "Bank",
      "Bankkonto",
      "Clearing nr",
      "EAN-kod",
      "VAT-nummer",
      "Landskod",
      "Fastighetsbeteckning",
      "Brf org nr",
      "Lägenhet nr",
    ],
  },
  {
    id: "leverantorer",
    name: "Leverantörer",
    shortName: "Leverantörer",
    sheetName: "Leverantörer import",
    title: "Import 14: Ev. leverantörer",
    description:
      "Leverantörsregister för inköp och e-invoice med organisationsnummer, valuta, betalningsuppgifter och kontaktvägar.",
    labels: [
      "Leverantör nr*",
      "Leverantör*",
      "Organisationsnr*",
      "VAT-nummer*",
      "Leverantörstyp*",
      "Valuta*",
      "Bankgiro",
      "Plusgiro",
      "Företagskategorier",
      "Regioner",
      "Namn",
      "Adressrad 1",
      "Adressrad 2",
      "Postnr",
      "Ort",
      "Land",
      "Landskod",
      "E-post",
      "Telefon",
      "Konto",
      "Webbadress",
    ],
  },
  {
    id: "kundkontakter",
    name: "Kundkontakter",
    shortName: "Kundkontakter",
    sheetName: "Kundkontakter import",
    title: "Import 15: Ev. kundkontakter",
    description:
      "Kontaktpersoner kopplade till kunder, inklusive personnummer och fastighetsägare för skattereduktion.",
    labels: [
      "Kundnr*",
      "Namn*",
      "Personnr",
      "Mobil",
      "Telefon",
      "E-post",
      "Faktura e-post",
      "Roll",
      "Kundref nr",
      "Fastighetsägare",
    ],
  },
  {
    id: "leverantorskontakter",
    name: "Leverantörskontakter",
    shortName: "Leverantörskontakter",
    sheetName: "Leverantörskontakter import",
    title: "Import 16: Ev. leverantörskontakter",
    description: "Kontaktpersoner som ska knytas till leverantörer.",
    labels: [
      "Leverantör nr*",
      "Namn*",
      "Personnr",
      "Mobil",
      "Telefon",
      "E-post",
      "Roll",
    ],
  },
  {
    id: "ovrigt",
    name: "Övrigt",
    shortName: "Övrigt",
    sheetName: "Övrigt import",
    title: "Import 17: Övrigt",
    description:
      "Övriga uppgifter som verifikationsserier, nummerserier och värden som gås igenom med projektledaren.",
    labels: ["Område*", "Beskrivning*", "Exempel", "Vårt värde*"],
  },
];

const companySeeds = [
  [
    "Alvesta Byggservice AB",
    "556417-9283",
    "SE556417928301",
    "3821-7456",
    "Ångbåtsvägen 9",
    "722 10",
    "Västerås",
    "info@alvestabyggservice.se",
    "www.alvestabyggservice.se",
  ],
  [
    "Vikens Plåt & Tak AB",
    "556902-1754",
    "SE556902175401",
    "7740-6331",
    "Industrigatan 4",
    "263 61",
    "Viken",
    "faktura@vikenplat.se",
    "www.vikenplat.se",
  ],
  [
    "Sigtuna Markpartner AB",
    "559331-0479",
    "SE559331047901",
    "3525-9187",
    "Stora Gatan 38",
    "193 30",
    "Sigtuna",
    "hej@sigtunamarkpartner.se",
    "www.sigtunamarkpartner.se",
  ],
  [
    "Öresund Golvteknik AB",
    "556746-3801",
    "SE556746380101",
    "6902-1105",
    "Borrgatan 17",
    "211 24",
    "Malmö",
    "kontakt@oresundgolvteknik.se",
    "www.oresundgolvteknik.se",
  ],
  [
    "Dala Projektservice AB",
    "559202-6431",
    "SE559202643101",
    "8329-5174",
    "Tunagatan 71",
    "784 34",
    "Borlänge",
    "ekonomi@dalaprojektservice.se",
    "www.dalaprojektservice.se",
  ],
  [
    "Kungsbacka Mur & Puts AB",
    "556984-0658",
    "SE556984065801",
    "7076-4418",
    "Hantverksgatan 19",
    "434 42",
    "Kungsbacka",
    "faktura@kbamurputs.se",
    "www.kbamurputs.se",
  ],
  [
    "Luleå Bygglogistik AB",
    "559145-7288",
    "SE559145728801",
    "3941-6620",
    "Betongvägen 12",
    "973 45",
    "Luleå",
    "info@lulebygglogistik.se",
    "www.lulebygglogistik.se",
  ],
  [
    "Södra Roslagens El AB",
    "556778-9353",
    "SE556778935301",
    "6118-2490",
    "Stationsvägen 41",
    "184 50",
    "Åkersberga",
    "support@sodraroslagensel.se",
    "www.sodraroslagensel.se",
  ],
  [
    "Eksjö Trä & Renovering AB",
    "559276-4108",
    "SE559276410801",
    "5287-0935",
    "Kaserngatan 3",
    "575 35",
    "Eksjö",
    "info@eksjotrar.se",
    "www.eksjotrar.se",
  ],
  [
    "Varbergs Byggledning AB",
    "556619-5048",
    "SE556619504801",
    "1684-7301",
    "Monarkvägen 7",
    "432 40",
    "Varberg",
    "ekonomi@varbergsbyggledning.se",
    "www.varbergsbyggledning.se",
  ],
];

const peopleSeeds = [
  ["Arne Andersson", "arne.andersson@nextdemo.se", "070-418 60 11", "AL"],
  ["Sofia Larsson", "sofia.larsson@nextdemo.se", "070-418 60 12", "PL"],
  ["James Scott", "james.scott@nextdemo.se", "070-418 60 13", "HV"],
  ["Karin Bergström", "karin.bergstrom@nextdemo.se", "070-418 60 14", "ADM"],
  ["Mehmet Kaya", "mehmet.kaya@nextdemo.se", "070-418 60 15", "EL"],
  ["Lina Holm", "lina.holm@nextdemo.se", "070-418 60 16", "VS"],
  ["Erik Lind", "erik.lind@nextdemo.se", "070-418 60 17", "SN"],
  ["Nora Sjöberg", "nora.sjoberg@nextdemo.se", "070-418 60 18", "KALK"],
  ["Oskar Nilsson", "oskar.nilsson@nextdemo.se", "070-418 60 19", "TAK"],
  ["Maja Persson", "maja.persson@nextdemo.se", "070-418 60 20", "BASU"],
];

const roleSeeds = [
  ["HV", "Hantverkare", "tim", 350, 400, "7010", "1101", "Ja", "Produktion"],
  ["AL", "Arbetsledning", "tim", 375, 450, "7010", "1102", "Ja", "Ledning"],
  ["PL", "Projektledare", "tim", 510, 725, "7210", "1160", "Ja", "Ledning"],
  ["EL", "Elektriker", "tim", 410, 620, "7010", "1180", "Ja", "Installation"],
  ["VS", "VVS-montör", "tim", 420, 640, "7010", "1190", "Ja", "Installation"],
  ["SN", "Snickare", "tim", 360, 490, "7010", "1230", "Ja", "Produktion"],
  [
    "ADM",
    "Administratör projekt",
    "tim",
    330,
    425,
    "7210",
    "1150",
    "Nej",
    "Administration",
  ],
  ["KALK", "Kalkylator", "tim", 465, 720, "7210", "1502", "Ja", "Ledning"],
];

const itemSeeds = [
  ["1001", "Manskapsbod", "bd", 350, 500, "5400", "Ja", "Verktyg", 3, "1201"],
  ["1002", "Lätt lastbil", "km", 400, 650, "4030", "Ja", "Fordon", 2, "1205"],
  [
    "1005",
    "Klyv/bordssåg",
    "tim",
    80,
    125,
    "5600",
    "Ja",
    "Egna maskiner",
    6,
    "1208",
  ],
  [
    "1024",
    "Laseravståndsmätare Leica",
    "dygn",
    45,
    95,
    "5600",
    "Ja",
    "Verktyg",
    7,
    "1212",
  ],
  [
    "1038",
    "Byggställning 12 meter",
    "v",
    1200,
    1850,
    "5410",
    "Ja",
    "Egna maskiner",
    2,
    "1220",
  ],
  [
    "1051",
    "Fallskyddssele komplett",
    "dygn",
    35,
    80,
    "5400",
    "Ja",
    "Säkerhet",
    12,
    "1230",
  ],
  [
    "1067",
    "Betongblandare 160 liter",
    "dygn",
    140,
    260,
    "5600",
    "Ja",
    "Egna maskiner",
    3,
    "1240",
  ],
  [
    "1160",
    "Skyddsplast golv 50 m",
    "rle",
    240,
    365,
    "4010",
    "Ja",
    "Eget material",
    34,
    "1250",
  ],
];

const projectSeeds = [
  [
    "00",
    "10001",
    "Lundbergs ombyggnad",
    "Beställt",
    "Arne Andersson",
    "2026-01-12",
    "Fastpris",
    "Byggservice",
    "10005",
    "Sofia Larsson",
    "KST-174",
    "Bygg",
    "Arne Andersson",
    "ROT",
    "Entreprenad",
    "Start efter materialleverans",
    "2026-06-30",
    "10",
    "Stora gatan 18",
    "Plan 2",
    "Linköping",
  ],
  [
    "10001",
    "10002",
    "Nattskrikan 12",
    "Pågående",
    "Sofia Larsson",
    "2026-02-03",
    "Löpande räkning",
    "Totalentreprenad",
    "10006",
    "Karin Bergström",
    "BRF-88",
    "Service",
    "James Scott",
    "Service",
    "Fasad",
    "Etapp 2",
    "2026-08-14",
    "12",
    "Tallvägen 7",
    "",
    "Norrköping",
  ],
  [
    "00",
    "10037",
    "Åkersberga kontor",
    "Nytt",
    "Nora Sjöberg",
    "2026-03-18",
    "Fastpris",
    "Arbetsorder",
    "10007",
    "Erik Lind",
    "INK-552",
    "Installation",
    "Mehmet Kaya",
    "Kommersiellt",
    "El",
    "Kundmöte bokat",
    "2026-09-22",
    "8",
    "Stationsvägen 41",
    "",
    "Åkersberga",
  ],
];

const cleanLabel = (label) =>
  String(label).replace(/\*/g, "").replace(/\s+/g, " ").trim();

const makeKey = (label) => {
  return (
    cleanLabel(label)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/å/g, "a")
      .replace(/ä/g, "a")
      .replace(/ö/g, "o")
      .replace(/%/g, "procent")
      .replace(/&/g, "och")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "falt"
  );
};

const sampleHeaderFor = (label) => {
  const text = cleanLabel(label);
  const aliases = {
    Företagsnamn: "Bolagsnamn",
    "Person/Org.nr.": "Organisationsnummer",
    "Momsreg.nr.": "VAT-id",
    Adress: "Postadress 1",
    "Postnr.": "Postnummer",
    Ort: "Stad",
    Epost: "Email",
    Webadress: "Website",
    "Fakturatext F-skatt": "F-skattetext",
    "Fakturatext dröjsmålsränta": "Dröjsmålsränta text",
    "Kostn/enh": "Intern kostnad",
    "Pris/enh": "Debiteringspris",
    Kontonr: "Bokföringskonto",
    Konto: "Kostnadskonto",
    Artikelnr: "Artikel-ID",
    Kundnr: "Kundnummer",
    "Leverantör nr": "Leverantörsnummer",
    "För- och efternamn": "Fullständigt namn",
    Inloggning: "Användarnamn",
    "Påslag %": "Påslag procent",
  };
  return aliases[text] || `${text} import`;
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const isRequired = (label) => String(label).includes("*");

const lowerClean = (label) => cleanLabel(label).toLowerCase();

const isYesNoLabel = (label) => {
  const lower = lowerClean(label);
  return /aktiv|debiterbar|ingen moms|fakturera vid import|arbete|standard|fastighetsägare|visa i mob|favorit|ta med offert|entreprenadbolag|kostnad/.test(
    lower
  );
};

const isDateLabel = (label) =>
  /datum|projektstart|projektslut|födelsedatum|startdatum|slutdatum/i.test(
    cleanLabel(label)
  );

const columnTypeFor = (label) => {
  const lower = lowerClean(label);
  if (/e-post|epost|email/.test(lower)) return "email";
  if (isDateLabel(label)) return "date";
  if (isYesNoLabel(label)) return "category";
  if (
    /användarlicens|projektstatus|ersättningsform|kundtyp|leverantörstyp|fakturatyp|valuta|språk|standardinställning/.test(
      lower
    )
  )
    return "category";
  if (/kostn|kostnad|pris|moms|lagersaldo|antal dagar|påslag/.test(lower))
    return "float";
  return "string";
};

const dropdownOptionsFor = (label) => {
  const lower = lowerClean(label);
  if (isYesNoLabel(label))
    return [
      { label: "Ja", value: "Ja", type: "string" },
      { label: "Nej", value: "Nej", type: "string" },
    ];
  if (/användarlicens/.test(lower))
    return [
      { label: "Full licens", value: "Full licens", type: "string" },
      { label: "Mobil licens", value: "Mobil licens", type: "string" },
    ];
  if (/projektstatus/.test(lower))
    return [
      { label: "Nytt", value: "Nytt", type: "string" },
      { label: "Beställt", value: "Beställt", type: "string" },
      { label: "Pågående", value: "Pågående", type: "string" },
      { label: "Avslutat", value: "Avslutat", type: "string" },
    ];
  if (/ersättningsform/.test(lower))
    return [
      { label: "Fastpris", value: "Fastpris", type: "string" },
      { label: "Löpande räkning", value: "Löpande räkning", type: "string" },
      { label: "Internt", value: "Internt", type: "string" },
    ];
  if (/kundtyp|leverantörstyp/.test(lower))
    return [
      { label: "Företag", value: "Företag", type: "string" },
      { label: "Privat", value: "Privat", type: "string" },
      { label: "Offentlig", value: "Offentlig", type: "string" },
    ];
  if (/fakturatyp/.test(lower))
    return [
      { label: "E-post", value: "E-post", type: "string" },
      { label: "EDI", value: "EDI", type: "string" },
      { label: "Papper", value: "Papper", type: "string" },
    ];
  if (/valuta/.test(lower))
    return [
      { label: "SEK", value: "SEK", type: "string" },
      { label: "Svenska kronor", value: "Svenska kronor", type: "string" },
    ];
  if (/språk/.test(lower))
    return [
      { label: "sv", value: "sv", type: "string" },
      { label: "en", value: "en", type: "string" },
      { label: "no", value: "no", type: "string" },
    ];
  if (/standardinställning/.test(lower))
    return [
      {
        label: "Ingen skattereduktion",
        value: "Ingen skattereduktion",
        type: "string",
      },
      { label: "ROT", value: "ROT", type: "string" },
      { label: "RUT", value: "RUT", type: "string" },
    ];
  return undefined;
};

const makeColumns = (labels) => {
  const seen = {};
  return labels.map((label) => {
    const base = makeKey(label);
    seen[base] = (seen[base] || 0) + 1;
    const key = seen[base] === 1 ? base : `${base}_${seen[base]}`;
    const column = {
      key,
      label,
      columnType: columnTypeFor(label),
      alternativeMatches: unique([
        sampleHeaderFor(label),
        cleanLabel(label),
        `${cleanLabel(label)} export`,
        `${cleanLabel(label)} från mall`,
        `${cleanLabel(label)} värde`,
      ]),
    };
    if (isRequired(label)) {
      column.validations = [
        {
          validate: "required",
          errorMessage: `${cleanLabel(label)} är obligatoriskt.`,
        },
      ];
    }
    const dropdownOptions = dropdownOptionsFor(label);
    if (dropdownOptions) {
      column.dropdownOptions = dropdownOptions;
    }
    return column;
  });
};

const sheetDefinitions = rawSheetDefinitions.map((definition) => ({
  ...definition,
  identifier: `next_${definition.id}_import`,
  columns: makeColumns(definition.labels),
}));

const pickCompany = (index) => companySeeds[index % companySeeds.length];
const pickPerson = (index) => peopleSeeds[index % peopleSeeds.length];
const pickRole = (index) => roleSeeds[index % roleSeeds.length];
const pickItem = (index) => itemSeeds[index % itemSeeds.length];
const pickProject = (index) => projectSeeds[index % projectSeeds.length];

const valueFor = (definition, label, rowIndex) => {
  const lower = lowerClean(label);
  const company = pickCompany(rowIndex);
  const person = pickPerson(rowIndex);
  const role = pickRole(rowIndex);
  const item = pickItem(rowIndex);
  const project = pickProject(rowIndex);
  if (/föräldraprojektnr/.test(lower)) return project[0];
  if (/projektnr/.test(lower)) return project[1];
  if (/projektnamn/.test(lower)) return project[2];
  if (/projektstatus/.test(lower)) return project[3];
  if (/projektledare/.test(lower)) return project[4];
  if (/projektstart/.test(lower)) return project[5];
  if (/ersättningsform/.test(lower)) return project[6];
  if (/projekttyp/.test(lower)) return project[7];
  if (/kundkontakt/.test(lower)) return project[9];
  if (/kundreferens/.test(lower)) return project[10];
  if (/kostnadsställe/.test(lower)) return project[11];
  if (/arbetsledare/.test(lower)) return project[12];
  if (/projektkategori/.test(lower)) return project[13];
  if (/typ av uppdrag/.test(lower)) return project[14];
  if (/notering/.test(lower)) return project[15];
  if (/projektslut/.test(lower)) return project[16];
  if (/påslagsmall/.test(lower)) return project[17];
  if (/kundnr/.test(lower)) return String(10005 + rowIndex);
  if (/leverantör nr/.test(lower)) return String(20070 + rowIndex);
  if (/artikelnr/.test(lower))
    return definition.id === "lonetillagg" ? String(101 + rowIndex) : item[0];
  if (/kontonr|konto$|kostnadskonto|bokföringskonto/.test(lower))
    return ["4010", "4030", "5400", "5600", "7010", "7210"][rowIndex % 6];
  if (/person\/org|organisationsnr|externt orgnr|brf org nr/.test(lower))
    return company[1];
  if (/momsreg|vat/.test(lower)) return company[2];
  if (/bankgiro/.test(lower)) return company[3];
  if (/plusgiro/.test(lower))
    return rowIndex % 4 === 0 ? `45${rowIndex + 13}-${3200 + rowIndex}` : "";
  if (/iban/.test(lower))
    return `SE${45 + rowIndex}500000000583982574${10 + rowIndex}`;
  if (/swift|bic/.test(lower)) return "ESSESESS";
  if (/bankkonto/.test(lower)) return `5839-${827400 + rowIndex}`;
  if (/clearing/.test(lower)) return "5839";
  if (/ean/.test(lower)) return `7365560${100000 + rowIndex}`;
  if (/adressrad 2|adress 2/.test(lower))
    return rowIndex % 3 === 0 ? "Box 42" : "";
  if (/adressrad 1|adress$|besöksadress/.test(lower)) return company[4];
  if (/postnr|postnummer/.test(lower)) return company[5];
  if (/ort/.test(lower)) return company[6];
  if (/landskod/.test(lower)) return "SE";
  if (/land/.test(lower)) return "Sverige";
  if (/e-post|epost|email|faktura e-post/.test(lower))
    return /faktura/.test(lower)
      ? `faktura+${rowIndex + 1}@${company[7].split("@")[1]}`
      : company[7];
  if (/webbadress|webadress/.test(lower)) return company[8];
  if (/telefon anhörig/.test(lower)) return "070-918 44 55";
  if (/telefon|mobil/.test(lower)) return person[2];
  if (/fax/.test(lower)) return "";
  if (/företagsnamn|kund\*|leverantör\*/.test(lower)) return company[0];
  if (/kund$|leverantör$/.test(lower)) return company[0];
  if (/namn\*|för- och efternamn|namn$/.test(lower))
    return definition.id.includes("kontakt") ||
      definition.id === "anvandarregister"
      ? person[0]
      : company[0];
  if (/inloggning/.test(lower)) return person[1];
  if (/användarlicens/.test(lower))
    return rowIndex % 4 === 0 ? "Mobil licens" : "Full licens";
  if (/primär grupp/.test(lower))
    return [
      "Systemadministratörer",
      "Projektledare",
      "Mobilanvändare",
      "Ekonomi",
    ][rowIndex % 4];
  if (/yrkesroll/.test(lower)) return person[3];
  if (/signatur/.test(lower))
    return person[0]
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  if (/anställningsnr/.test(lower)) return String(1000 + rowIndex * 7);
  if (/startdatum/.test(lower))
    return `2026-${String((rowIndex % 9) + 1).padStart(2, "0")}-01`;
  if (/slutdatum/.test(lower))
    return rowIndex % 6 === 0
      ? `2026-${String((rowIndex % 9) + 3).padStart(2, "0")}-28`
      : "";
  if (/födelsedatum/.test(lower))
    return `198${rowIndex % 10}-${String((rowIndex % 9) + 1).padStart(
      2,
      "0"
    )}-15`;
  if (/språk/.test(lower)) return rowIndex % 5 === 0 ? "en" : "sv";
  if (/organisatoriskt projekt|ägarprojekt/.test(lower)) return "10000";
  if (/närmaste anhörig/.test(lower))
    return ["Eva Andersson", "Jonas Larsson", "Maria Holm"][rowIndex % 3];
  if (/relation/.test(lower))
    return ["Make/maka", "Sambo", "Förälder"][rowIndex % 3];
  if (/personnr/.test(lower))
    return `19${70 + (rowIndex % 20)}${String((rowIndex % 9) + 1).padStart(
      2,
      "0"
    )}15-${String(1200 + rowIndex).padStart(4, "0")}`;
  if (/artikelkategori/.test(lower))
    return definition.id === "lonetillagg" ? "Lönetillägg" : item[7];
  if (/enhet/.test(lower))
    return definition.id === "timpriser" ? role[2] : item[2];
  if (/kostn|kostnad/.test(lower))
    return definition.id === "timpriser" ? role[3] : item[3];
  if (/pris/.test(lower))
    return definition.id === "timpriser" ? role[4] : item[4];
  if (/lagersaldo/.test(lower)) return item[8];
  if (/tidkod/.test(lower))
    return definition.id === "timpriser" ? role[6] : item[9];
  if (/debiterbar/.test(lower))
    return definition.id === "timpriser" ? role[7] : item[6];
  if (/grupp/.test(lower)) return role[8];
  if (/kod$|påslagsmall kod/.test(lower))
    return definition.id === "timpriser"
      ? role[0]
      : definition.id === "betalningsvillkor"
      ? String([10, 15, 30, 45][rowIndex % 4])
      : definition.id === "paslagsmall"
      ? `${[8, 10, 12, 15][rowIndex % 4]}P`
      : `KOD-${240 + rowIndex}`;
  if (/beskrivning/.test(lower)) {
    if (definition.id === "timpriser") return role[1];
    if (definition.id === "prislista" || definition.id === "lonetillagg")
      return definition.id === "lonetillagg"
        ? [
            "Egen bil i tjänst",
            "Traktamente Sverige",
            "Jourtillägg kväll",
            "Restidsersättning",
          ][rowIndex % 4]
        : item[1];
    if (definition.id === "betalningsvillkor")
      return `${[10, 15, 30, 45][rowIndex % 4]} dagar`;
    if (definition.id === "franvaro")
      return ["Semester", "Sjuk", "VAB", "Föräldraledig", "Kompledighet"][
        rowIndex % 5
      ];
    if (definition.id === "kontoplan")
      return [
        "Material och maskiner",
        "UE arbete",
        "Eget arbete",
        "Intäkter projekt",
      ][rowIndex % 4];
    if (definition.id === "ovrigt")
      return [
        "Verifikationsserie för kundfakturor",
        "Verifikationsserie för leverantörsfakturor",
        "Projektnummerserie i ekonomisystem",
        "Högsta kundnummer i ekonomisystem",
      ][rowIndex % 4];
    if (definition.id === "paslagsmall")
      return rowIndex % 2 === 0 ? "Produktionskostnad" : "UE och material";
    return `${definition.shortName} beskrivning ${rowIndex + 1}`;
  }
  if (/antal dagar/.test(lower)) return [10, 15, 30, 45][rowIndex % 4];
  if (/moms/.test(lower)) return 25;
  if (
    /fakturera vid import|arbete|aktiv|standard|fastighetsägare|visa i mob|favorit|ta med offert|entreprenadbolag|ingen moms/.test(
      lower
    )
  )
    return rowIndex % 5 === 0 ? "Nej" : "Ja";
  if (/kontotyp/.test(lower))
    return ["Kostnad", "Intäkt", "Balans"][rowIndex % 3];
  if (/extern momskod/.test(lower)) return `M${rowIndex % 4}`;
  if (/valuta/.test(lower))
    return definition.id === "kunder" ? "Svenska kronor" : "SEK";
  if (/betalningsvillkor/.test(lower)) return "30";
  if (/fakturatyp/.test(lower)) return rowIndex % 3 === 0 ? "EDI" : "E-post";
  if (/elektronisk adress/.test(lower)) return `7365560${100000 + rowIndex}`;
  if (/fastighetsbeteckning/.test(lower))
    return rowIndex % 4 === 0 ? `Nattskrikan ${12 + rowIndex}` : "";
  if (/lägenhet/.test(lower)) return rowIndex % 4 === 0 ? `12${rowIndex}` : "";
  if (/rot-kostnadskonton/.test(lower)) return "7010, 7011, 7210";
  if (/standardinställning/.test(lower))
    return rowIndex % 3 === 0 ? "ROT" : "Ingen skattereduktion";
  if (/standardtyp/.test(lower))
    return rowIndex % 2 === 0 ? "ROT arbete" : "RUT arbete";
  if (/påslag/.test(lower)) return [8, 10, 12, 15][rowIndex % 4];
  if (/område/.test(lower))
    return [
      "Verifikationsserier",
      "Nummerserier",
      "Ekonomi",
      "Projektstyrning",
    ][rowIndex % 4];
  if (/exempel/.test(lower))
    return ["K", "L", "A", "0 till 13458"][rowIndex % 4];
  if (/vårt värde/.test(lower))
    return ["K", "L", "A", `1000-${13900 + rowIndex}`][rowIndex % 4];
  return `${cleanLabel(label)} ${rowIndex + 1}`;
};

const makeSampleRows = (definition) => {
  const rows = Array.from({ length: 30 }, (_, rowIndex) => {
    const row = {};
    definition.labels.forEach((label) => {
      row[sampleHeaderFor(label)] = valueFor(definition, label, rowIndex);
    });
    return row;
  });
  const requiredLabel = definition.labels.find(isRequired);
  if (requiredLabel) {
    rows[5][sampleHeaderFor(requiredLabel)] = "";
  }
  const orgLabel = definition.labels.find((label) => /org|person/i.test(label));
  if (orgLabel) {
    rows[8][sampleHeaderFor(orgLabel)] = "ABC123";
  }
  const numericLabel = definition.labels.find((label) =>
    /kostn|pris|antal dagar|moms|påslag|lagersaldo/i.test(label)
  );
  if (numericLabel) {
    rows[12][sampleHeaderFor(numericLabel)] = -25;
  }
  const emailLabel = definition.labels.find((label) =>
    /e-post|epost|email/i.test(label)
  );
  if (emailLabel) {
    rows[16][sampleHeaderFor(emailLabel)] = "felaktig-epost";
  }
  return rows;
};

const makeNoiseRows = () => [
  { Export: "Systeminfo", Värde: "NEXT legacy export", Status: "Ignored" },
  {
    Export: "Skapad av",
    Värde: "migration.service@kund.se",
    Status: "Ignored",
  },
  { Export: "Period", Värde: "2026-Q2 onboarding", Status: "Ignored" },
  { Export: "Flik", Värde: "Historisk sammanställning", Status: "Ignored" },
  { Export: "Kontrollsumma", Värde: "SE-84B7-19F0", Status: "Ignored" },
  {
    Export: "Radnotis",
    Värde: "Den här fliken ska inte importeras",
    Status: "Ignored",
  },
  { Export: "Batch", Värde: "NXT-MIG-7429", Status: "Ignored" },
  { Export: "Arkiv", Värde: "customer-preload-archive", Status: "Ignored" },
];

const getValue = (cell) => {
  if (cell && typeof cell === "object" && "value" in cell) return cell.value;
  return cell;
};

const isEmpty = (value) =>
  value === undefined || value === null || String(value).trim() === "";

const addMessage = (updates, key, value, level, message) => {
  const current = updates[key] || { value };
  updates[key] = {
    value,
    info: [...(current.info || []), { level, message }],
  };
};

const buildCellUpdates = (definition, row) => {
  const updates = {};
  definition.columns.forEach((column) => {
    const value = getValue(row[column.key]);
    const label = column.label;
    const lower = lowerClean(label);
    if (isRequired(label) && isEmpty(value)) {
      addMessage(
        updates,
        column.key,
        value,
        "error",
        `${cleanLabel(label)} är obligatoriskt enligt mallen.`
      );
    }
    if (isDateLabel(label)) {
      addMessage(
        updates,
        column.key,
        value,
        "info",
        "Datumformatet har automatiskt justerats till importformatet."
      );
    }
    if (
      /e-post|epost|email/.test(lower) &&
      !isEmpty(value) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
    ) {
      addMessage(
        updates,
        column.key,
        value,
        "error",
        "E-postadressen behöver ha ett giltigt format."
      );
    }
    if (
      /person\/org|organisationsnr|orgnr|personnr/.test(lower) &&
      !isEmpty(value) &&
      !/^[0-9]{6,8}-?[0-9]{4}$/.test(String(value))
    ) {
      addMessage(
        updates,
        column.key,
        value,
        "warning",
        "Kontrollera numret. Vanligt format är 556677-8899 eller 19700101-1234."
      );
    }
    if (
      /kostn|kostnad|pris|antal dagar|moms|påslag|lagersaldo/.test(lower) &&
      !isEmpty(value) &&
      Number(value) < 0
    ) {
      addMessage(
        updates,
        column.key,
        value,
        "error",
        "Värdet kan inte vara negativt."
      );
    }
    if (
      column.columnType === "category" &&
      !isEmpty(value) &&
      column.dropdownOptions &&
      !column.dropdownOptions.some(
        (option) =>
          String(option.value).toLowerCase() ===
          String(value).trim().toLowerCase()
      )
    ) {
      addMessage(
        updates,
        column.key,
        value,
        "warning",
        "Värdet matchar inte de vanligaste valen i mallen."
      );
    }
  });
  const firstColumn = definition.columns[0];
  if (firstColumn) {
    addMessage(
      updates,
      firstColumn.key,
      getValue(row[firstColumn.key]),
      "info",
      `Raden läses in från fliken ${definition.shortName}.`
    );
  }
  return updates;
};

const createSettings = (definition) => ({
  identifier: definition.identifier,
  title: definition.title,
  developerMode: false,
  prompts: true,
  cleaningAssistant: true,
  mergeHeaders: true,
  metadataSelection: true,
  transpose: true,
  modal: true,
  columns: definition.columns,
  style: importerStyle,
});

const createOnEntryInit = (definition) => {
  return (row) => buildCellUpdates(definition, row);
};

const createOnEntryChange = (definition) => {
  return (rows) => {
    return rows.map((row) => ({
      rowIndex: row.rowIndex,
      data: buildCellUpdates(definition, row.data),
    }));
  };
};

const prepItems = [
  { step: 1, title: "Välkommen", subtitle: "Introduktion" },
  { step: 2, title: "Företagsuppgifter", subtitle: "Grund, land & språk" },
  {
    step: 3,
    title: "Er verksamhet & bakgrund",
    subtitle: "Profil, geografi, SEO",
  },
  { step: 4, title: "Superanvändare", subtitle: "Minst 2 personer" },
  { step: 5, title: "Webbinarier", subtitle: "3 utbildningar" },
  { step: 6, title: "Ansvarsfördelning", subtitle: "Läs och bekräfta" },
];

export default function App() {
  const [completed, setCompleted] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState({});

  const canStart = (index) =>
    index === 0 || Boolean(completed[sheetDefinitions[index - 1].identifier]);

  const getTimelineStatus = (index) => {
    const definition = sheetDefinitions[index];
    if (completed[definition.identifier]) return "complete";
    if (!canStart(index)) return "locked";
    if (index === activeIndex) return "active";
    return "available";
  };

  const activeDefinition = sheetDefinitions[activeIndex];

  const startImporter = async (index) => {
    if (!canStart(index)) return;
    const definition = sheetDefinitions[index];
    setActiveIndex(index);
    await ImporterSession.verify({ identifier: definition.identifier }).catch(
      () => null
    );
    ImporterSession.start({ identifier: definition.identifier });
  };

  const downloadSample = (definition) => {
    const workbook = XLSX.utils.book_new();
    const dataSheet = XLSX.utils.json_to_sheet(makeSampleRows(definition));
    const noiseSheet = XLSX.utils.json_to_sheet(makeNoiseRows());
    XLSX.utils.book_append_sheet(
      workbook,
      dataSheet,
      definition.sheetName.slice(0, 31)
    );
    XLSX.utils.book_append_sheet(workbook, noiseSheet, "Irrelevant exportdata");
    XLSX.writeFile(workbook, `${definition.identifier}_sample.xlsx`);
  };

  const createOnResults = (definition, index) => {
    return (result, errors, complete, logs) => {
      setResults((current) => ({
        ...current,
        [definition.identifier]: {
          importName: definition.name,
          importedRows: Array.isArray(result) ? result.length : 0,
          errorRows: Array.isArray(errors) ? errors.length : 0,
          result,
          errors,
          logs,
        },
      }));
      setCompleted((current) => ({
        ...current,
        [definition.identifier]: true,
      }));
      setActiveIndex(Math.min(index + 1, sheetDefinitions.length - 1));
      complete();
    };
  };

  const resultSummary = useMemo(() => {
    return sheetDefinitions.map((definition, index) => ({
      step: index + 1,
      sheet: definition.shortName,
      status: completed[definition.identifier]
        ? "complete"
        : canStart(index)
        ? "available"
        : "locked",
      output: results[definition.identifier] || null,
    }));
  }, [completed, results]);

  const completedCount = sheetDefinitions.filter(
    (definition) => completed[definition.identifier]
  ).length;
  const progressPercent = Math.round(
    (completedCount / sheetDefinitions.length) * 100
  );

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="topbar-brand">
          <img
            src="https://adelisequity.com/wp-content/uploads/2026/01/logo_aceve_white@2x.png"
            alt="Aceve"
            className="topbar-logo"
          />
          <div className="topbar-copy">
            <span className="topbar-title">
              Preboarding & Datamigration – Next Project
            </span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="settings-btn" type="button">
            settings <span>Inställningar</span>
          </button>
          <button className="lang-btn" type="button">
            Svenska ▾
          </button>
          <div className="client-card">
            <span className="client-label">Kund</span>
            <span className="client-name">CaPa Bygg AB</span>
            <span className="client-subtitle">Kontakt: Project PB</span>
          </div>
        </div>
      </div>
      <div className="progress-strip">
        <div className="progress-strip-head">
          <span>Framsteg</span>
          <span>{progressPercent}% klart</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <span className="sidebar-group-label">Förberedelse</span>
            <div className="prep-list">
              {prepItems.map((item, index) => (
                <div
                  className={`prep-item ${
                    index === 1 ? "done" : index === 0 ? "active" : ""
                  }`}
                  key={item.step}
                >
                  <div className="prep-marker">
                    {index === 1 ? "✓" : item.step}
                  </div>
                  <div className="prep-copy">
                    <div className="prep-title">{item.title}</div>
                    <div className="prep-subtitle">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-section">
            <div className="migration-heading">
              <span className="sidebar-group-label">Datamigration</span>
              <span className="sidebar-group-pill">Ingestro</span>
            </div>
            <div className="migration-list">
              {sheetDefinitions.map((definition, index) => {
                const status = getTimelineStatus(index);
                const locked = status === "locked";
                return (
                  <div
                    className={`migration-item ${status}`}
                    key={definition.identifier}
                    onClick={() => {
                      if (!locked) setActiveIndex(index);
                    }}
                  >
                    <div className="migration-index">
                      <div className="migration-bullet">
                        {completed[definition.identifier]
                          ? "✓"
                          : locked
                          ? "🔒"
                          : index + 1}
                      </div>
                      {index < sheetDefinitions.length - 1 && (
                        <div className="migration-line" />
                      )}
                    </div>
                    <div className="migration-content">
                      <div className="migration-name-row">
                        <span className="migration-name">
                          {definition.name}
                        </span>
                        {status === "complete" && (
                          <span className="status-pill complete">Klar</span>
                        )}
                        {status === "active" && (
                          <span className="status-pill active">Redo</span>
                        )}
                        {status === "locked" && (
                          <span className="status-pill locked">Låst</span>
                        )}
                      </div>
                      <div className="migration-sub">{definition.title}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="sidebar-footer-card">
            <div className="sidebar-footer-title">Skicka & boka uppstart</div>
            <div className="sidebar-footer-text">Lås upp när allt är klart</div>
          </div>
        </aside>
        <main className="workspace">
          <div className="workspace-container">
            <section className="hero-card">
              <div className="hero-content">
                <h1 className="hero-title">Migrationsplan</h1>
                <p className="hero-subtitle">
                  Ladda upp er Gi-mall och följ importordningen. Inget i flödet
                  är ändrat, endast gränssnittet har stylats om för att matcha
                  mockupen.
                </p>
              </div>
              <div className="hero-actions">
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => downloadSample(activeDefinition)}
                >
                  Ladda ner aktiv exempel-fil
                </button>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => startImporter(activeIndex)}
                  disabled={!canStart(activeIndex)}
                >
                  Upload file or start importer
                </button>
              </div>
            </section>
            <section className="overview-card">
              <div className="overview-card-header">
                <div>
                  <span className="overview-eyebrow">
                    Gi-mall ({activeDefinition.shortName})
                  </span>
                  <h2 className="overview-title">{activeDefinition.title}</h2>
                  <p className="overview-description">
                    {activeDefinition.description}
                  </p>
                </div>
                <div className="overview-badge">
                  En Excel-fil med en flik per datatyp
                </div>
              </div>
              <div className="upload-showcase">
                <div className="upload-showcase-inner">
                  <div className="upload-icon">📊</div>
                  <div className="upload-title">
                    Ladda upp er Gi-mall (Excel)
                  </div>
                  <div className="upload-copy">
                    Använd knappen högst upp för att starta den aktiva
                    importören. ImporterSession öppnas vid upload-steget och
                    nästa steg låses upp automatiskt när importen är klar.
                  </div>
                </div>
              </div>
            </section>
            <section className="checklist-card">
              <div className="checklist-title">
                Förberedelser i processamordnaren
              </div>
              <div className="checklist-item">
                <span className="check-box" />
                Vi har gått igenom projektstatusar. Endast projekt vi arbetar
                med och ska ha pågående.
              </div>
              <div className="checklist-item">
                <span className="check-box" />
                Alla övriga projekt har annan status, så de är avslutade och
                kommer inte med i importen.
              </div>
              <div className="checklist-item">
                <span className="check-box" />
                Vi förstår att enbart projekt med status Pågående migreras till
                Next.
              </div>
            </section>
            <section className="content-card">
              <div className="card-head">
                <div>
                  <div className="card-eyebrow">Migrationstidslinje</div>
                  <h3 className="card-title">{activeDefinition.name}</h3>
                </div>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={() => downloadSample(activeDefinition)}
                >
                  Download sample for {activeDefinition.shortName}
                </button>
              </div>
              <div className="importer-container">
                <div className="current-import-card">
                  <span className="current-eyebrow">Aktiv importör</span>
                  <h2>{activeDefinition.title}</h2>
                  <p>{activeDefinition.description}</p>
                  <div className="action-row">
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => downloadSample(activeDefinition)}
                    >
                      Download sample
                    </button>
                  </div>
                </div>
                <div className="hidden-importers">
                  {sheetDefinitions.map((definition, index) => (
                    <DataImporter
                      key={definition.identifier}
                      licenseKey="non-commercial"
                      settings={createSettings(definition)}
                      onEntryInit={createOnEntryInit(definition)}
                      onEntryChange={createOnEntryChange(definition)}
                      onResults={createOnResults(definition, index)}
                    />
                  ))}
                </div>
              </div>
            </section>
            <section className="results-wrapper">
              <div className="results-header">
                <h3>Import session result</h3>
                <span className="status-badge">
                  {completedCount === sheetDefinitions.length
                    ? "All complete"
                    : "In progress"}
                </span>
              </div>
              <pre className="code-viewer animated-fade-in">
                {JSON.stringify(resultSummary, null, 2)}
              </pre>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
