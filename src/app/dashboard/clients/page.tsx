import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientsTable } from "@/components/clients/clients-table";
import { Plus } from "lucide-react";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("*")
    .order("company_name");

  if (q) {
    query = query.or(
      `company_name.ilike.%${q}%,contact_person.ilike.%${q}%,email.ilike.%${q}%,business_category.ilike.%${q}%`
    );
  }

  const { data: clients } = await query;

  return (
    <>
      <PageHeader
        title="Clients"
        description="Manage client relationships and project history"
        action={
          <Link
            href="/dashboard/clients/new"
            className={cn(buttonVariants(), "bg-primary")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add client
          </Link>
        }
      />
      <ClientsTable clients={clients ?? []} initialQuery={q ?? ""} />
    </>
  );
}
