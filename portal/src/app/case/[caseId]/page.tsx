import { notFound, redirect } from "next/navigation";
import { getCaseView } from "@/lib/case";
import { itemHref } from "@/lib/urls";

export default async function CasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const view = await getCaseView(caseId);
  if (!view) notFound();

  // Land on the one obvious next step (DESIGN-BRIEF §1).
  const active =
    view.journey.items.find((i) => i.state === "active") ??
    view.journey.items[0];
  redirect(itemHref(caseId, active));
}
