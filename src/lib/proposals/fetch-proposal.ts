import { createClient } from "@/lib/supabase/server";
import type { ProposalWithRelations } from "@/types/database";

export async function fetchProposalWithRelations(
  id: string
): Promise<ProposalWithRelations | null> {
  const supabase = await createClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("*, client:clients(*)")
    .eq("id", id)
    .single();

  if (!proposal) return null;

  const { data: phases } = await supabase
    .from("proposal_phases")
    .select("*")
    .eq("proposal_id", id)
    .order("sort_order");

  const phaseIds = (phases ?? []).map((p) => p.id);
  let groups: { phase_id: string; [key: string]: unknown }[] = [];

  if (phaseIds.length > 0) {
    const { data: groupData } = await supabase
      .from("proposal_groups")
      .select("*")
      .in("phase_id", phaseIds)
      .order("sort_order");
    groups = groupData ?? [];
  }

  const phasesWithGroups = (phases ?? []).map((phase) => ({
    ...phase,
    groups: groups
      .filter((g) => g.phase_id === phase.id)
      .map((g) => ({
        id: g.id as string,
        phase_id: g.phase_id as string,
        title: g.title as string,
        description: g.description as string | null,
        amount: Number(g.amount),
        sort_order: g.sort_order as number,
      })),
  }));

  return {
    ...(proposal as Omit<ProposalWithRelations, "phases" | "client">),
    client: proposal.client as ProposalWithRelations["client"],
    phases: phasesWithGroups,
  };
}
