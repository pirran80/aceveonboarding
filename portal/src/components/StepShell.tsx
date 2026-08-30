import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { JourneyItemState } from "@/lib/registry/flow";

const TONE: Record<JourneyItemState, string> = {
  complete: "ok",
  active: "active",
  available: "",
  locked: "warn",
};

/**
 * Shared step chrome: title, one-line purpose subtitle, status pill and the
 * "next step" footer (DESIGN-BRIEF §3: one step at a time in the main pane).
 */
export async function StepShell({
  title,
  subtitle,
  state,
  nextHref,
  children,
}: {
  title: string;
  subtitle: string;
  state: JourneyItemState;
  nextHref: string | null;
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  return (
    <>
      <header className="step-head">
        <span className="pill" data-tone={TONE[state]}>
          {t(`status.${state}`)}
        </span>
        <h1 style={{ marginTop: "0.6rem" }}>{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </header>

      {children}

      <div className="step-footer">
        <span />
        {nextHref ? (
          <Link href={nextHref} className="btn btn-secondary">
            {t("actions.next")}
          </Link>
        ) : (
          <span />
        )}
      </div>
    </>
  );
}
