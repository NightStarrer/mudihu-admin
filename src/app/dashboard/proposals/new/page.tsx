import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { NewProposalForm } from "@/components/proposals/new-proposal-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewProposalPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("company_name");

  return (
    <>
      <PageHeader
        title="New proposal"
        description="Start a new client proposal"
      />
      <Card className="border-border/60">
        <CardContent className="pt-6">
          <Suspense>
            <NewProposalForm clients={clients ?? []} />
          </Suspense>
        </CardContent>
      </Card>
    </>
  );
}
