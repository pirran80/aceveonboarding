"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveFormStep } from "@/actions/case";
import type { ResolvedField } from "@/lib/resolve";
import type { FieldErrors } from "@/lib/registry/validate";

interface ResolvedSection {
  title: string;
  fields: ResolvedField[];
}

/**
 * Definition-driven form renderer: everything it shows comes from the
 * registry (hard rule 1) — adding a field is a JSON change, not a code change.
 */
export function FormStep({
  caseId,
  stepId,
  sections,
  initialData,
  seededFieldIds,
  seededBadge,
  completed,
}: {
  caseId: string;
  stepId: string;
  sections: ResolvedSection[];
  initialData: Record<string, unknown>;
  seededFieldIds: string[];
  /** Audience-dependent wording (R2): names Salesforce in demo, not to customers. */
  seededBadge: string;
  completed: boolean;
}) {
  const t = useTranslations();
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(completed);
  const [pending, startTransition] = useTransition();

  const set = (id: string, value: unknown) => {
    setData((d) => ({ ...d, [id]: value }));
    setSaved(false);
    setErrors((e) => {
      if (!(id in e)) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  };

  const save = () =>
    startTransition(async () => {
      const result = await saveFormStep(caseId, stepId, data, true);
      setErrors(result.errors ?? {});
      setSaved(result.ok);
      // Failed validation must be visible where the user is looking: scroll
      // the first failing field into view and move focus there (P1-2).
      if (!result.ok && result.errors) {
        const ordered = sections.flatMap((s) =>
          s.fields.flatMap((f) => [f, ...(f.conditional?.fields ?? [])])
        );
        const first = ordered.find((f) => result.errors![f.id]);
        if (first) {
          requestAnimationFrame(() => {
            const el = document.getElementById(first.id);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.focus?.({ preventScroll: true });
          });
        }
      }
    });

  const errorCount = Object.keys(errors).length;

  const renderField = (field: ResolvedField) => {
    const error = errors[field.id];
    const seeded = seededFieldIds.includes(field.id);
    const errorId = `${field.id}-error`;

    return (
      <div className="field" key={field.id}>
        {field.type !== "toggle" && (
          <label htmlFor={field.id}>
            {field.label}
            {!field.required && <span className="optional"> ({t("form.optional")})</span>}
            {seeded && <span className="seeded-badge">{seededBadge}</span>}
          </label>
        )}

        {(field.type === "text" || field.type === "email" || field.type === "number") && (
          <input
            id={field.id}
            type={field.type === "number" ? "number" : field.type}
            value={(data[field.id] as string) ?? ""}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => set(field.id, e.target.value)}
          />
        )}

        {field.type === "select" && (
          <select
            id={field.id}
            value={(data[field.id] as string) ?? ""}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(e) => set(field.id, e.target.value)}
          >
            <option value="" />
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "chips" && (
          <div className="chips" role="group" aria-label={field.label} id={field.id} tabIndex={-1}>
            {field.options?.map((o) => {
              const selected = Array.isArray(data[field.id])
                ? (data[field.id] as string[]).includes(o.value)
                : false;
              return (
                <button
                  key={o.value}
                  type="button"
                  className="chip"
                  aria-pressed={selected}
                  onClick={() => {
                    const current = Array.isArray(data[field.id])
                      ? (data[field.id] as string[])
                      : [];
                    set(
                      field.id,
                      selected
                        ? current.filter((v) => v !== o.value)
                        : [...current, o.value]
                    );
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {field.type === "toggle" && (
          <>
            <div className="toggle-row">
              <input
                id={field.id}
                type="checkbox"
                checked={data[field.id] === true}
                onChange={(e) => set(field.id, e.target.checked)}
              />
              <label htmlFor={field.id}>{field.label}</label>
            </div>
            {data[field.id] === true && field.conditional && (
              <div className="conditional-block">
                <h3 style={{ fontSize: "0.9rem" }}>{field.conditional.title}</h3>
                {field.conditional.fields.map(renderField)}
              </div>
            )}
          </>
        )}

        {field.patternHint && !error && <p className="hint-text">{field.patternHint}</p>}
        {error && (
          <p className="error-text" id={errorId}>
            {t(error)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {sections.map((section) => (
        <section className="card" key={section.title}>
          <h2>{section.title}</h2>
          {section.fields.map(renderField)}
        </section>
      ))}

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn" type="submit" disabled={pending}>
          {t("actions.save")}
        </button>
        {saved && (
          <span className="pill" data-tone="ok">
            {t("actions.saved")}
          </span>
        )}
        {errorCount > 0 && (
          <span className="error-text" role="alert">
            {t("form.errorSummary", { count: errorCount })}
          </span>
        )}
      </div>
    </form>
  );
}
