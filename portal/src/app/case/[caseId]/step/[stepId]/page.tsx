import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getCaseView, parseStepData, latestDataSets } from "@/lib/case";
import { lt } from "@/lib/locale";
import { itemHref } from "@/lib/urls";
import { resolveField } from "@/lib/resolve";
import { buildSummary } from "@/lib/summary";
import { StepShell } from "@/components/StepShell";
import { SummaryView } from "@/components/SummaryView";
import { WelcomeStep } from "@/components/steps/WelcomeStep";
import { FormStep } from "@/components/steps/FormStep";
import { PeopleStep } from "@/components/steps/PeopleStep";
import { WebinarsStep } from "@/components/steps/WebinarsStep";
import { ConsentsStep } from "@/components/steps/ConsentsStep";
import { MigrationPlanStep } from "@/components/steps/MigrationPlanStep";
import { FinishStep } from "@/components/steps/FinishStep";

export default async function StepPage({
  params,
}: {
  params: Promise<{ caseId: string; stepId: string }>;
}) {
  const { caseId, stepId } = await params;
  const view = await getCaseView(caseId);
  if (!view) notFound();
  const locale = await getLocale();

  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step) notFound();

  const item = view.journey.items.find((i) => i.kind === "step" && i.id === stepId)!;
  if (item.state === "locked") redirect(`/case/${caseId}`);

  const itemIndex = view.journey.items.indexOf(item);
  const next = view.journey.items[itemIndex + 1];
  const nextHref = next && next.state !== "locked" ? itemHref(caseId, next) : null;

  const instance = view.case.steps.find((s) => s.stepId === stepId);
  const data = instance ? parseStepData(instance.dataJson) : {};

  const shell = (children: React.ReactNode) => (
    <StepShell
      title={lt(step.name, locale)}
      subtitle={lt(step.subtitle, locale)}
      state={item.state}
      nextHref={nextHref}
    >
      {children}
    </StepShell>
  );

  switch (step.kind) {
    case "info": {
      const entryNotice = lt(view.registry.flow.entryNotice.label, locale).replace(
        "{productName}",
        view.registry.flow.productName
      );
      return shell(
        <WelcomeStep
          caseId={caseId}
          cards={step.cards.map((c) => ({
            title: lt(c.title, locale),
            body: lt(c.body, locale),
          }))}
          entryNotice={entryNotice}
          confirmed={view.case.agreementConfirmedAt !== null}
        />
      );
    }

    case "form": {
      // Prefilled ≠ empty: seeded fields arrive as confirmed values to review
      // (DESIGN-BRIEF §4.4). Today the seed is the organisation record; the
      // Salesforce adapter replaces this source when the pattern lands (Q4).
      const org = view.case.organisation;
      const seedValues: Record<string, unknown> = {
        legalName: org.legalName,
        orgNumber: org.orgNumber ?? undefined,
        invoiceAddress: org.invoiceAddress ?? undefined,
        country: org.country,
        language: org.language,
        prefix: org.prefix ?? undefined,
      };
      // R2: the badge names Salesforce internally, but the system name must
      // not face customers. PORTAL_AUDIENCE=customer switches the wording
      // (final customer copy is Carl's call).
      const t = await getTranslations();
      const seededBadge = t(
        process.env.PORTAL_AUDIENCE === "customer" ? "form.seededCustomer" : "form.seeded"
      );
      return shell(
        <FormStep
          caseId={caseId}
          stepId={step.id}
          seededBadge={seededBadge}
          sections={step.sections.map((s) => ({
            title: lt(s.title, locale),
            fields: s.fields.map((f) => resolveField(f, locale)),
          }))}
          initialData={{ ...seedValues, ...data }}
          seededFieldIds={step.sections
            .flatMap((s) => s.fields)
            .filter((f) => f.seededFrom === "salesforce" && seedValues[f.id] !== undefined)
            .map((f) => f.id)}
          completed={item.complete}
        />
      );
    }

    case "people":
      return shell(
        <PeopleStep
          caseId={caseId}
          stepId={step.id}
          minValid={step.minValid}
          initialPeople={view.case.users.map((u) => ({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
          }))}
        />
      );

    case "webinars": {
      const checks = (data.checks ?? {}) as Record<string, boolean>;
      const peopleStep = view.registry.flow.steps.find((s) => s.kind === "people");
      const minValid = peopleStep?.kind === "people" ? peopleStep.minValid : 2;
      return shell(
        <WebinarsStep
          caseId={caseId}
          stepId={step.id}
          webinars={step.webinars.map((w) => ({
            id: w.id,
            name: lt(w.name, locale),
            href: w.href ?? null,
          }))}
          users={view.case.users.map((u) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim() || u.email,
          }))}
          initialChecks={checks}
          minValid={minValid}
        />
      );
    }

    case "consents": {
      const checked = (data.checked ?? {}) as Record<string, boolean>;
      return shell(
        <ConsentsStep
          caseId={caseId}
          stepId={step.id}
          document={
            step.document
              ? { label: lt(step.document.label, locale), href: step.document.href }
              : null
          }
          consents={step.consents.map((c) => ({
            id: c.id,
            group: c.group,
            label: lt(c.label, locale),
          }))}
          initialChecked={checked}
        />
      );
    }

    case "migration-plan": {
      const acks = (data.acks ?? {}) as Record<string, boolean>;
      const dataSets = latestDataSets(view);
      return shell(
        <MigrationPlanStep
          caseId={caseId}
          stepId={step.id}
          acknowledgements={step.acknowledgements.map((a) => ({
            id: a.id,
            label: lt(a.label, locale),
          }))}
          initialAcks={acks}
          rows={view.registry.flowModules.map((m) => {
            const ds = dataSets.get(m.id);
            return {
              moduleId: m.id,
              name: lt(m.name, locale),
              requiredLevel: m.requiredLevel,
              methods: [...m.methods.filter((x) => x !== "skip"), "skip"],
              currentMethod: ds?.method ?? null,
              assigneeId: ds?.assigneeId ?? null,
              integrationSourced: view.integrationSourcedModuleIds.has(m.id),
            };
          })}
          users={view.case.users.map((u) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim() || u.email,
          }))}
        />
      );
    }

    case "finish": {
      const t = await getTranslations();
      const sections = buildSummary(view, locale, (key, values) => t(key, values));
      const submitted = view.case.status === "submitted";
      return shell(
        <>
          <FinishStep
            caseId={caseId}
            unlocked={view.journey.finishUnlocked}
            submitted={submitted}
            submittedAt={view.case.submittedAt?.toISOString() ?? null}
            outstanding={view.journey.outstanding.map((o) => lt(o.name, locale))}
          />
          <SummaryView caseId={caseId} sections={sections} editable={!submitted} />
        </>
      );
    }
  }
}
