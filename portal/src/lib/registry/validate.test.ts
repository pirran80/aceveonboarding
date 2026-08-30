import { describe, expect, it } from "vitest";
import { countValidPeople, validateFormStep } from "./validate";
import { loadRegistry } from "./load";

const registry = loadRegistry("next-project");
const companyStep = registry.flow.steps.find((s) => s.id === "foretagsuppgifter")!;
const businessStep = registry.flow.steps.find((s) => s.id === "verksamhet")!;

describe("validateFormStep", () => {
  it("flags missing required fields with i18n keys", () => {
    const errors = validateFormStep(companyStep, {});
    expect(errors.legalName).toBe("form.required");
    expect(errors.orgNumber).toBe("form.required");
    // Optional field must not be flagged.
    expect(errors.invoiceAddress).toBeUndefined();
  });

  it("validates the org-number pattern as a soft format check", () => {
    const base = {
      legalName: "Demo AB",
      prefix: "DEMO",
      country: "SE",
      language: "sv",
    };
    expect(
      validateFormStep(companyStep, { ...base, orgNumber: "556000-0000" })
    ).toEqual({});
    expect(
      validateFormStep(companyStep, { ...base, orgNumber: "not-a-number" }).orgNumber
    ).toBe("form.invalidPattern");
  });

  it("requires conditional fields only when the source-system toggle is on", () => {
    const base = { workTypes: ["bygg"], reach: "local" };
    // Toggle off: no IT-contact requirement.
    expect(validateFormStep(businessStep, { ...base, fromBso: false })).toEqual({});
    // Toggle on: the BSO branch requires an IT contact (export is not self-service).
    const errors = validateFormStep(businessStep, { ...base, fromBso: true });
    expect(errors.itContactName).toBe("form.required");
    expect(errors.itContactEmail).toBe("form.required");
    expect(errors.itContactPhone).toBeUndefined();
    // Toggle on with a bad email.
    expect(
      validateFormStep(businessStep, {
        ...base,
        fromBso: true,
        itContactName: "Kim",
        itContactEmail: "not-an-email",
      }).itContactEmail
    ).toBe("form.invalidEmail");
  });
});

describe("countValidPeople", () => {
  it("counts rows with first + last name and a well-formed email", () => {
    expect(
      countValidPeople([
        { firstName: "Anna", lastName: "Svensson", email: "anna@example.com" },
        { firstName: "Bo", lastName: "", email: "bo@example.com" },
        { firstName: "Eva", lastName: "Karlsson", email: "eva@" },
      ])
    ).toBe(1);
  });
});
