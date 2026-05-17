import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageActions } from "@/components/layout/page-actions";
import { buttonVariants } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { getJoinedCompanyName } from "@/lib/supabase/relations";
import { formatPdfDateShort } from "@/lib/pdf/dates";

export default async function ProposalsPage() {
  const supabase = await createClient();
  const { data: proposals } = await supabase
    .from("proposals")
    .select(
      "id, title, status, created_at, invoice_date, invoice_number, client:clients(company_name)"
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Build and export professional client proposals"
        action={
          <PageActions>
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
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Invoice</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!proposals?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No proposals yet
                </TableCell>
              </TableRow>
            ) : (
              proposals.map((p) => (
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
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {p.invoice_number ? (
                      <span className="block font-medium text-foreground">
                        {p.invoice_number}
                      </span>
                    ) : null}
                    {p.invoice_date ? (
                      <span>{formatPdfDateShort(p.invoice_date)}</span>
                    ) : (
                      !p.invoice_number && "—"
                    )}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
