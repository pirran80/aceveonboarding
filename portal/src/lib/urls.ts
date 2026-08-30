import type { JourneyItem } from "./registry/flow";

export function itemHref(caseId: string, item: JourneyItem): string {
  return item.kind === "category"
    ? `/case/${caseId}/data/${item.moduleId}`
    : `/case/${caseId}/step/${item.id}`;
}
