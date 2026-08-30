"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitCase } from "@/actions/case";

/**
 * "Skicka & boka uppstart" — gated for real, not decoratively: when locked it
 * lists exactly what is outstanding by name (DESIGN-BRIEF §4.2).
 *
 * Submission asks for confirmation (it locks the material) and the submitted
 * state is a receipt, not a dead end: it says what happens next (P0-5).
 */
export function FinishStep({
  caseId,
  unlocked,
  submitted,
  submittedAt,
  outstanding,
}: {
  caseId: string;
  unlocked: boolean;
  submitted: boolean;
  submittedAt: string | null; // ISO timestamp of the actual submission
  outstanding: string[];
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="locked-panel card">
        <div className="lock" aria-hidden="true">
          ✅
        </div>
        <h2>{t("finish.unlockedTitle")}</h2>
        {submittedAt && (
          <p>
            {t("finish.submitted", {
              date: new Date(submittedAt).toLocaleDateString(locale),
            })}
          </p>
        )}
        <div style={{ textAlign: "left", maxWidth: "34rem", margin: "1.25rem auto 0" }}>
          <h3 style={{ fontSize: "0.95rem" }}>{t("finish.nextHeading")}</h3>
          <ol style={{ margin: "0.4rem 0 0", paddingLeft: "1.25rem" }}>
            <li>{t("finish.next1")}</li>
            <li>{t("finish.next2")}</li>
            <li>{t("finish.next3")}</li>
          </ol>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="locked-panel card">
        <div className="lock" aria-hidden="true">
          🔒
        </div>
        <h2>{t("finish.lockedTitle")}</h2>
        <p>{t("finish.lockedIntro")}</p>
        <ul className="outstanding-list">
          {outstanding.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="locked-panel card">
      <h2>{t("finish.unlockedTitle")}</h2>
      <p>{t("finish.unlockedIntro")}</p>
      {confirming ? (
        <>
          <p className="note" style={{ maxWidth: "30rem", margin: "0 auto 1rem" }}>
            {t("finish.confirmBody")}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              className="btn"
              disabled={pending}
              onClick={() => startTransition(() => submitCase(caseId).then(() => {}))}
            >
              {t("finish.confirmYes")}
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
              {t("actions.cancel")}
            </button>
          </div>
        </>
      ) : (
        <button className="btn" onClick={() => setConfirming(true)}>
          {t("finish.submit")}
        </button>
      )}
    </div>
  );
}
