"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import {
  calculateInvoiceSlice,
  calculatePhaseAfterDiscount,
  calculatePhaseSubtotal,
  calculateProposalTotals,
  discountFromProposal,
} from "@/lib/proposals/calculate-totals";
import type { PhaseWithGroups } from "@/lib/proposals/calculate-totals";
import { fetchProposalWithRelations } from "@/lib/proposals/fetch-proposal";

function nextInvoiceNumber(proposalId: string, count: number) {
  const y = new Date().getFullYear();
  const m = String(new Date().getMonth() + 1).padStart(2, "0");
  const seq = String(count + 1).padStart(2, "0");
  return `INV-${y}${m}-${proposalId.slice(0, 4).toUpperCase()}-${seq}`;
}

export async function createProposalInvoiceAction(
  proposalId: string,
  data: {
    phaseId: string;
    billingPercent: number;
    dueDate?: string | null;
  }
) {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const proposal = await fetchProposalWithRelations(proposalId);
  if (!proposal || proposal.agency_id !== profile.agency_id) {
    throw new Error("Proposal not found");
  }

  const phase = proposal.phases.find((p) => p.id === data.phaseId);
  if (!phase || !phase.groups.length) {
    throw new Error("Phase not found or has no line items");
  }

  const gstRate = Number(proposal.gst_rate);
  const { amountSubtotal, amountGst, amountTotal } = calculateInvoiceSlice(
    phase as PhaseWithGroups,
    data.billingPercent,
    gstRate
  );

  if (amountTotal <= 0) {
    throw new Error("Invoice amount must be greater than zero");
  }

  const { count } = await supabase
    .from("proposal_invoices")
    .select("id", { count: "exact", head: true })
    .eq("proposal_id", proposalId);

  const invoiceNumber = nextInvoiceNumber(proposalId, count ?? 0);
  const today = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("proposal_invoices").insert({
    agency_id: profile.agency_id,
    proposal_id: proposalId,
    phase_id: data.phaseId,
    billing_percent: data.billingPercent,
    amount_subtotal: amountSubtotal,
    amount_gst: amountGst,
    amount_total: amountTotal,
    invoice_number: invoiceNumber,
    invoice_date: today,
    due_date: data.dueDate?.trim() || null,
    status: "draft",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function markProposalInvoicePaidAction(
  invoiceId: string,
  proposalId: string
) {
  await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("proposal_invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function deleteProposalInvoiceAction(
  invoiceId: string,
  proposalId: string
) {
  await requireProfile();
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("proposal_invoices")
    .select("status")
    .eq("id", invoiceId)
    .single();

  if (row?.status === "paid") {
    throw new Error("Cannot delete a paid invoice");
  }

  const { error } = await supabase
    .from("proposal_invoices")
    .delete()
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function getProposalBalanceSummary(proposalId: string) {
  const proposal = await fetchProposalWithRelations(proposalId);
  if (!proposal) return null;

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("proposal_invoices")
    .select("amount_total, status")
    .eq("proposal_id", proposalId);

  const discount = discountFromProposal(proposal);
  const totals = calculateProposalTotals(
    proposal.phases,
    Number(proposal.gst_rate),
    "proposal",
    discount
  );

  const invoiced = (invoices ?? []).reduce(
    (s, i) => s + Number(i.amount_total),
    0
  );
  const paid = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount_total), 0);

  return {
    total: totals.total,
    invoiced,
    paid,
    remaining: totals.total - paid,
  };
}

export async function previewInvoiceAmount(
  proposalId: string,
  phaseId: string,
  billingPercent: number
) {
  const proposal = await fetchProposalWithRelations(proposalId);
  if (!proposal) return null;

  const phase = proposal.phases.find((p) => p.id === phaseId);
  if (!phase) return null;

  const gstRate = Number(proposal.gst_rate);
  const slice = calculateInvoiceSlice(
    phase as PhaseWithGroups,
    billingPercent,
    gstRate
  );
  const phaseSubtotal = calculatePhaseSubtotal(phase as PhaseWithGroups);
  const phaseAfterDiscount = calculatePhaseAfterDiscount(phase as PhaseWithGroups);

  return {
    ...slice,
    phaseSubtotal,
    phaseAfterDiscount,
  };
}
