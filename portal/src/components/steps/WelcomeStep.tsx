"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { confirmAgreement } from "@/actions/case";

/**
 * Welcome + agreement gate. The gate sits before everything else:
 * no agreement, no flow (CUSTOMER-FLOW §2.3).
 */
export function WelcomeStep({
  caseId,
  cards,
  agreementLabel,
  confirmed,
}: {
  caseId: string;
  cards: { title: string; body: string }[];
  agreementLabel: string;
  confirmed: boolean;
}) {
  const t = useTranslations();
  const [checked, setChecked] = useState(confirmed);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <div className="card-grid" style={{ marginBottom: "1.5rem" }}>
        {cards.map((c) => (
          <div className="info-card" key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>{t("agreement.heading")}</h2>
        <div className="check-row">
          <input
            id="agreement"
            type="checkbox"
            checked={checked}
            disabled={confirmed}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <label htmlFor="agreement">{agreementLabel}</label>
        </div>
        {!confirmed && (
          <>
            <p className="hint-text">{t("agreement.hint")}</p>
            <button
              className="btn"
              disabled={!checked || pending}
              onClick={() => startTransition(() => confirmAgreement(caseId).then(() => {}))}
            >
              {t("actions.getStarted")}
            </button>
          </>
        )}
      </div>
    </>
  );
}
