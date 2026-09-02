"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { confirmAgreement } from "@/actions/case";

/**
 * Welcome step. Entry is triggered by the closed-won opportunity, so the
 * signed agreement is stated as a fact — no confirmation checkbox
 * (R3, Carl 2026-08-31; the earlier checkbox belonged to a self-signup
 * scenario that is possible later scope, not today's flow).
 * "Get started" opens the flow and stamps when the customer entered.
 */
export function WelcomeStep({
  caseId,
  cards,
  entryNotice,
  confirmed,
}: {
  caseId: string;
  cards: { title: string; body: string }[];
  entryNotice: string;
  confirmed: boolean;
}) {
  const t = useTranslations();
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
        <p style={{ fontWeight: 600, color: "var(--heading)" }}>{entryNotice}</p>
        {!confirmed && (
          <>
            <p className="hint-text">{t("agreement.hint")}</p>
            <button
              className="btn"
              disabled={pending}
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
