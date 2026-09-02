import { describe, expect, it } from "vitest";
import { buildSummary, type Translate } from "./summary";
import { buildJourney } from "./registry/flow";
import { loadRegistry } from "./registry/load";
import type { CaseView } from "./case";

/**
 * buildSummary is pure over the case view — tested against the real registry
 * with a synthetic case, so a registry change that breaks the summary fails
 * here first.
 */

const registry = loadRegistry("next-project");

// Echo translator: returns the key (plus values), so assertions can target keys.
const t: Translate = (key, values) =>
  values ? `${key}(${Object.values(values).join("/")})` : key;

function makeView(overrides: {
  users?: { id: string; firstName: string; lastName: string; email: string; role: string }[];
  steps?: { stepId: string; dataJson: string; completedAt: Date | null }[];
  dataSets?: {
    moduleId: string;
    method: string | null;
    status: string;
    version: number;
    assigneeId: string | null;
    assignee: { firstName: string; lastName: string; email: string } | null;
  }[];
}): CaseView {
  const users = overrides.users ?? [];
  const steps = overrides.steps ?? [];
  const dataSets = overrides.dataSets ?? [];

  const journey = buildJourney(registry, {
    agreementConfirmed: true,
    submitted: false,
    completedStepIds: new Set(steps.filter((s) => s.completedAt).map((s) => s.stepId)),
    completedModuleIds: new Set(
      dataSets
        .filter((d) => ["submitted", "skipped"].includes(d.status))
        .map((d) => d.moduleId)
    ),
  });

  // Only the fields buildSummary reads are populated; the rest is irrelevant here.
  return {
    case: { users, steps, dataSets } as unknown as CaseView["case"],
    registry,
    journey,
    integrationSourcedModuleIds: new Set<string>(),
  };
}

describe("buildSummary", () => {
  it("renders form answers with resolved option labels and skips empty optionals", () => {
    const view = makeView({
      steps: [
        {
          stepId: "foretagsuppgifter",
          completedAt: new Date(),
          dataJson: JSON.stringify({
            legalName: "Demo Bygg AB",
            prefix: "DEMO",
            orgNumber: "556000-0000",
            country: "SE",
            language: "sv",
          }),
        },
      ],
    });
    const section = buildSummary(view, "sv", t).find((s) => s.id === "foretagsuppgifter")!;
    expect(section.complete).toBe(true);
    const byLabel = Object.fromEntries(section.rows.map((r) => [r.label, r.value]));
    expect(byLabel["Juridiskt företagsnamn"]).toBe("Demo Bygg AB");
    expect(byLabel["Land"]).toBe("Sverige"); // option value resolved to label
    // Empty optional field (Fakturaadress) is not listed.
    expect(byLabel["Fakturaadress"]).toBeUndefined();
  });

  it("marks required-but-missing answers as not provided", () => {
    const view = makeView({
      steps: [
        { stepId: "foretagsuppgifter", completedAt: null, dataJson: JSON.stringify({}) },
      ],
    });
    const section = buildSummary(view, "sv", t).find((s) => s.id === "foretagsuppgifter")!;
    expect(section.complete).toBe(false);
    const legal = section.rows.find((r) => r.label === "Juridiskt företagsnamn")!;
    expect(legal.value).toBe("summary.notProvided");
  });

  it("includes conditional toggle fields only when the toggle is on", () => {
    const on = makeView({
      steps: [
        {
          stepId: "verksamhet",
          completedAt: null,
          dataJson: JSON.stringify({ fromBso: true, itContactName: "Kim IT" }),
        },
      ],
    });
    const rowsOn = buildSummary(on, "sv", t).find((s) => s.id === "verksamhet")!.rows;
    expect(rowsOn.some((r) => r.label === "Namn" && r.value === "Kim IT")).toBe(true);

    const off = makeView({
      steps: [
        { stepId: "verksamhet", completedAt: null, dataJson: JSON.stringify({ fromBso: false }) },
      ],
    });
    const rowsOff = buildSummary(off, "sv", t).find((s) => s.id === "verksamhet")!.rows;
    expect(rowsOff.some((r) => r.label === "Namn")).toBe(false);
  });

  it("summarises people, webinar bookings and migration-plan methods", () => {
    const anna = { id: "u1", firstName: "Anna", lastName: "Svensson", email: "anna@example.com", role: "Ekonomi" };
    const view = makeView({
      users: [anna],
      steps: [
        {
          stepId: "webbinarier",
          completedAt: null,
          dataJson: JSON.stringify({ checks: { "u1:ny-i-next": true } }),
        },
      ],
      dataSets: [
        {
          moduleId: "kontoplan",
          method: "excel",
          status: "submitted",
          version: 1,
          assigneeId: "u1",
          assignee: anna,
        },
      ],
    });
    const sections = buildSummary(view, "sv", t);

    const people = sections.find((s) => s.id === "superanvandare")!;
    expect(people.rows[0]).toEqual({ label: "Anna Svensson", value: "anna@example.com · Ekonomi" });

    const webinars = sections.find((s) => s.id === "webbinarier")!;
    expect(webinars.rows[0].value).toBe("summary.webinarsBooked(1/3)");

    const plan = sections.find((s) => s.id === "migrationsplan")!;
    const kontoplan = plan.rows.find((r) => r.label === "Kontoplan")!;
    expect(kontoplan.value).toBe("methods.excel · Anna Svensson · status.complete");
    const unplanned = plan.rows.find((r) => r.label === "Timpriser & roller")!;
    expect(unplanned.value).toBe("summary.noMethod · status.notStarted");
  });
});
