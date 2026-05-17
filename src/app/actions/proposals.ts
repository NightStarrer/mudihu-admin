"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import type { ProposalStatus } from "@/types/database";

export async function createProposalAction(formData: FormData) {
  const { profile } = await requireProfile();
  const supabase = await createClient();

  const clientId = formData.get("client_id") as string;
  const title = formData.get("title") as string;

  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      agency_id: profile.agency_id,
      client_id: clientId,
      title,
      description: (formData.get("description") as string) || null,
      gst_rate: Number(formData.get("gst_rate") ?? 18),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("proposal_phases").insert({
    proposal_id: proposal.id,
    name: "Phase 1",
    sort_order: 0,
  });

  revalidatePath("/dashboard/proposals");
  return proposal.id;
}

function parseOptionalDate(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (!value || value.trim() === "") return null;
  return value;
}

export async function updateProposalMetaAction(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    status?: ProposalStatus;
    gst_rate?: number;
    complimentary_services?: string | null;
    custom_notes?: string | null;
    payment_terms?: string;
    proposal_date?: string | null;
    cost_sheet_date?: string | null;
    invoice_date?: string | null;
    due_date?: string | null;
    invoice_number?: string | null;
    discount_type?: "none" | "percent" | "fixed";
    discount_value?: number;
    discount_label?: string | null;
  }
) {
  await requireProfile();
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description;
  if (data.status !== undefined) update.status = data.status;
  if (data.gst_rate !== undefined) update.gst_rate = data.gst_rate;
  if (data.complimentary_services !== undefined)
    update.complimentary_services = data.complimentary_services;
  if (data.custom_notes !== undefined) update.custom_notes = data.custom_notes;
  if (data.payment_terms !== undefined)
    update.payment_terms = { text: data.payment_terms };
  if (data.proposal_date !== undefined)
    update.proposal_date = parseOptionalDate(data.proposal_date);
  if (data.cost_sheet_date !== undefined)
    update.cost_sheet_date = parseOptionalDate(data.cost_sheet_date);
  if (data.invoice_date !== undefined)
    update.invoice_date = parseOptionalDate(data.invoice_date);
  if (data.due_date !== undefined)
    update.due_date = parseOptionalDate(data.due_date);
  if (data.invoice_number !== undefined)
    update.invoice_number = data.invoice_number?.trim() || null;
  if (data.discount_type !== undefined) update.discount_type = data.discount_type;
  if (data.discount_value !== undefined)
    update.discount_value = data.discount_value;
  if (data.discount_label !== undefined)
    update.discount_label = data.discount_label?.trim() || "Discount";

  const { error } = await supabase.from("proposals").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${id}`);
  revalidatePath("/dashboard/proposals");
}

export async function stampInvoiceExportAction(proposalId: string) {
  await requireProfile();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("proposals")
    .select("invoice_number, invoice_date")
    .eq("id", proposalId)
    .single();

  const updates: Record<string, unknown> = {
    last_invoice_exported_at: now,
  };

  if (!existing?.invoice_date) {
    updates.invoice_date = now.slice(0, 10);
  }

  if (!existing?.invoice_number) {
    const y = new Date().getFullYear();
    const m = String(new Date().getMonth() + 1).padStart(2, "0");
    updates.invoice_number = `INV-${y}${m}-${proposalId.slice(0, 6).toUpperCase()}`;
  }

  await supabase.from("proposals").update(updates).eq("id", proposalId);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
  revalidatePath("/dashboard/proposals");
}

export async function addPhaseAction(proposalId: string, name: string) {
  await requireProfile();
  const supabase = await createClient();

  const { data: phases } = await supabase
    .from("proposal_phases")
    .select("sort_order")
    .eq("proposal_id", proposalId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (phases?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("proposal_phases").insert({
    proposal_id: proposalId,
    name,
    sort_order: nextOrder,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function updatePhaseInclusionAction(
  phaseId: string,
  proposalId: string,
  data: {
    include_in_proposal?: boolean;
    include_in_invoice?: boolean;
    include_in_cost_sheet?: boolean;
  }
) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_phases")
    .update(data)
    .eq("id", phaseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function updatePhaseAction(
  phaseId: string,
  proposalId: string,
  data: { name?: string; sort_order?: number }
) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_phases")
    .update(data)
    .eq("id", phaseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function deletePhaseAction(phaseId: string, proposalId: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_phases")
    .delete()
    .eq("id", phaseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function addGroupAction(
  phaseId: string,
  proposalId: string,
  data: { title: string; description?: string; amount: number }
) {
  await requireProfile();
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("proposal_groups")
    .select("sort_order")
    .eq("phase_id", phaseId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (groups?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("proposal_groups").insert({
    phase_id: phaseId,
    title: data.title,
    description: data.description ?? null,
    amount: data.amount,
    sort_order: nextOrder,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function updateGroupInclusionAction(
  groupId: string,
  proposalId: string,
  data: {
    include_in_proposal?: boolean;
    include_in_invoice?: boolean;
    include_in_cost_sheet?: boolean;
  }
) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_groups")
    .update(data)
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function updateGroupAction(
  groupId: string,
  proposalId: string,
  data: {
    title?: string;
    description?: string | null;
    amount?: number;
    sort_order?: number;
  }
) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_groups")
    .update(data)
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function deleteGroupAction(groupId: string, proposalId: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("proposal_groups")
    .delete()
    .eq("id", groupId);
  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/proposals/${proposalId}`);
}

export async function insertFromLibraryAction(
  phaseId: string,
  proposalId: string,
  libraryId: string
) {
  await requireProfile();
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("proposal_section_library")
    .select("*")
    .eq("id", libraryId)
    .single();

  if (!item) throw new Error("Library item not found");

  await addGroupAction(phaseId, proposalId, {
    title: item.title,
    description: item.description ?? undefined,
    amount: Number(item.default_amount),
  });
}

export async function deleteProposalAction(id: string) {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("proposals").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/proposals");
}
