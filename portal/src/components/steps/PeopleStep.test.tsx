import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { PeopleStep } from "./PeopleStep";
import sv from "@/messages/sv.json";

// Server actions touch the database — mocked here; their logic is covered by
// the validate/flow unit tests.
vi.mock("@/actions/case", () => ({
  savePeople: vi.fn(async () => ({ ok: true })),
}));

function renderStep(initialPeople: { firstName: string; lastName: string; email: string; role?: string }[] = []) {
  return render(
    <NextIntlClientProvider locale="sv" messages={sv}>
      <PeopleStep caseId="c1" stepId="superanvandare" minValid={2} initialPeople={initialPeople} />
    </NextIntlClientProvider>
  );
}

describe("PeopleStep", () => {
  it("shows the live validity counter ('minst 2 krävs')", () => {
    renderStep([{ firstName: "Anna", lastName: "Svensson", email: "anna@example.com" }]);
    expect(screen.getByText("1 giltig · minst 2 krävs")).toBeInTheDocument();
  });

  it("updates the counter as a person becomes valid", async () => {
    const user = userEvent.setup();
    renderStep([{ firstName: "Anna", lastName: "Svensson", email: "anna@example.com" }]);

    await user.click(screen.getByRole("button", { name: "+ Lägg till person" }));
    const firstNames = screen.getAllByLabelText("Förnamn");
    const lastNames = screen.getAllByLabelText("Efternamn");
    const emails = screen.getAllByLabelText("E-post");

    await user.type(firstNames[1], "Bo");
    await user.type(lastNames[1], "Nilsson");
    await user.type(emails[1], "bo@example.com");

    expect(screen.getByText("2 giltiga · minst 2 krävs")).toBeInTheDocument();
  });

  it("removes a row", async () => {
    const user = userEvent.setup();
    renderStep([
      { firstName: "Anna", lastName: "Svensson", email: "anna@example.com" },
      { firstName: "Bo", lastName: "Nilsson", email: "bo@example.com" },
    ]);
    expect(screen.getByText("2 giltiga · minst 2 krävs")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Ta bort" })[0]);
    expect(screen.getByText("1 giltig · minst 2 krävs")).toBeInTheDocument();
  });
});
