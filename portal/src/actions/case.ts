"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getCaseView } from "@/lib/case";
import { loadRegistry } from "@/lib/registry/load";
import {
  validateFormStep,
  countValidPeople,
  type PersonRow,
  type FieldErrors,
} from "@/lib/registry/validate";
import { LOCALE_COOKIE, isActiveLocale } from "@/lib/locale";

/**
 * Server actions — every state change goes through here, and every completion
 * claim is re-validated against the registry definition server-side
 * (BUILD-SPEC §12: backend validation guarantees integrity).
 *
 * No auth yet: identity is an open question (STATUS.md Q2). Actions take the
 * caseId explicitly so the auth layer can wrap them without reshaping them.
 */

export interface ActionResult {
  ok: boolean;
  errors?: FieldErrors;
  message?: string;
}

function revalidateCase(caseId: string) {
  revalidatePath(`/case/${caseId}`, "layout");
}

export async function setLocale(locale: string): Promise<void> {
  if (!isActiveLocale(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

export async function confirmAgreement(caseId: string): Promise<ActionResult> {
  await prisma.onboardingCase.update({
    where: { id: caseId },
    data: { agreementConfirmedAt: new Date() },
  });
  // Confirming the agreement also completes the welcome step.
  const view = await getCaseView(caseId);
  const firstStep = view?.registry.flow.steps[0];
  if (firstStep) {
    await upsertStep(caseId, firstStep.id, {}, true);
  }
  revalidateCase(caseId);
  return { ok: true };
}

async function upsertStep(
  caseId: string,
  stepId: string,
  data: Record<string, unknown>,
  complete: boolean
) {
  await prisma.stepInstance.upsert({
    where: { caseId_stepId: { caseId, stepId } },
    create: {
      caseId,
      stepId,
      dataJson: JSON.stringify(data),
      completedAt: complete ? new Date() : null,
    },
    update: {
      dataJson: JSON.stringify(data),
      completedAt: complete ? new Date() : null,
    },
  });
}

/** Save a form step. Completing requires the registry validation to pass. */
export async function saveFormStep(
  caseId: string,
  stepId: string,
  data: Record<string, unknown>,
  complete: boolean
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step) return { ok: false, message: "unknown-step" };

  if (complete) {
    const errors = validateFormStep(step, data);
    if (Object.keys(errors).length > 0) {
      await upsertStep(caseId, stepId, data, false);
      revalidateCase(caseId);
      return { ok: false, errors };
    }
  }
  await upsertStep(caseId, stepId, data, complete);
  revalidateCase(caseId);
  return { ok: true };
}

/** Replace the case's people (superusers step). Completes at >= minValid. */
export async function savePeople(
  caseId: string,
  stepId: string,
  people: PersonRow[]
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step || step.kind !== "people") return { ok: false, message: "unknown-step" };

  await prisma.$transaction(async (tx) => {
    // Keep users referenced as DataSet assignees; replace the rest.
    const assigneeIds = new Set(
      view.case.dataSets.map((d) => d.assigneeId).filter((x): x is string => x !== null)
    );
    await tx.caseUser.deleteMany({
      where: { caseId, id: { notIn: [...assigneeIds] } },
    });
    for (const p of people) {
      await tx.caseUser.create({
        data: {
          caseId,
          firstName: p.firstName.trim(),
          lastName: p.lastName.trim(),
          email: p.email.trim(),
          role: p.role?.trim() ?? "",
        },
      });
    }
  });

  const complete = countValidPeople(people) >= step.minValid;
  await upsertStep(caseId, stepId, {}, complete);
  revalidateCase(caseId);
  return { ok: true };
}

/** Webinar matrix: checks keyed `${userId}:${webinarId}`. All required. */
export async function saveWebinars(
  caseId: string,
  stepId: string,
  checks: Record<string, boolean>
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step || step.kind !== "webinars") return { ok: false, message: "unknown-step" };

  const complete =
    view.case.users.length > 0 &&
    view.case.users.every((u) => step.webinars.every((w) => checks[`${u.id}:${w.id}`]));

  await upsertStep(caseId, stepId, { checks }, complete);
  revalidateCase(caseId);
  return { ok: true };
}

/** Consents step: complete only when every consent is checked. */
export async function saveConsents(
  caseId: string,
  stepId: string,
  checked: Record<string, boolean>
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step || step.kind !== "consents") return { ok: false, message: "unknown-step" };

  const complete = step.consents.every((c) => checked[c.id] === true);
  await upsertStep(caseId, stepId, { checked }, complete);
  revalidateCase(caseId);
  return { ok: true };
}

/**
 * Migration plan: per-category method choices land on the DataSets (the
 * staging objects); acknowledgements land on the step. Complete when every
 * acknowledgement is checked and every flow category has a chosen method.
 */
