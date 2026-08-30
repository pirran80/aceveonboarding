"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveConsents } from "@/actions/case";

/**
 * Three-way consent split (read & understood / AI tools / inform staff) —
 * the starting draft for Legal (STATUS.md Q8). Grouped consents render under
 * their group heading (DATABEHANDLING OCH AI).
 */
export function ConsentsStep({
  caseId,
  stepId,
  document,
  consents,
  initialChecked,
}: {
  caseId: string;
  stepId: string;
  document: { label: string; href: string } | null;
  consents: { id: string; group: string | null; label: string }[];
  initialChecked: Record<string, boolean>;
}) {
  const t = useTranslations();
  const [checked, setChecked] = useState(initialChecked);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const ungrouped = consents.filter((c) => c.group === null);
  const grouped = consents.filter((c) => c.group !== null);

  const row = (c: { id: string; label: string }) => (
    <div className="check-row" key={c.id}>
      <input
        id={c.id}
        type="checkbox"
        checked={checked[c.id] === true}
        onChange={(e) => {
          setChecked((prev) => ({ ...prev, [c.id]: e.target.checked }));
          setSaved(false);
        }}
      />
      <label htmlFor={c.id}>{c.label}</label>
    </div>
  );

  return (
    <>
      {document && (
        <div className="card">
          <h2>{t("consents.documentHeading")}</h2>
          <a href={document.href}>{document.label}</a>
        </div>
      )}

      <div className="card">{ungrouped.map(row)}</div>

      {grouped.length > 0 && (
        <div className="card">
          <h2>{t("consents.dataProcessingHeading")}</h2>
          {grouped.map(row)}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          className="btn"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await saveConsents(caseId, stepId, checked);
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
