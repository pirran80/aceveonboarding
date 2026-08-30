import { z } from "zod";

/**
 * Zod schemas for the module + flow registry.
 *
 * Hard rule 1 (BUILD-SPEC §2): modules, fields, steps, ordering, validation,
 * dropdown values, aliases and copy are configuration — these schemas are the
 * contract that configuration must satisfy. Anything the registry fails to
 * express is a registry gap to fix, never something to hardcode in a component.
 */

/** Per-language text. sv/en populated today; keys ready for all 8 portal languages. */
export const localizedText = z
  .record(z.string(), z.string())
  .refine((v) => typeof v.sv === "string" && v.sv.length > 0, {
    message: "Localized text must at least carry 'sv'",
  });

export type LocalizedText = z.infer<typeof localizedText>;

// ---------------------------------------------------------------------------
// Module registry (data categories) — shape from BUILD-SPEC §5
// ---------------------------------------------------------------------------

export const moduleFieldSchema = z.object({
  id: z.string(),
  label: localizedText,
  sourceLabel: z.string().optional(),
  type: z.enum(["string", "email", "date", "category", "float"]),
  required: z.boolean(),
  acceptedValues: z.array(z.string()).default([]),
  aliases: z.array(z.string()).default([]),
  validations: z
    .array(z.object({ validate: z.string(), errorMessage: z.string().optional() }).loose())
    .default([]),
  // Hard rule 2: every field carries exactly one destination, resolved at go-live.
  destination: z.object({
    kind: z.enum(["ingestro-mapping", "product-api-field", "provisioning-parameter"]),
    ref: z.string(),
    status: z.string().optional(),
  }),
});

export const moduleSchema = z.object({
  id: z.string(),
  product: z.string(),
  country: z.string(),
  registryVersion: z.string(),
  order: z.number().int(),
  sheetName: z.string(),
  name: localizedText,
  description: localizedText,
  requiredLevel: z.enum(["required", "optional"]),
  methods: z.array(z.string()),
  ingestroIdentifier: z.string(),
  fields: z.array(moduleFieldSchema).min(1),
});

export const moduleRegistrySchema = z
  .object({
    $schema: z.string().optional(),
    modules: z.array(moduleSchema).min(1),
  })
  .loose();

export type ModuleField = z.infer<typeof moduleFieldSchema>;
export type ModuleDefinition = z.infer<typeof moduleSchema>;

// ---------------------------------------------------------------------------
// Flow registry (steps, phases, gates) — shape from CUSTOMER-FLOW.md
// ---------------------------------------------------------------------------

export const selectOptionSchema = z.object({
  value: z.string(),
  label: localizedText,
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "email", "number", "select", "chips", "toggle"]),
  required: z.boolean().default(false),
  label: localizedText,
  /** Salesforce-seeded fields render as confirmed values to review, not blanks. */
  seededFrom: z.enum(["salesforce"]).optional(),
  pattern: z.string().optional(),
  patternHint: localizedText.optional(),
  options: z.array(selectOptionSchema).optional(),
  conditionalFields: z
    .object({
      note: z.string().optional(),
      title: localizedText,
      get fields() {
        return z.array(formFieldSchema);
      },
    })
    .optional(),
});

export type FormField = z.infer<typeof formFieldSchema>;

export const formSectionSchema = z.object({
  title: localizedText,
  fields: z.array(formFieldSchema).min(1),
});

const stepBase = z.object({
  id: z.string(),
  phase: z.enum(["preparation", "migration", "finish"]),
  gated: z.boolean(),
  name: localizedText,
  shortDescription: localizedText,
  subtitle: localizedText,
  dependsOn: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export const stepSchema = z.discriminatedUnion("kind", [
  stepBase.extend({
    kind: z.literal("info"),
    cards: z.array(z.object({ title: localizedText, body: localizedText })),
  }),
  stepBase.extend({
    kind: z.literal("form"),
    sections: z.array(formSectionSchema).min(1),
  }),
  stepBase.extend({
    kind: z.literal("people"),
    minValid: z.number().int().min(1),
  }),
  stepBase.extend({
    kind: z.literal("webinars"),
    webinars: z.array(z.object({ id: z.string(), name: localizedText })).min(1),
  }),
  stepBase.extend({
    kind: z.literal("consents"),
    document: z.object({ label: localizedText, href: z.string() }).optional(),
    consents: z
      .array(z.object({ id: z.string(), group: z.string().nullable(), label: localizedText }))
      .min(1),
  }),
  stepBase.extend({
    kind: z.literal("migration-plan"),
    acknowledgements: z.array(z.object({ id: z.string(), label: localizedText })).default([]),
  }),
  stepBase.extend({
    kind: z.literal("finish"),
  }),
]);

export type StepDefinition = z.infer<typeof stepSchema>;

export const flowSchema = z
  .object({
    $schema: z.string().optional(),
    id: z.string(),
    country: z.string(),
    flowVersion: z.string(),
    productName: z.string(),
    agreementGate: z.object({ label: localizedText }),
    phases: z.array(z.object({ id: z.enum(["preparation", "migration", "finish"]), name: localizedText })),
    categories: z.object({
      note: z.string().optional(),
      sequentialUnlock: z.boolean(),
      moduleIds: z.array(z.string()).min(1),
    }),
    steps: z.array(stepSchema).min(1),
  })
  .loose();

export type FlowDefinition = z.infer<typeof flowSchema>;
