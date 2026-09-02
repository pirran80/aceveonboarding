import { prisma } from "./db";
import { loadRegistry, type ProductRegistry } from "./registry/load";
import { buildJourney, integrationSourcedModules, type Journey } from "./registry/flow";
import type { Prisma } from "@prisma/client";

/** DataSet statuses that count a category as done for flow gating. */
export const DONE_DATASET_STATUSES = [
  "submitted",
  "customer_approved",
  "aceve_approved",
  "imported",
  "skipped",
] as const;

export type CaseWithRelations = Prisma.OnboardingCaseGetPayload<{
  include: {
    organisation: true;
    users: true;
    steps: true;
    dataSets: { include: { assignee: true } };
  };
}>;

export interface CaseView {
  case: CaseWithRelations;
  registry: ProductRegistry;
  journey: Journey;
  /** Modules sourced via integration per kartläggning answers (R7/R10). */
  integrationSourcedModuleIds: ReadonlySet<string>;
}

export async function getCaseView(caseId: string): Promise<CaseView | null> {
  const c = await prisma.onboardingCase.findUnique({
    where: { id: caseId },
    include: {
      organisation: true,
      users: { orderBy: { createdAt: "asc" } },
      steps: true,
      dataSets: { include: { assignee: true }, orderBy: { version: "desc" } },
    },
  });
  if (!c) return null;

  const registry = loadRegistry(c.registryFlow);

  const completedStepIds = new Set(
    c.steps.filter((s) => s.completedAt !== null).map((s) => s.stepId)
  );
  // Latest version per module decides the category's state.
  const latestByModule = new Map<string, (typeof c.dataSets)[number]>();
  for (const ds of c.dataSets) {
    if (!latestByModule.has(ds.moduleId)) latestByModule.set(ds.moduleId, ds);
  }
  const completedModuleIds = new Set(
    [...latestByModule.values()]
      .filter((ds) => (DONE_DATASET_STATUSES as readonly string[]).includes(ds.status))
      .map((ds) => ds.moduleId)
  );

  // Kartläggning answers steer the plan (R7/R10) — evaluated per request so
  // a changed answer immediately restores or removes categories.
  const integrationSourcedModuleIds = integrationSourcedModules(registry.flow, (stepId) => {
    const instance = c.steps.find((s) => s.stepId === stepId);
    return instance ? parseStepData(instance.dataJson) : {};
  });

  const journey = buildJourney(registry, {
    agreementConfirmed: c.agreementConfirmedAt !== null,
    submitted: c.status !== "active",
    completedStepIds,
    completedModuleIds,
    integrationSourcedModuleIds,
  });

  return { case: c, registry, journey, integrationSourcedModuleIds };
}

export function parseStepData(dataJson: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(dataJson);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Latest DataSet per module for a case (or undefined if none exists yet). */
export function latestDataSets(view: CaseView) {
  const map = new Map<string, CaseView["case"]["dataSets"][number]>();
  for (const ds of view.case.dataSets) {
    if (!map.has(ds.moduleId)) map.set(ds.moduleId, ds);
  }
  return map;
}
