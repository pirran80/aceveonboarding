import type { CaseView } from "./case";
import { parseStepData, latestDataSets, DONE_DATASET_STATUSES } from "./case";
import { lt } from "./locale";
import type { FormField } from "./registry/schema";

/**
 * The end-of-flow summary: everything the customer has entered, generated
 * from the registry definitions + saved answers — never from a hardcoded
 * field list (hard rule 1). New registry fields appear here automatically.
 *
 * `t` resolves UI-chrome keys (yes/no, statuses, methods); registry content
 * resolves through its own per-language text.
 */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface SummaryRow {
  label: string;
  value: string;
}

export interface SummarySection {
  id: string;
  title: string;
  complete: boolean;
  rows: SummaryRow[];
}

function formatFieldValue(
  field: FormField,
  value: unknown,
  locale: string,
  t: Translate
): string | null {
  if (value === undefined || value === null || value === "") return null;

  switch (field.type) {
    case "select": {
      const option = field.options?.find((o) => o.value === value);
      return option ? lt(option.label, locale) : String(value);
    }
    case "chips": {
      if (!Array.isArray(value) || value.length === 0) return null;
      return value
        .map((v) => {
          const option = field.options?.find((o) => o.value === v);
          return option ? lt(option.label, locale) : String(v);
        })
        .join(", ");
    }
    case "toggle":
      return t(value === true ? "summary.yes" : "summary.no");
    default:
      return String(value);
  }
}

function formFieldRows(
  fields: FormField[],
  data: Record<string, unknown>,
  locale: string,
  t: Translate
): SummaryRow[] {
  const rows: SummaryRow[] = [];
  for (const field of fields) {
    const value = formatFieldValue(field, data[field.id], locale, t);
    if (value === null) {
      // Required-but-missing is worth surfacing; empty optional fields are not.
      if (field.required) rows.push({ label: lt(field.label, locale), value: t("summary.notProvided") });
      continue;
    }
    rows.push({ label: lt(field.label, locale), value });
    if (field.type === "toggle" && data[field.id] === true && field.conditionalFields) {
      rows.push(...formFieldRows(field.conditionalFields.fields, data, locale, t));
    }
  }
  return rows;
}

export function buildSummary(view: CaseView, locale: string, t: Translate): SummarySection[] {
  const { registry, journey } = view;
  const sections: SummarySection[] = [];

  const stepData = (stepId: string): Record<string, unknown> => {
    const instance = view.case.steps.find((s) => s.stepId === stepId);
    return instance ? parseStepData(instance.dataJson) : {};
  };
  const isComplete = (itemId: string): boolean =>
    journey.items.find((i) => i.id === itemId)?.complete ?? false;

  for (const step of registry.flow.steps) {
    switch (step.kind) {
      case "form": {
        const data = stepData(step.id);
        sections.push({
          id: step.id,
          title: lt(step.name, locale),
          complete: isComplete(step.id),
          rows: step.sections.flatMap((s) => formFieldRows(s.fields, data, locale, t)),
        });
        break;
      }

      case "people": {
        sections.push({
          id: step.id,
          title: lt(step.name, locale),
          complete: isComplete(step.id),
          rows: view.case.users.map((u) => ({
            label: `${u.firstName} ${u.lastName}`.trim() || u.email,
            value: [u.email, u.role].filter(Boolean).join(" · ") || t("summary.notProvided"),
          })),
        });
        break;
      }

      case "webinars": {
        const checks = (stepData(step.id).checks ?? {}) as Record<string, boolean>;
        sections.push({
          id: step.id,
          title: lt(step.name, locale),
          complete: isComplete(step.id),
          rows: view.case.users.map((u) => {
            const done = step.webinars.filter((w) => checks[`${u.id}:${w.id}`]).length;
            return {
              label: `${u.firstName} ${u.lastName}`.trim() || u.email,
              value: t("summary.webinarsBooked", { done, total: step.webinars.length }),
            };
          }),
        });
        break;
      }

      case "consents": {
        const checked = (stepData(step.id).checked ?? {}) as Record<string, boolean>;
        sections.push({
          id: step.id,
          title: lt(step.name, locale),
          complete: isComplete(step.id),
          rows: step.consents.map((c) => ({
            label: lt(c.label, locale),
            value: t(checked[c.id] === true ? "summary.confirmed" : "summary.notConfirmed"),
          })),
        });
        break;
      }

      case "migration-plan": {
        const dataSets = latestDataSets(view);
        sections.push({
          id: step.id,
          title: lt(step.name, locale),
          complete: isComplete(step.id),
          rows: registry.flowModules.map((mod) => {
            if (view.integrationSourcedModuleIds.has(mod.id)) {
              return { label: lt(mod.name, locale), value: t("migrationPlan.viaIntegration") };
            }
            const ds = dataSets.get(mod.id);
            const parts: string[] = [];
            parts.push(ds?.method ? t(`methods.${ds.method}`) : t("summary.noMethod"));
            if (ds?.assignee) {
              const name =
                `${ds.assignee.firstName} ${ds.assignee.lastName}`.trim() || ds.assignee.email;
              parts.push(name);
            }
            const done =
              !!ds && (DONE_DATASET_STATUSES as readonly string[]).includes(ds.status);
            parts.push(
              done
                ? t(ds.status === "skipped" ? "status.skipped" : "status.complete")
                : ds?.method && ds.method !== "skip"
                  ? t("category.methodChosen")
                  : t("status.notStarted")
            );
            return { label: lt(mod.name, locale), value: parts.join(" · ") };
          }),
        });
        break;
      }

      // info + finish steps carry no answers to summarise
      case "info":
      case "finish":
        break;
    }
  }

  return sections;
}
