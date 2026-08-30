import type { FormField, StepDefinition } from "./schema";

/**
 * Validation for definition-driven form steps. Pure — runs on the client for
 * inline feedback and on the server as the guarantee (BUILD-SPEC §12: frontend
 * validation stops bad input early; backend validation guarantees integrity —
 * always both).
 *
 * Error values are i18n message keys (resolved in the UI), never display text.
 */

export type StepData = Record<string, unknown>;
export type FieldErrors = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateField(field: FormField, data: StepData, errors: FieldErrors): void {
  const value = data[field.id];

  if (field.required && isEmpty(value)) {
    errors[field.id] = "form.required";
    return;
  }
  if (isEmpty(value)) return;

  if (field.type === "email" && typeof value === "string" && !EMAIL_RE.test(value)) {
    errors[field.id] = "form.invalidEmail";
    return;
  }
  if (field.pattern && typeof value === "string" && !new RegExp(field.pattern).test(value)) {
    errors[field.id] = "form.invalidPattern";
    return;
  }

  // Conditional block: when a toggle is on, its conditional fields apply.
  if (field.type === "toggle" && value === true && field.conditionalFields) {
    for (const sub of field.conditionalFields.fields) {
      validateField(sub, data, errors);
    }
  }
}

/** Validate a `form` step's answers against its registry definition. */
export function validateFormStep(step: StepDefinition, data: StepData): FieldErrors {
  if (step.kind !== "form") return {};
  const errors: FieldErrors = {};
  for (const section of step.sections) {
    for (const field of section.fields) {
      validateField(field, data, errors);
    }
  }
  return errors;
}

/** A superuser row is valid with first name + last name + a well-formed email. */
export interface PersonRow {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

export function isValidPerson(p: PersonRow): boolean {
  return p.firstName.trim() !== "" && p.lastName.trim() !== "" && EMAIL_RE.test(p.email.trim());
}

export function countValidPeople(people: PersonRow[]): number {
  return people.filter(isValidPerson).length;
}
