import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { PageActions } from "@/components/layout/page-actions";
import {
  ClientDetailTabs,
  clientBriefHref,
} from "@/components/clients/client-detail-tabs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/database";
import { parseProjectBrief } from "@/types/client-project-brief";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const [{ data: notes }, { data: proposals }] = await Promise.all([
    supabase
      .from("client_notes")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("proposals")
      .select("id, title, status, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const typedClient = client as Client;
  const showEditBrief = tab !== "brief";

  return (
    <>
      <PageHeader
        title={typedClient.company_name}
        description="Client profile and project brief"
        action={
          <PageActions>
            {showEditBrief ? (
              <Link
                href={clientBriefHref(id)}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Edit brief
              </Link>
            ) : null}
            <Link
              href={`/dashboard/proposals/new?client=${id}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              New proposal
            </Link>
          </PageActions>
        }
      />

      <ClientDetailTabs
        client={{
          ...typedClient,
          project_brief: parseProjectBrief(typedClient.project_brief),
        }}
        notes={notes ?? []}
        proposals={proposals ?? []}
        initialTab={tab}
      />
    </>
  );
}
