import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getCaseView } from "@/lib/case";
import { lt } from "@/lib/locale";
import { itemHref } from "@/lib/urls";
import { currentVersion } from "@/content/releases";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const view = await getCaseView(caseId);
  if (!view) notFound();

  const t = await getTranslations();
  const locale = await getLocale();
  const { journey, registry } = view;

  const phaseNames = new Map(registry.flow.phases.map((p) => [p.id, p.name]));

  // Group journey items by phase, preserving order.
  const groups: { phase: string; items: typeof journey.items }[] = [];
  for (const item of journey.items) {
    const last = groups[groups.length - 1];
    if (last && last.phase === item.phase) last.items.push(item);
    else groups.push({ phase: item.phase, items: [item] });
  }

  let counter = 0;

  return (
    <div className="shell">
      <nav className="sidebar" aria-label={t("app.name")}>
        <div className="side-brand">
          <Link href="/" className="wordmark">
            Aceve
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="side-progress">
          <div
            className="bar"
            role="progressbar"
            aria-valuenow={journey.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${journey.progressPercent}%` }} />
          </div>
          <div className="label">
            {t("sidebar.progress", { percent: journey.progressPercent })} ·{" "}
            {t("sidebar.steps", {
              done: journey.stepsDone,
              total: journey.stepsTotal,
            })}
          </div>
        </div>

        {groups.map((group) => (
          <div className="side-group" key={group.phase + group.items[0]?.id}>
            <div className="side-group-h">
              {lt(phaseNames.get(group.phase) ?? { sv: group.phase }, locale)}
            </div>
            {group.items.map((item) => {
              counter += 1;
              const inner = (
                <>
                  <span className="marker" aria-hidden="true">
                    {item.complete ? "✓" : counter}
                  </span>
                  <span className="titles">
                    <span className="t">{lt(item.name, locale)}</span>
                    <span className="d" style={{ display: "block" }}>
                      {item.kind === "category"
                        ? t("sidebar.importStep")
                        : lt(item.shortDescription, locale)}
                    </span>
                  </span>
                </>
              );
              return item.state === "locked" ? (
                <div className="side-item" data-state="locked" key={item.id} aria-disabled="true">
                  {inner}
                </div>
              ) : (
                <Link
                  className="side-item"
                  data-state={item.state}
                  key={item.id}
                  href={itemHref(caseId, item)}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        ))}

        <p className="version-footer">
          {t("app.version", { version: currentVersion })} ·{" "}
          <Link href="/whats-new">{t("app.whatsNew")}</Link>
        </p>
      </nav>

      <main className="main">{children}</main>
    </div>
  );
}
