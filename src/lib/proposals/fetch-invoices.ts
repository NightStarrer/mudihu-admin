import { createClient } from "@/lib/supabase/server";
import type { ProposalInvoice } from "@/types/database";

export async function fetchProposalInvoices(
  proposalId: string
): Promise<ProposalInvoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposal_invoices")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchProposalInvoices:", error.message);
    return [];
  }

  return (data ?? []) as ProposalInvoice[];
}
