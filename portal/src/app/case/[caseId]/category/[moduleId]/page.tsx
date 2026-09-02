import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getCaseView, latestDataSets } from "@/lib/case";
import { categoryItemId } from "@/lib/registry/flow";
import { lt } from "@/lib/locale";
import { itemHref } from "@/lib/urls";
import { StepShell } from "@/components/StepShell";
import { CategoryStep } from "@/components/steps/CategoryStep";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ caseId: string; moduleId: string }>;
}) {
  const { caseId, moduleId } = await params;
  const view = await getCaseView(caseId);
  if (!view) notFound();
  const locale = await getLocale();

  const mod = view.registry.modules.get(moduleId);
  if (!mod) notFound();

  const item = view.journey.items.find((i) => i.id === categoryItemId(moduleId));
  if (!item) notFound();
  if (item.state === "locked") redirect(`/case/${caseId}`);

  const itemIndex = view.journey.items.indexOf(item);
  const next = view.journey.items[itemIndex + 1];
  const nextHref = next && next.state !== "locked" ? itemHref(caseId, next) : null;

  const ds = latestDataSets(view).get(moduleId);

  // Resolved to an integration source by a kartläggning answer (R10):
  // no upload, no method choice — the category has left the manual flow.
  if (view.integrationSourcedModuleIds.has(moduleId)) {
    const t = await getTranslations();
    return (
      <StepShell
        title={lt(mod.name, locale)}
        subtitle={lt(mod.description, locale)}
        state={item.state}
        nextHref={nextHref}
      >
        <div className="card">
          <span className="pill" data-tone="ok">
            {t("migrationPlan.viaIntegration")}
          </span>
          <p>{t("category.integrationSourced")}</p>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell
      title={lt(mod.name, locale)}
      subtitle={lt(mod.description, locale)}
      state={item.state}
      nextHref={nextHref}
    >
      <CategoryStep
        caseId={caseId}
        moduleId={moduleId}
        sheetName={mod.sheetName}
        methods={[...mod.methods.filter((m) => m !== "skip"), "skip"]}
        currentMethod={ds?.method ?? null}
        status={ds?.status ?? "not_started"}
        version={ds?.version ?? 1}
        assigneeName={
          ds?.assignee
            ? `${ds.assignee.firstName} ${ds.assignee.lastName}`.trim() || ds.assignee.email
            : null
        }
        fields={mod.fields.map((f) => ({
          id: f.id,
          label: lt(f.label, locale),
          required: f.required,
        }))}
      />
    </StepShell>
  );
}
