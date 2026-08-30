import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { releases } from "@/content/releases";
import { lt } from "@/lib/locale";

export default async function WhatsNewPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <main className="main" style={{ margin: "0 auto" }}>
      <div className="step-head">
        <h1>{t("whatsNew.title")}</h1>
        <p className="subtitle">{t("whatsNew.intro")}</p>
      </div>

      {releases.map((r) => (
        <section className="release" key={r.version}>
          <div className="rel-meta">
            {t("app.version", { version: r.version })} · {r.date}
          </div>
          <h2 style={{ fontSize: "1.15rem", margin: "0.25rem 0 0.5rem" }}>
            {lt(r.notes.title, locale)}
          </h2>
          <ul>
            {r.notes.items.map((item, i) => (
              <li key={i}>{lt(item, locale)}</li>
            ))}
          </ul>
        </section>
      ))}

      <Link href="/" className="btn-ghost btn">
        ← Aceve Onboard
      </Link>
    </main>
  );
}
