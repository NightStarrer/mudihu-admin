import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProposalWithRelations } from "@/lib/proposals/fetch-proposal";
import { fetchProposalInvoices } from "@/lib/proposals/fetch-invoices";
import { getProposalBalanceSummary } from "@/app/actions/invoices";
import { PageHeader } from "@/components/layout/page-header";
import { ProposalBuilder } from "@/components/proposals/proposal-builder";

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await fetchProposalWithRelations(id);

  if (!proposal) notFound();

  const supabase = await createClient();
  const [{ data: library }, invoices, balance] = await Promise.all([
    supabase.from("proposal_section_library").select("*").order("title"),
    fetchProposalInvoices(id),
    getProposalBalanceSummary(id),
  ]);

  return (
    <>
      <PageHeader
        title={proposal.title}
        description={`Proposal for ${proposal.client.company_name}`}
      />
      <ProposalBuilder
        proposal={proposal}
        library={library ?? []}
        invoices={invoices}
        balance={
          balance ?? { total: 0, invoiced: 0, paid: 0, remaining: 0 }
        }
      />
    </>
  );
}
