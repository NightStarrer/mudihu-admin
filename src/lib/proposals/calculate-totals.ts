import type { ProposalGroup, ProposalPhase } from "@/types/database";
import { formatMoney } from "@/lib/money/currency";
import {
  applyDiscount,
  type DiscountOptions,
  type DiscountType,
} from "@/lib/proposals/discount";
import {
  filterPhasesForDocument,
  type PdfDocumentType,
} from "@/lib/proposals/document-types";

export type PhaseWithGroups = ProposalPhase & { groups: ProposalGroup[] };

export function discountFromProposal(proposal: {
  discount_type?: string | null;
  discount_value?: number | null;
  discount_label?: string | null;
}): DiscountOptions {
  const type = (proposal.discount_type ?? "none") as DiscountType;
  return {
    type: type === "percent" || type === "fixed" ? type : "none",
    value: Number(proposal.discount_value ?? 0),
    label: proposal.discount_label?.trim() || "Discount",
  };
}

export function calculateProposalTotals(
  phases: PhaseWithGroups[],
  gstRate: number,
  documentType?: PdfDocumentType,
  discount?: DiscountOptions
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
  const disc = discount ?? { type: "none" as const, value: 0, label: "Discount" };
  const { discountAmount, afterDiscount } = applyDiscount(subtotal, disc);
  const gstAmount = afterDiscount * (gstRate / 100);
  const total = afterDiscount + gstAmount;

  return {
    phaseTotals,
    subtotal,
    discountAmount,
    afterDiscount,
    gstAmount,
    total,
    discountLabel: disc.label,
    discountType: disc.type,
    discountValue: disc.value,
  };
}

/** @deprecated Prefer formatMoney(amount, currencyCode) */
export function formatINR(amount: number) {
  return formatMoney(amount, "INR");
}

export { formatMoney };
