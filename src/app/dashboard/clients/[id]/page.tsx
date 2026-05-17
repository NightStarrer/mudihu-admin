import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { ClientNotes } from "@/components/clients/client-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Client } from "@/types/database";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <>
      <PageHeader
        title={(client as Client).company_name}
        description="Client profile and history"
        action={
          <Link
            href={`/dashboard/proposals/new?client=${id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            New proposal
          </Link>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="border-border/60">
            <CardContent className="pt-6">
              <ClientForm client={client as Client} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <ClientNotes clientId={id} notes={notes ?? []} />
        </TabsContent>

        <TabsContent value="proposals">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Proposals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!proposals?.length ? (
                <p className="text-sm text-muted-foreground">No proposals yet.</p>
              ) : (
                proposals.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/proposals/${p.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <span className="font-medium">{p.title}</span>
                    <Badge variant="secondary" className="capitalize">
                      {p.status}
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
