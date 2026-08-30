"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { assignDataSet, saveMigrationPlan } from "@/actions/case";

interface PlanRow {
  moduleId: string;
  name: string;
  requiredLevel: "required" | "optional";
  methods: string[];
  currentMethod: string | null;
  assigneeId: string | null;
}

/**
 * The method matrix — one row per data category, method chosen per row.
 * "Sequential vs bulk" was never binary: complexity is chosen per category,
 * not per customer (CUSTOMER-FLOW §4.7, the key insight of Eric's design).
 * Delegation per category is a core mechanic: each row carries an assignee.
 */
export function MigrationPlanStep({
  caseId,
  stepId,
  acknowledgements,
  initialAcks,
  rows,
  users,
}: {
  caseId: string;
  stepId: string;
  acknowledgements: { id: string; label: string }[];
  initialAcks: Record<string, boolean>;
  rows: PlanRow[];
  users: { id: string; name: string }[];
}) {
  const t = useTranslations();
  const [acks, setAcks] = useState(initialAcks);
  const [methods, setMethods] = useState<Record<string, string>>(
    Object.fromEntries(
      rows.filter((r) => r.currentMethod).map((r) => [r.moduleId, r.currentMethod!])
    )
  );
  const [assignees, setAssignees] = useState<Record<string, string>>(
    Object.fromEntries(
      rows.filter((r) => r.assigneeId).map((r) => [r.moduleId, r.assigneeId!])
    )
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      {acknowledgements.length > 0 && (
        <div className="card">
          <h2>{t("migrationPlan.acknowledgementsHeading")}</h2>
          {acknowledgements.map((a) => (
            <div className="check-row" key={a.id}>
              <input
                id={a.id}
                type="checkbox"
                checked={acks[a.id] === true}
                onChange={(e) => {
                  setAcks((prev) => ({ ...prev, [a.id]: e.target.checked }));
                  setSaved(false);
                }}
              />
              <label htmlFor={a.id}>{a.label}</label>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2>{t("migrationPlan.matrixHeading")}</h2>
        <p className="hint-text" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
          {t("migrationPlan.matrixHint")}
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{t("migrationPlan.categoryHeading")}</th>
                <th scope="col">{t("migrationPlan.methodHeading")}</th>
                <th scope="col">{t("migrationPlan.assigneeHeading")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.moduleId}>
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--heading)" }}>{row.name}</div>
                    <span className="type-badge" data-kind={row.requiredLevel}>
                      {t(
                        row.requiredLevel === "required"
                          ? "migrationPlan.requiredBadge"
                          : "migrationPlan.optionalBadge"
                      )}
                    </span>
                  </td>
                  <td>
                    <div
                      className="method-chips"
                      role="group"
                      aria-label={`${row.name} — ${t("migrationPlan.methodHeading")}`}
                    >
                      {row.methods.map((m) => (
                        <button
                          key={m}
                          type="button"
                          className="chip"
                          aria-pressed={methods[row.moduleId] === m}
                          onClick={() => {
                            setMethods((prev) => ({ ...prev, [row.moduleId]: m }));
                            setSaved(false);
                          }}
                        >
                          {t(`methods.${m}`)}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <select
                      aria-label={`${row.name} — ${t("migrationPlan.assigneeHeading")}`}
                      value={assignees[row.moduleId] ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAssignees((prev) => ({ ...prev, [row.moduleId]: value }));
                        startTransition(async () => {
                          await assignDataSet(caseId, row.moduleId, value || null);
                        });
                      }}
                      style={{
                        padding: "0.4rem 0.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        font: "inherit",
                      }}
                    >
                      <option value="">{t("migrationPlan.noAssignee")}</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          className="btn"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await saveMigrationPlan(caseId, stepId, acks, methods);
              setSaved(result.ok);
            })
          }
        >
          {t("actions.save")}
        </button>
        {saved && (
          <span className="pill" data-tone="ok">
            {t("actions.saved")}
          </span>
        )}
      </div>
    </>
  );
}
