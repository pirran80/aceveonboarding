"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/actions/case";
import { ACTIVE_LOCALES } from "@/lib/locale";

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("app");
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <div className="lang-switch" role="group" aria-label={t("languageSwitcher")}>
      {ACTIVE_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={l === locale}
          onClick={() =>
            startTransition(async () => {
              await setLocale(l);
              router.refresh();
            })
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
