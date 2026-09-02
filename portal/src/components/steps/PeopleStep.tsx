"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { savePeople } from "@/actions/case";
import { countValidPeople, type PersonRow } from "@/lib/registry/validate";

/**
 * Repeating-row people editor with a live validity counter
 * ("1 giltiga · minst 2 krävs") — DESIGN-BRIEF §4.6.
 */
export function PeopleStep({
  caseId,
  stepId,
  minValid,
  initialPeople,
}: {
  caseId: string;
  stepId: string;
  minValid: number;
  initialPeople: PersonRow[];
}) {
  const t = useTranslations();
  const [people, setPeople] = useState<PersonRow[]>(
    initialPeople.length > 0
      ? initialPeople
      : [{ firstName: "", lastName: "", email: "", role: "" }]
  );
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const validCount = countValidPeople(people);

  const update = (index: number, key: keyof PersonRow, value: string) => {
    setPeople((rows) => rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
    setSaved(false);
  };

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">{t("people.firstName")}</th>
              <th scope="col">{t("people.lastName")}</th>
              <th scope="col">{t("people.email")}</th>
              <th scope="col">{t("people.role")}</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {people.map((p, i) => (
              <tr key={i}>
                <td>
                  <input
                    aria-label={t("people.firstName")}
                    value={p.firstName}
                    onChange={(e) => update(i, "firstName", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={t("people.lastName")}
                    value={p.lastName}
                    onChange={(e) => update(i, "lastName", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={t("people.email")}
                    type="email"
                    value={p.email}
                    onChange={(e) => update(i, "email", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    aria-label={t("people.role")}
                    placeholder={t("people.rolePlaceholder")}
                    value={p.role ?? ""}
                    onChange={(e) => update(i, "role", e.target.value)}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setPeople((rows) => rows.filter((_, j) => j !== i));
                      setSaved(false);
                    }}
                  >
                    {t("actions.remove")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          marginTop: "0.9rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setPeople((rows) => [...rows, { firstName: "", lastName: "", email: "", role: "" }])
          }
        >
          {t("actions.addPerson")}
        </button>
        <span className="counter" data-ok={validCount >= minValid} aria-live="polite">
          {t("people.counter", { count: validCount, min: minValid })}
        </span>
        <button
          className="btn"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await savePeople(caseId, stepId, people);
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
