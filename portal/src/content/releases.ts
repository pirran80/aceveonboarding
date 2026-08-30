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
