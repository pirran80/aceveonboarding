"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveWebinars } from "@/actions/case";

/**
 * Per-user × per-webinar check matrix — all required (CUSTOMER-FLOW §3.5).
 * Which webinars appear is registry configuration per product/country.
 */
export function WebinarsStep({
  caseId,
  stepId,
  webinars,
  users,
  initialChecks,
  minValid,
}: {
  caseId: string;
  stepId: string;
  webinars: { id: string; name: string; href: string | null }[];
  users: { id: string; name: string }[];
  initialChecks: Record<string, boolean>;
  minValid: number;
}) {
  const t = useTranslations();
  const [checks, setChecks] = useState(initialChecks);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (users.length < minValid) {
    return <p className="note">{t("webinars.needPeople", { min: minValid })}</p>;
  }

  return (
    <>
      <p className="hint-text">{t("webinars.matrixHint")}</p>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col" />
              {webinars.map((w, i) => (
                <th scope="col" key={w.id}>
                  {i + 1}. {w.name}
                  {w.href && (
                    <>
                      {" "}
                      <a href={w.href} target="_blank" rel="noreferrer">
                        {t("actions.open")}
                      </a>
                    </>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>{u.name}</td>
                {webinars.map((w) => {
                  const key = `${u.id}:${w.id}`;
                  return (
                    <td key={w.id}>
                      <input
                        type="checkbox"
                        aria-label={`${u.name} — ${w.name}`}
                        checked={checks[key] === true}
                        onChange={(e) => {
                          setChecks((c) => ({ ...c, [key]: e.target.checked }));
                          setSaved(false);
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem" }}>
        <button
          className="btn"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await saveWebinars(caseId, stepId, checks);
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
