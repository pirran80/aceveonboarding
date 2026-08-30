import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { SummarySection } from "@/lib/summary";

/**
 * End-of-flow review: everything the customer entered, section per step,
 * with a link back to change it. Rendered on the finish step so the customer
 * reviews their material before submitting.
 */
export async function SummaryView({
  caseId,
  sections,
  editable,
}: {
  caseId: string;
  sections: SummarySection[];
  editable: boolean;
}) {
  const t = await getTranslations();

  return (
    <section aria-labelledby="summary-heading" style={{ marginBottom: "2rem" }}>
      <h2 id="summary-heading" style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>
        {t("summary.title")}
      </h2>

      {sections.map((section) => (
        <div className="card summary-card" key={section.id}>
          <div className="summary-head">
            <h3>{section.title}</h3>
            <span className="pill" data-tone={section.complete ? "ok" : "warn"}>
              {t(section.complete ? "status.complete" : "status.notStarted")}
            </span>
            {editable && (
              <Link className="summary-edit" href={`/case/${caseId}/step/${section.id}`}>
                {t("summary.edit")}
              </Link>
            )}
          </div>
          {section.rows.length > 0 ? (
            <dl className="summary-list">
              {section.rows.map((row, i) => (
                <div className="summary-row" key={`${row.label}-${i}`}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="hint-text">{t("summary.empty")}</p>
          )}
        </div>
      ))}
    </section>
  );
}
