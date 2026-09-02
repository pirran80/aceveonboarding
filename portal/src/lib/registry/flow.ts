import type { FlowDefinition, LocalizedText } from "./schema";
import type { ProductRegistry } from "./load";

/**
 * Pure journey logic: which items exist, in which order, what is unlocked,
 * and how far along the case is. No I/O, no framework — unit-tested directly.
 *
 * Validated interaction patterns this implements (DESIGN-BRIEF §4):
 *  - Agreement gate before everything.
 *  - Sequential unlock with visible lock states (complete|active|available|locked).
 *  - Progress = % of gated items complete (Prototype A model).
 *  - The finish step, when locked, lists exactly what is outstanding by name.
 */

export type JourneyItemState = "complete" | "active" | "available" | "locked";

export interface JourneyItem {
  /** Step id, or `cat:<moduleId>` for a data category. */
  id: string;
  kind: "step" | "category";
  /** For categories: the module-registry id. */
  moduleId?: string;
  /** Phase id from the registry; "finish" is the one conventional id. */
  phase: string;
  gated: boolean;
  /** false: gates the finish but never locks the steps after it (R7). */
  blocking: boolean;
  /** Category sourced from an integration per a kartläggning answer (R10). */
  integrationSourced?: boolean;
  name: LocalizedText;
  shortDescription: LocalizedText;
  complete: boolean;
  state: JourneyItemState;
}

export interface CaseProgressInput {
  agreementConfirmed: boolean;
  /** The case has been submitted (finish step performed). */
  submitted: boolean;
  completedStepIds: ReadonlySet<string>;
  /** Modules whose DataSet has reached submitted/approved/imported/skipped. */
  completedModuleIds: ReadonlySet<string>;
  /**
   * Modules resolved to an integration source by kartläggning answers
   * (see integrationSourcedModules) — they leave the manual flow (R7/R10).
   */
  integrationSourcedModuleIds?: ReadonlySet<string>;
}

/**
 * Evaluate the flow's categoryEffects against saved step answers: which
 * modules are sourced from an integration instead of a customer upload.
 * Pure and re-evaluated per request, so changing a kartläggning answer
 * immediately restores or removes the category in the plan.
 */
export function integrationSourcedModules(
  flow: FlowDefinition,
  stepData: (stepId: string) => Record<string, unknown>
): Set<string> {
  const out = new Set<string>();
  for (const effect of flow.categoryEffects) {
    if (stepData(effect.when.stepId)[effect.when.fieldId] === effect.when.equals) {
      out.add(effect.then.moduleId);
    }
  }
  return out;
}

export interface Journey {
  items: JourneyItem[];
  /**
   * 0–100 over gated items PLUS the finish step — 100 % means submitted,
   * never "everything except the submission" (review finding P0-6).
   */
  progressPercent: number;
  /** Counted the same way as progressPercent: gated items + the finish step. */
  stepsDone: number;
  stepsTotal: number;
  /** Gated, not-yet-complete items — what the locked finish screen lists. */
  outstanding: JourneyItem[];
  finishUnlocked: boolean;
}

export function categoryItemId(moduleId: string): string {
  return `cat:${moduleId}`;
}

export function buildJourney(registry: ProductRegistry, input: CaseProgressInput): Journey {
  const { flow, flowModules } = registry;
  const integrationSourced = input.integrationSourcedModuleIds ?? new Set<string>();

  // Assemble the ordered item list: registry steps, with data categories
  // spliced in after the migration-plan step (the pivot into Phase 2).
  const items: JourneyItem[] = [];
  for (const step of flow.steps) {
    items.push({
      id: step.id,
      kind: "step",
      phase: step.phase,
      gated: step.gated,
      blocking: step.blocking,
      name: step.name,
      shortDescription: step.shortDescription,
      complete:
        step.kind === "finish" ? input.submitted : input.completedStepIds.has(step.id),
      state: "locked",
    });
    if (step.kind === "migration-plan") {
      for (const mod of flowModules) {
        const viaIntegration = integrationSourced.has(mod.id);
        items.push({
          id: categoryItemId(mod.id),
          kind: "category",
          moduleId: mod.id,
          phase: step.phase,
          // Every listed category gates the finish — skipping ("done manually
          // after go-live") is a first-class choice that marks it complete,
          // and an integration-sourced category leaves the manual flow (R10).
          gated: true,
          blocking: true,
          integrationSourced: viaIntegration || undefined,
          name: mod.name,
          shortDescription: mod.description,
          complete: viaIntegration || input.completedModuleIds.has(mod.id),
          state: "locked",
        });
      }
    }
  }

  // Sequential unlock. An item is reachable when the agreement is confirmed
  // and every *gated* item before it is complete. The first reachable,
  // incomplete item is "active" — the one obvious next step.
  let blocked = false;
  let activeAssigned = false;
  for (const item of items) {
    if (item.kind === "step" && item.id === flow.steps[0]?.id) {
      // The first step (welcome/agreement) is always reachable.
      item.state = item.complete ? "complete" : "active";
      activeAssigned = activeAssigned || !item.complete;
      if (!input.agreementConfirmed) blocked = true;
      continue;
    }

    if (item.complete) {
      item.state = "complete";
      continue;
    }
    if (blocked) {
      item.state = "locked";
      continue;
    }
    if (!activeAssigned) {
      item.state = "active";
      activeAssigned = true;
    } else {
      item.state = "available";
    }
    // A non-blocking step (Kartläggning, R7) still gates the finish but never
    // locks the work after it — the customer proceeds in parallel.
    if (item.gated && item.blocking) blocked = true;
  }

  const gatedItems = items.filter((i) => i.gated);
  const completeGated = gatedItems.filter((i) => i.complete);

  // Progress counts the submission itself, so 100 % is only shown once the
  // material is actually sent (P0-6).
  const stepsTotal = gatedItems.length + 1;
  const stepsDone = completeGated.length + (input.submitted ? 1 : 0);
  const progressPercent =
    stepsTotal === 0 ? 0 : Math.round((stepsDone / stepsTotal) * 100);

  const outstanding = gatedItems.filter((i) => !i.complete);
  const finishUnlocked = input.agreementConfirmed && outstanding.length === 0;

  // The finish item itself reflects the gate.
  const finish = items.find((i) => i.phase === "finish");
  if (finish) {
    if (input.submitted) {
      finish.state = "complete";
    } else {
      finish.state = finishUnlocked ? "available" : "locked";
      if (finishUnlocked && !activeAssigned) finish.state = "active";
    }
  }

  return { items, progressPercent, stepsDone, stepsTotal, outstanding, finishUnlocked };
}
