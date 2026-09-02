import type { JourneyItem } from "./registry/flow";

export function itemHref(caseId: string, item: JourneyItem): string {
  // Route segment is "category", deliberately NOT "data": deployment tooling
  // excludes directories named data/ (the bind-mounted SQLite dir) from the
  // rsync to the server, and an unanchored exclude also swallowed the old
  // app route directory — feedback P0-1, 2026-08-31.
  return item.kind === "category"
    ? `/case/${caseId}/category/${item.moduleId}`
    : `/case/${caseId}/step/${item.id}`;
}
