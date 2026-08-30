import { describe, expect, it } from "vitest";
import { buildJourney, categoryItemId } from "./flow";
import { loadRegistry } from "./load";

const registry = loadRegistry("next-project");

const stepIds = registry.flow.steps.map((s) => s.id);
const gatedStepIds = registry.flow.steps.filter((s) => s.gated).map((s) => s.id);
const moduleIds = registry.flow.categories.moduleIds;

function journey(input: {
  agreementConfirmed?: boolean;
  submitted?: boolean;
  completedStepIds?: string[];
  completedModuleIds?: string[];
}) {
  return buildJourney(registry, {
    agreementConfirmed: input.agreementConfirmed ?? false,
    submitted: input.submitted ?? false,
    completedStepIds: new Set(input.completedStepIds ?? []),
    completedModuleIds: new Set(input.completedModuleIds ?? []),
  });
}

describe("buildJourney", () => {
  it("includes every step and every flow category", () => {
    const j = journey({});
    expect(j.items.filter((i) => i.kind === "step").map((i) => i.id)).toEqual(stepIds);
    expect(j.items.filter((i) => i.kind === "category").map((i) => i.moduleId)).toEqual(
      moduleIds
    );
  });

  it("locks everything behind the agreement gate", () => {
    const j = journey({ agreementConfirmed: false });
    const [first, ...rest] = j.items;
    expect(first.state).toBe("active");
    for (const item of rest) {
      expect(item.state, item.id).toBe("locked");
    }
  });

  it("unlocks sequentially: one active item, next steps locked behind gated work", () => {
    const j = journey({ agreementConfirmed: true, completedStepIds: [stepIds[0]] });
    const [first, second, third] = j.items;
    expect(first.state).toBe("complete");
    expect(second.state).toBe("active");
    expect(third.state).toBe("locked");
  });

  it("progress counts gated items plus the submission itself", () => {
    const empty = journey({ agreementConfirmed: true });
    expect(empty.progressPercent).toBe(0);

    // Denominator = gated items + the finish step (P0-6: 100 % means submitted).
    const total = gatedStepIds.length + moduleIds.length + 1;
    const one = journey({
      agreementConfirmed: true,
      completedStepIds: [stepIds[0], gatedStepIds[0]],
    });
    expect(one.progressPercent).toBe(Math.round((1 / total) * 100));
    expect(one.stepsDone).toBe(1);
    expect(one.stepsTotal).toBe(total);
    // The non-gated welcome step must not move progress.
    const welcomeOnly = journey({ agreementConfirmed: true, completedStepIds: [stepIds[0]] });
    expect(welcomeOnly.progressPercent).toBe(0);
  });

  it("keeps the finish locked and lists exactly what is outstanding by name", () => {
    const j = journey({
      agreementConfirmed: true,
      completedStepIds: [...stepIds.filter((id) => id !== "skicka-boka")],
      completedModuleIds: moduleIds.slice(1),
    });
    expect(j.finishUnlocked).toBe(false);
    expect(j.outstanding.map((o) => o.id)).toEqual([categoryItemId(moduleIds[0])]);
  });

  it("unlocks the finish when every gated item is complete — but 100 % requires submission", () => {
    const j = journey({
      agreementConfirmed: true,
      completedStepIds: [...stepIds.filter((id) => id !== "skicka-boka")],
      completedModuleIds: [...moduleIds],
    });
    expect(j.finishUnlocked).toBe(true);
    expect(j.items.find((i) => i.phase === "finish")?.state).not.toBe("locked");
    // Everything done but not yet submitted must NOT read 100 % (P0-6).
    expect(j.progressPercent).toBeLessThan(100);

    const submitted = journey({
      agreementConfirmed: true,
      submitted: true,
      completedStepIds: [...stepIds.filter((id) => id !== "skicka-boka")],
      completedModuleIds: [...moduleIds],
    });
    expect(submitted.progressPercent).toBe(100);
    expect(submitted.items.find((i) => i.phase === "finish")?.state).toBe("complete");
  });
});
