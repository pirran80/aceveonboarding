import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { CategoryStep } from "./CategoryStep";
import sv from "@/messages/sv.json";

import { vi } from "vitest";

vi.mock("@/actions/case", () => ({
  setDataSetMethod: vi.fn(async () => ({ ok: true })),
  simulateImport: vi.fn(async () => ({ ok: true })),
  skipCategory: vi.fn(async () => ({ ok: true })),
  undoSkip: vi.fn(async () => ({ ok: true })),
}));

function renderStep(props: Partial<Parameters<typeof CategoryStep>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="sv" messages={sv}>
      <CategoryStep
        caseId="c1"
        moduleId="kontoplan"
        sheetName="Ev. kontoplan"
        methods={["gi-mall", "excel", "skip"]}
        currentMethod={null}
        status="not_started"
        version={1}
        assigneeName={null}
        fields={[{ id: "kontonr", label: "Kontonr", required: true }]}
        {...props}
      />
    </NextIntlClientProvider>
  );
}

describe("CategoryStep", () => {
  it("method selection follows server state — regression for P3-5 (stale card after undo+skip)", () => {
    // The server says no method is chosen: no card may render as pressed,
    // regardless of what was clicked in an earlier render.
    const { rerender } = renderStep({ currentMethod: "excel" });
    expect(screen.getByRole("button", { name: /Excel/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    rerender(
      <NextIntlClientProvider locale="sv" messages={sv}>
        <CategoryStep
          caseId="c1"
          moduleId="kontoplan"
          sheetName="Ev. kontoplan"
          methods={["gi-mall", "excel", "skip"]}
          currentMethod={null}
          status="not_started"
          version={1}
          assigneeName={null}
          fields={[{ id: "kontonr", label: "Kontonr", required: true }]}
        />
      </NextIntlClientProvider>
    );
    expect(screen.getByRole("button", { name: /Excel/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("shows 'method chosen — awaiting file' until data exists (D-2)", () => {
    renderStep({ currentMethod: "excel" });
    expect(screen.getByText("Metod vald — väntar på fil")).toBeInTheDocument();
  });

  it("asks for confirmation before undoing a completed category", async () => {
    const user = userEvent.setup();
    renderStep({ currentMethod: "skip", status: "skipped" });
    await user.click(screen.getByRole("button", { name: "Ångra" }));
    expect(screen.getByText("Detta nollställer kategorins status. Är ni säkra?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ja" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Avbryt" })).toBeInTheDocument();
  });
});
