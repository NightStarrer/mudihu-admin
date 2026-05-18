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

const CLIENT_COLUMNS =
  "id, agency_id, company_name, contact_person, email, phone, gst_number, address, business_category, industry_tags, project_brief, notes, currency_code, created_at, updated_at";

function normalizeClient(row: Record<string, unknown>): Client {
  const industryTags = row.industry_tags;
  return {
    ...(row as Omit<Client, "industry_tags" | "currency_code" | "project_brief">),
    industry_tags: Array.isArray(industryTags)
      ? (industryTags as string[])
      : [],
    currency_code:
      typeof row.currency_code === "string" && row.currency_code
        ? row.currency_code
        : "INR",
    project_brief: parseProjectBrief(row.project_brief),
  };
}

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

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select(CLIENT_COLUMNS)
    .eq("id", id)
    .single();

  if (clientError || !client) {
    console.error("Client fetch error:", clientError?.message);
    notFound();
  }

  const [
    { data: notes, error: notesError },
    { data: proposals, error: proposalsError },
  ] = await Promise.all([
    supabase
      .from("client_notes")
      .select("id, client_id, agency_id, content, created_by, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("proposals")
      .select("id, title, status, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (notesError) console.error("Client notes fetch error:", notesError.message);
  if (proposalsError)
    console.error("Client proposals fetch error:", proposalsError.message);

  const typedClient = normalizeClient(client as Record<string, unknown>);
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
        client={typedClient}
        notes={notes ?? []}
        proposals={proposals ?? []}
        initialTab={tab}
      />
    </>
  );
}
