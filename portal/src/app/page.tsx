import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { loadRegistry } from "@/lib/registry/load";
import { lt } from "@/lib/locale";
import { currentVersion } from "@/content/releases";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function Home() {
  const t = await getTranslations();
  const locale = await getLocale();

  // Demo entry point until external identity lands (STATUS.md Q2):
  // list the seeded cases instead of a login.
  const cases = await prisma.onboardingCase.findMany({
    include: { organisation: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="main" style={{ margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <LanguageSwitcher />
      </div>
      <div className="home-hero">
        <h1>{t("app.name")}</h1>
        <p>{t("app.tagline")}</p>
      </div>

      <p className="note">{t("home.demoNote")}</p>

      <div style={{ marginTop: "1.5rem" }}>
        {cases.map((c) => {
          const registry = loadRegistry(c.registryFlow);
          return (
            <div className="card" key={c.id}>
              <h3>{c.organisation.legalName}</h3>
              <p style={{ color: "var(--muted)", marginTop: 0 }}>
                {registry.flow.productName} · {c.organisation.country} ·{" "}
                {lt(
                  registry.flow.phases.find((p) => p.id === "preparation")!.name,
                  locale
                )}
              </p>
              <Link className="btn" href={`/case/${c.id}`}>
                {t("home.openCase")}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="version-footer">
        {t("app.version", { version: currentVersion })} ·{" "}
        <Link href="/whats-new">{t("app.whatsNew")}</Link>
      </p>
    </main>
  );
}
