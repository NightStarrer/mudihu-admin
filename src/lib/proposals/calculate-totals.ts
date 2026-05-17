import type { ProposalGroup, ProposalPhase } from "@/types/database";
import {
  filterPhasesForDocument,
  type PdfDocumentType,
} from "@/lib/proposals/document-types";

export type PhaseWithGroups = ProposalPhase & { groups: ProposalGroup[] };

export function calculateProposalTotals(
  phases: PhaseWithGroups[],
  gstRate: number,
  documentType?: PdfDocumentType
) {
  const billablePhases = documentType
    ? filterPhasesForDocument(phases, documentType)
    : phases;

  const phaseTotals = billablePhases.map((p) => ({
    phaseId: p.id,
    phaseName: p.name,
    subtotal: p.groups.reduce((s, g) => s + Number(g.amount), 0),
  }));

  const subtotal = phaseTotals.reduce((s, p) => s + p.subtotal, 0);
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  return { phaseTotals, subtotal, gstAmount, total };
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
