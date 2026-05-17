import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageActions } from "@/components/layout/page-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/proposals/calculate-totals";
import { getJoinedCompanyName } from "@/lib/supabase/relations";
import { DashboardStats } from "@/components/dashboard/stats";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ count: clientCount }, { data: proposals }, { data: phases }] =
    await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase
        .from("proposals")
        .select("id, title, status, gst_rate, client:clients(company_name), created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("proposal_phases").select("proposal_id"),
    ]);

  const proposalIds = [...new Set((phases ?? []).map((p) => p.proposal_id))];
  let pipelineValue = 0;

  if (proposalIds.length > 0) {
    const { data: allPhases } = await supabase
      .from("proposal_phases")
      .select("id, proposal_id")
      .in("proposal_id", proposalIds);

    const phaseIds = (allPhases ?? []).map((p) => p.id);
    if (phaseIds.length > 0) {
      const { data: groups } = await supabase
        .from("proposal_groups")
        .select("phase_id, amount")
        .in("phase_id", phaseIds);

      const phaseToProposal = new Map(
        (allPhases ?? []).map((p) => [p.id, p.proposal_id])
      );
      const proposalGst = new Map(
        (proposals ?? []).map((p) => [p.id, Number(p.gst_rate)])
      );

      const subtotals = new Map<string, number>();
      for (const g of groups ?? []) {
        const pid = phaseToProposal.get(g.phase_id);
        if (!pid) continue;
        subtotals.set(pid, (subtotals.get(pid) ?? 0) + Number(g.amount));
      }

      for (const [pid, sub] of subtotals) {
        const gst = proposalGst.get(pid) ?? 18;
        pipelineValue += sub * (1 + gst / 100);
      }
    }
  }

  const draftCount =
    proposals?.filter((p) => p.status === "draft").length ?? 0;
  const sentCount = proposals?.filter((p) => p.status === "sent").length ?? 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="MuDiHu agency operations at a glance"
        action={
          <PageActions>
            <Link
              href="/dashboard/clients/new"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <Plus className="mr-2 h-4 w-4" />
              New client
            </Link>
            <Link
              href="/dashboard/proposals/new"
              className={cn(buttonVariants(), "bg-primary")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New proposal
            </Link>
          </PageActions>
        }
      />

      <DashboardStats
        clientCount={clientCount ?? 0}
        draftCount={draftCount}
        sentCount={sentCount}
        pipelineValue={pipelineValue}
      />

      <Card className="mt-8 border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Recent proposals</CardTitle>
        </CardHeader>
        <CardContent>
          {!proposals?.length ? (
            <p className="text-sm text-muted-foreground">
              No proposals yet. Create your first proposal to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      {getJoinedCompanyName(p.client)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/proposals/${p.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                      >
                        Open
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Pipeline value (incl. GST): {formatINR(pipelineValue)}
      </p>
    </>
  );
}
