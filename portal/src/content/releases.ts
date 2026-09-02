import type { LocalizedText } from "@/lib/registry/schema";

/**
 * Release notes — the source for the in-app "What's new" page.
 * Keep in sync with CHANGELOG.md (technical audience) — this file carries the
 * end-user-facing wording, per language.
 */
export interface Release {
  version: string;
  date: string; // ISO date
  notes: { title: LocalizedText; items: LocalizedText[] };
}

export const releases: Release[] = [
  {
    version: "0.1.4",
    date: "2026-09-02",
    notes: {
      title: {
        sv: "Ny fas: Kartläggning",
        en: "New phase: Mapping",
      },
      items: [
        {
          sv: "Ett kartläggningssteg mellan förberedelserna och datamigrationen — era svar styr vilka datakategorier ni behöver ladda upp själva.",
          en: "A mapping step between preparation and data migration — your answers decide which data categories you upload yourselves.",
        },
        {
          sv: "Kartläggningen blockerar inte datastegen: ni kan arbeta med båda parallellt.",
          en: "The mapping does not block the data steps: you can work on both in parallel.",
        },
        {
          sv: "Kategorier som hämtas via integration försvinner ur er att-göra-lista och markeras \"Hämtas via integration\".",
          en: "Categories fetched via integration leave your to-do list and are marked \"Fetched via integration\".",
        },
      ],
    },
  },
  {
    version: "0.1.3",
    date: "2026-09-02",
    notes: {
      title: {
        sv: "Feedbackrundan 31 augusti åtgärdad",
        en: "The 31 August feedback round addressed",
      },
      items: [
        {
          sv: "Datakategorisidorna fungerar igen (gav 404 i förra versionen).",
          en: "The data category pages work again (they returned 404 in the previous version).",
        },
        {
          sv: "Valideringsfel visas nu där du tittar: sidan scrollar till första felet och en felräknare visas vid Spara.",
          en: "Validation errors now appear where you are looking: the page scrolls to the first error and an error count is shown next to Save.",
        },
        {
          sv: "Kategorinamn och beskrivningar följer språkvalet (svenska och engelska).",
          en: "Category names and descriptions follow the language choice (Swedish and English).",
        },
        {
          sv: "Välkomststeget bekräftar inte längre avtalet med en kryssruta — ert signerade avtal är anledningen till att ni är här.",
          en: "The welcome step no longer confirms the agreement with a checkbox — your signed agreement is why you are here.",
        },
        {
          sv: "Steget Webbinarier heter nu Utbildningar, och utbildningar kan bära bokningslänkar.",
          en: "The Webinars step is now called Trainings, and trainings can carry booking links.",
        },
        {
          sv: "Ny exempelkund med mindre produktpaket visar att flödet anpassas per paket.",
          en: "A new sample customer on a smaller product package shows the flow adapting per package.",
        },
      ],
    },
  },
  {
    version: "0.1.2",
    date: "2026-08-30",
    notes: {
      title: {
        sv: "Portalen finns nu på aceveonboarding.achiever.se",
        en: "The portal is now live at aceveonboarding.achiever.se",
      },
      items: [
        {
          sv: "Första driftsättningen för intern testning. Ingen inloggning ännu — demoärendena på startsidan är ingångarna.",
          en: "First deployment for internal testing. No login yet — the demo cases on the home page are the entry points.",
        },
        {
          sv: "Ingen funktionell förändring i flödet jämfört med 0.1.1.",
          en: "No functional change to the flow compared with 0.1.1.",
        },
      ],
    },
  },
  {
    version: "0.1.1",
    date: "2026-08-30",
    notes: {
      title: {
        sv: "Tydligare status och tryggare inskick",
        en: "Clearer status and a safer submission",
      },
      items: [
        {
          sv: "Framstegsräknaren visar nu även antal klara steg, och 100 % betyder att underlaget faktiskt är inskickat.",
          en: "The progress counter now also shows steps done, and 100 % means the material is actually submitted.",
        },
        {
          sv: "Inskicket kräver en bekräftelse, och kvittot berättar vad som händer härnäst.",
          en: "Submitting asks for confirmation, and the receipt explains what happens next.",
        },
        {
          sv: "Datakategorier visar \"Metod vald — väntar på fil\" tills data finns, och Ångra kräver bekräftelse.",
          en: "Data categories show \"Method chosen — awaiting file\" until data exists, and Undo asks for confirmation.",
        },
        {
          sv: "Rättat: metodkortet kunde visa fel val efter Ångra + Hoppa över.",
          en: "Fixed: the method card could show the wrong choice after Undo + Skip.",
        },
      ],
    },
  },
  {
    version: "0.1.0",
    date: "2026-08-30",
    notes: {
      title: {
        sv: "Första versionen av portalen",
        en: "First version of the portal",
      },
      items: [
        {
          sv: "Hela förberedelseflödet: företagsuppgifter, verksamhet, superanvändare, webbinarier och ansvarsfördelning.",
          en: "The full preparation flow: company details, business profile, superusers, webinars and responsibility split.",
        },
        {
          sv: "Migrationsplan med metodval per datakategori.",
          en: "Migration plan with a method choice per data category.",
        },
        {
          sv: "Stöd för svenska och engelska.",
          en: "Support for Swedish and English.",
        },
        {
          sv: "Framsteg sparas — flera personer kan arbeta parallellt.",
          en: "Progress is saved — several people can work in parallel.",
        },
        {
          sv: "Sammanfattning av allt ni fyllt i visas på slutsteget innan ni skickar in.",
          en: "A summary of everything you entered is shown on the final step before you submit.",
        },
      ],
    },
  },
];

export const currentVersion = releases[0].version;
