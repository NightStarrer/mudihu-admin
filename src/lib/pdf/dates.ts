import type { PdfDocumentType } from "@/lib/proposals/document-types";
import type { Proposal } from "@/types/database";

export function formatPdfDate(
  isoDate: string | null | undefined,
  fallback = new Date()
): string {
  const d = isoDate ? new Date(isoDate + "T12:00:00") : fallback;
  if (Number.isNaN(d.getTime())) return fallback.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPdfDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate + "T12:00:00");
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Date printed on the PDF for each document type. */
export function getDocumentDate(
  proposal: Pick<
    Proposal,
    "proposal_date" | "cost_sheet_date" | "invoice_date"
  >,
  documentType: PdfDocumentType
): string {
  switch (documentType) {
    case "invoice":
      return formatPdfDate(proposal.invoice_date);
    case "cost_sheet":
      return formatPdfDate(proposal.cost_sheet_date ?? proposal.proposal_date);
    default:
      return formatPdfDate(proposal.proposal_date);
  }
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
