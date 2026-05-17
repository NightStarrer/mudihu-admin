import type { PhaseWithGroups } from "@/lib/proposals/calculate-totals";

export type PdfDocumentType = "proposal" | "invoice" | "cost_sheet";

export const PDF_DOCUMENT_LABELS: Record<
  PdfDocumentType,
  { title: string; totalLabel: string }
> = {
  proposal: { title: "Project Proposal", totalLabel: "Total investment" },
  invoice: { title: "Tax Invoice", totalLabel: "Amount due" },
  cost_sheet: { title: "Cost Sheet", totalLabel: "Total cost" },
};

export type DocumentInclusionFlags = {
  include_in_proposal: boolean;
  include_in_invoice: boolean;
  include_in_cost_sheet: boolean;
};

export function isIncludedInDocument(
  flags: DocumentInclusionFlags,
  documentType: PdfDocumentType
): boolean {
  switch (documentType) {
    case "proposal":
      return flags.include_in_proposal;
    case "invoice":
      return flags.include_in_invoice;
    case "cost_sheet":
      return flags.include_in_cost_sheet;
  }
}

/** Phases and line items included for a given export type. */
export function filterPhasesForDocument(
  phases: PhaseWithGroups[],
  documentType: PdfDocumentType
): PhaseWithGroups[] {
  return phases
    .filter((phase) => isIncludedInDocument(phase, documentType))
    .map((phase) => ({
      ...phase,
      groups: phase.groups.filter((group) =>
        isIncludedInDocument(group, documentType)
      ),
    }))
    .filter((phase) => phase.groups.length > 0);
}