export async function saveMigrationPlan(
  caseId: string,
  stepId: string,
  acks: Record<string, boolean>,
  methods: Record<string, string>
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const step = view.registry.flow.steps.find((s) => s.id === stepId);
  if (!step || step.kind !== "migration-plan") return { ok: false, message: "unknown-step" };
  const registry = loadRegistry(view.case.registryFlow);

  for (const mod of registry.flowModules) {
    const method = methods[mod.id];
    if (!method) continue;
    const allowed = [...mod.methods, "skip"];
    if (!allowed.includes(method)) continue;
    const existing = view.case.dataSets.find((d) => d.moduleId === mod.id);
    if (existing) {
      await prisma.dataSet.update({ where: { id: existing.id }, data: { method } });
    } else {
      await prisma.dataSet.create({
        data: { caseId, moduleId: mod.id, method },
      });
    }
  }

  const allAcked = step.acknowledgements.every((a) => acks[a.id] === true);
  // Integration-sourced categories (kartläggning answers, R10) need no
  // method choice — they have left the manual flow.
  const allMethods = registry.flowModules
    .filter((m) => !view.integrationSourcedModuleIds.has(m.id))
    .every((m) => !!methods[m.id]);
  await upsertStep(caseId, stepId, { acks }, allAcked && allMethods);
  revalidateCase(caseId);
  return { ok: true };
}

/** Record the chosen import method on a category's DataSet. */
export async function setDataSetMethod(
  caseId: string,
  moduleId: string,
  method: string
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const mod = view.registry.modules.get(moduleId);
  if (!mod) return { ok: false, message: "unknown-module" };
  if (![...mod.methods, "skip"].includes(method)) return { ok: false, message: "bad-method" };

  const existing = view.case.dataSets.find((d) => d.moduleId === moduleId);
  if (existing) {
    await prisma.dataSet.update({ where: { id: existing.id }, data: { method } });
  } else {
    await prisma.dataSet.create({ data: { caseId, moduleId, method } });
  }
  revalidateCase(caseId);
  return { ok: true };
}

/** Assign a data category to one of the case's users. */
export async function assignDataSet(
  caseId: string,
  moduleId: string,
  assigneeId: string | null
): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const existing = view.case.dataSets.find((d) => d.moduleId === moduleId);
  if (existing) {
    await prisma.dataSet.update({ where: { id: existing.id }, data: { assigneeId } });
  } else {
    await prisma.dataSet.create({ data: { caseId, moduleId, assigneeId } });
  }
  revalidateCase(caseId);
  return { ok: true };
}

/**
 * DEMO placeholder for the Ingestro slice: marks a category's DataSet as
 * submitted so flow gating can be demonstrated end to end. Replaced by the
 * real upload → mapping → validation → staging path (BUILD-SPEC backlog 2).
 */
export async function simulateImport(caseId: string, moduleId: string): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const existing = view.case.dataSets.find((d) => d.moduleId === moduleId);
  if (existing) {
    await prisma.dataSet.update({
      where: { id: existing.id },
      data: { status: "submitted", sourceFileName: "demo.xlsx" },
    });
  } else {
    await prisma.dataSet.create({
      data: { caseId, moduleId, status: "submitted", sourceFileName: "demo.xlsx" },
    });
  }
  revalidateCase(caseId);
  return { ok: true };
}

/** Skipping is a first-class, guilt-free choice (DESIGN-BRIEF §4.9). */
export async function skipCategory(caseId: string, moduleId: string): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const existing = view.case.dataSets.find((d) => d.moduleId === moduleId);
  if (existing) {
    await prisma.dataSet.update({
      where: { id: existing.id },
      data: { status: "skipped", method: "skip" },
    });
  } else {
    await prisma.dataSet.create({
      data: { caseId, moduleId, status: "skipped", method: "skip" },
    });
  }
  revalidateCase(caseId);
  return { ok: true };
}

export async function undoSkip(caseId: string, moduleId: string): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  const existing = view.case.dataSets.find((d) => d.moduleId === moduleId);
  if (existing && (existing.status === "skipped" || existing.status === "submitted")) {
    await prisma.dataSet.update({
      where: { id: existing.id },
      data: { status: "not_started", method: existing.method === "skip" ? null : existing.method },
    });
  }
  revalidateCase(caseId);
  return { ok: true };
}

/** Final submission — only when the server-side journey says the gate is open. */
export async function submitCase(caseId: string): Promise<ActionResult> {
  const view = await getCaseView(caseId);
  if (!view) return { ok: false, message: "unknown-case" };
  if (!view.journey.finishUnlocked) return { ok: false, message: "gates-open" };
  if (view.case.status !== "active") return { ok: false, message: "already-submitted" };

  await prisma.onboardingCase.update({
    where: { id: caseId },
    data: { status: "submitted", submittedAt: new Date() },
  });
  // Completion signal: exactly one record in Salesforce (BUILD-SPEC backlog 4).
  // Stubbed behind the adapter boundary until the integration pattern lands (Q4).
  revalidateCase(caseId);
  return { ok: true };
}
