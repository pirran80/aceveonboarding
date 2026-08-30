import type { LocalizedText } from "./registry/schema";

/**
 * Portal languages. Design principle 8: multi-language from day one — the
 * registry and message-key structure carry all 8; sv + en have translated
 * content today, the rest fall back to sv until translated.
 */
export const ACTIVE_LOCALES = ["sv", "en"] as const;
export const ALL_LOCALES = ["sv", "en", "no", "da", "fi", "nl", "de", "fr"] as const;

export type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

export const DEFAULT_LOCALE: ActiveLocale = "sv";
export const LOCALE_COOKIE = "aceve-onboard-locale";

export function isActiveLocale(value: string | undefined): value is ActiveLocale {
  return !!value && (ACTIVE_LOCALES as readonly string[]).includes(value);
}

/** Resolve a registry LocalizedText for a locale, falling back to Swedish. */
export function lt(text: LocalizedText, locale: string): string {
  return text[locale] ?? text[DEFAULT_LOCALE] ?? Object.values(text)[0] ?? "";
}
