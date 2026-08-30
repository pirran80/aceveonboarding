"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { setDataSetMethod, simulateImport, skipCategory, undoSkip } from "@/actions/case";

/**
 * Per-category import step (CUSTOMER-FLOW §4.8):
 *  - method cards (GI-mall / Excel / skip — skipping is guilt-free),
 *  - the semantic model shown up front: target fields as chips, mandatory
 *    highlighted, so the customer sees what "done" means before starting,
 *  - the Ingestro Importer embed lands here in the next slice (BUILD-SPEC
 *    backlog 2); until then a clearly-labelled demo action stands in so flow
 *    gating can be exercised end to end.
 *
 * The chosen method is server state (the DataSet row) — this component never
 * keeps its own copy beyond the in-flight optimistic value, so undo/skip can
 * never leave the cards showing something the server no longer says (P3-5).
 */
export function CategoryStep({
  caseId,
  moduleId,
  sheetName,
  methods,
  currentMethod,
  status,
  version,
  assigneeName,
  fields,
}: {
  caseId: string;
  moduleId: string;
  sheetName: string;
  methods: string[];
  currentMethod: string | null;
  status: string;
  version: number;
  assigneeName: string | null;
  fields: { id: string; label: string; required: boolean }[];
}) {
  const t = useTranslations();
  const [pendingMethod, setPendingMethod] = useState<string | null>(null);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [pending, startTransition] = useTransition();

  // Server value, overlaid by the optimistic choice only while it is in flight.
  const method = pending && pendingMethod !== null ? pendingMethod : currentMethod;

  const done = status !== "not_started" && status !== "in_progress";
  const skipped = status === "skipped";
  const awaitingFile = !done && method !== null && method !== "skip";

  const methodDesc = (m: string) =>
    m === "gi-mall"
      ? t("category.giMallCard", { sheet: sheetName })
      : m === "excel"
        ? t("category.uploadCard")
        : m === "skip"
          ? t("category.skipCard")
          : t(`methods.${m}`);

  return (
    <>
      {assigneeName && (
        <p className="hint-text">
          {t("migrationPlan.assigneeHeading")}: <strong>{assigneeName}</strong>
        </p>
      )}

      <div className="card">
        <h2>{t("category.chooseMethod")}</h2>
        <div className="method-cards">
          {methods.map((m) => (
            <button
              key={m}
              type="button"
              className="method-card"
              aria-pressed={method === m}
              disabled={done}
              onClick={() => {
                if (m === "skip") return; // confirmed via the skip button below
                setPendingMethod(m);
                startTransition(() => setDataSetMethod(caseId, moduleId, m).then(() => {}));
              }}
            >
              <div className="mc-title">{t(`methods.${m}`)}</div>
              <div className="mc-desc">{methodDesc(m)}</div>
            </button>
          ))}
        </div>
        {done && <p className="hint-text">{t("category.lockedHint")}</p>}
      </div>

      <div className="card">
        <h2>{t("category.semanticModel")}</h2>
        <p className="hint-text" style={{ marginTop: "-0.5rem", marginBottom: "0.8rem" }}>
          {t("category.semanticHint")}
        </p>
        <div className="field-chips">
          {fields.map((f) => (
            <span className="field-chip" data-required={f.required} key={f.id}>
              {f.label}
              {f.required ? " *" : ""}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        {done ? (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="pill" data-tone="ok">
              {skipped ? t("status.skipped") : t("status.complete")}
            </span>
            <span className="hint-text">{t("category.version", { version })}</span>
            {confirmUndo ? (
              <>
                <span className="hint-text" style={{ color: "var(--warn)" }}>
                  {t("category.undoConfirm")}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await undoSkip(caseId, moduleId);
                      setConfirmUndo(false);
                    })
                  }
                >
                  {t("actions.yes")}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setConfirmUndo(false)}
                >
                  {t("actions.cancel")}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setConfirmUndo(true)}
              >
                {t("category.undoSkip")}
              </button>
            )}
          </div>
        ) : (
          <>
            {awaitingFile && (
              <p style={{ marginTop: 0 }}>
                <span className="pill" data-tone="warn">
                  {t("category.methodChosen")}
                </span>
              </p>
            )}
            <p className="note">{t("category.importPlaceholder")}</p>
            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "0.9rem", flexWrap: "wrap" }}
            >
              <button
                className="btn"
                disabled={pending || !method || method === "skip"}
                onClick={() =>
                  startTransition(() => simulateImport(caseId, moduleId).then(() => {}))
                }
              >
                {t("category.simulateImport")}
              </button>
              <button
                className="btn btn-secondary"
                disabled={pending}
                onClick={() =>
                  startTransition(() => skipCategory(caseId, moduleId).then(() => {}))
                }
              >
                {t("category.markSkipped")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
