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

export function discountFromPhase(phase: {
  discount_type?: string | null;
  discount_value?: number | null;
  discount_label?: string | null;
}): DiscountOptions {
  const type = (phase.discount_type ?? "none") as DiscountType;
  return {
    type: type === "percent" || type === "fixed" ? type : "none",
    value: Number(phase.discount_value ?? 0),
    label: phase.discount_label?.trim() || "Discount",
  };
}

export type PhaseTotalRow = {
  phaseId: string;
  phaseName: string;
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
};

export function calculatePhaseSubtotal(phase: PhaseWithGroups): number {
  return phase.groups.reduce((s, g) => s + Number(g.amount), 0);
}

/** Phase subtotal after phase discount (before billing %). */
export function calculatePhaseAfterDiscount(phase: PhaseWithGroups): number {
  const subtotal = calculatePhaseSubtotal(phase);
  const disc = discountFromPhase(phase);
  return applyDiscount(subtotal, disc).afterDiscount;
}

export function calculateProposalTotals(
  phases: PhaseWithGroups[],
  gstRate: number,
  documentType?: PdfDocumentType,
  globalDiscount?: DiscountOptions
) {
  const billablePhases = documentType
    ? filterPhasesForDocument(phases, documentType)
    : phases;

  const phaseTotals: PhaseTotalRow[] = billablePhases.map((p) => {
    const subtotal = calculatePhaseSubtotal(p);
    const phaseDisc = discountFromPhase(p);
    const { discountAmount, afterDiscount } = applyDiscount(subtotal, phaseDisc);
    return {
      phaseId: p.id,
      phaseName: p.name,
      subtotal,
      discountAmount,
      afterDiscount,
    };
  });

  const subtotal = phaseTotals.reduce((s, p) => s + p.subtotal, 0);
  const phaseDiscountTotal = phaseTotals.reduce((s, p) => s + p.discountAmount, 0);
  const afterPhaseDiscounts = phaseTotals.reduce((s, p) => s + p.afterDiscount, 0);

  const disc = globalDiscount ?? { type: "none" as const, value: 0, label: "Discount" };
  const { discountAmount: globalDiscountAmount, afterDiscount } = applyDiscount(
    afterPhaseDiscounts,
    disc
  );

  const discountAmount = phaseDiscountTotal + globalDiscountAmount;
  const gstAmount = afterDiscount * (gstRate / 100);
  const total = afterDiscount + gstAmount;

  return {
    phaseTotals,
    subtotal,
    phaseDiscountTotal,
    afterPhaseDiscounts,
    discountAmount,
    globalDiscountAmount,
    afterDiscount,
    gstAmount,
    total,
    discountLabel: disc.label,
    discountType: disc.type,
    discountValue: disc.value,
  };
}

/** Invoice slice: billing % of phase subtotal (after phase discount), then GST. */
export function calculateInvoiceSlice(
  phase: PhaseWithGroups,
  billingPercent: number,
  gstRate: number
) {
  const phaseAfterDiscount = calculatePhaseAfterDiscount(phase);
  const amountSubtotal =
    phaseAfterDiscount * (Math.min(Math.max(billingPercent, 0), 100) / 100);
  const amountGst = amountSubtotal * (gstRate / 100);
  const amountTotal = amountSubtotal + amountGst;
  return { amountSubtotal, amountGst, amountTotal, phaseAfterDiscount };
}

/** @deprecated Prefer formatMoney(amount, currencyCode) */
export function formatINR(amount: number) {
  return formatMoney(amount, "INR");
}

export { formatMoney };
