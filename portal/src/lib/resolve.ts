import type { FormField } from "./registry/schema";
import { lt } from "./locale";

/**
 * Registry definitions carry text in every language; client components get a
 * pre-resolved, plain-string view for the current locale so the full registry
 * never ships to the browser.
 */

export interface ResolvedOption {
  value: string;
  label: string;
}

export interface ResolvedField {
  id: string;
  type: FormField["type"];
  required: boolean;
  label: string;
  seeded: boolean;
  pattern?: string;
  patternHint?: string;
  options?: ResolvedOption[];
  conditional?: { title: string; fields: ResolvedField[] };
}

export function resolveField(field: FormField, locale: string): ResolvedField {
  return {
    id: field.id,
    type: field.type,
    required: field.required,
    label: lt(field.label, locale),
    seeded: field.seededFrom === "salesforce",
    pattern: field.pattern,
    patternHint: field.patternHint ? lt(field.patternHint, locale) : undefined,
    options: field.options?.map((o) => ({ value: o.value, label: lt(o.label, locale) })),
    conditional: field.conditionalFields
      ? {
          title: lt(field.conditionalFields.title, locale),
          fields: field.conditionalFields.fields.map((f) => resolveField(f, locale)),
        }
      : undefined,
  };
}
