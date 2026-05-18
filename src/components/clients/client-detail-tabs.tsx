"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientForm } from "@/components/clients/client-form";
import { ClientProjectBriefForm } from "@/components/clients/client-project-brief-form";
import { ClientNotes } from "@/components/clients/client-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Client, ClientNote, ProposalStatus } from "@/types/database";

const VALID_TABS = ["overview", "brief", "notes", "proposals"] as const;
type ClientTab = (typeof VALID_TABS)[number];

function parseTab(tab: string | undefined): ClientTab {
  if (tab && VALID_TABS.includes(tab as ClientTab)) return tab as ClientTab;
  return "overview";
}

function tabHref(clientId: string, tab: ClientTab) {
  return tab === "overview"
    ? `/dashboard/clients/${clientId}`
    : `/dashboard/clients/${clientId}?tab=${tab}`;
}

export function ClientDetailTabs({
  client,
  notes,
  proposals,
  initialTab,
}: {
  client: Client;
  notes: ClientNote[];
  proposals: { id: string; title: string; status: ProposalStatus; created_at: string }[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<ClientTab>(() => parseTab(initialTab));

  useEffect(() => {
    setTab(parseTab(initialTab));
  }, [initialTab]);

  function onTabChange(value: string) {
    const next = parseTab(value);
    setTab(next);
    const href = tabHref(client.id, next);
    window.history.replaceState(null, "", href);
  }

  return (
    <Tabs value={tab} onValueChange={onTabChange} className="space-y-4 sm:space-y-6">
      <TabsList className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="brief">Project brief</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="proposals">Proposals</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" keepMounted>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <ClientForm client={client} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="brief" keepMounted>
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <ClientProjectBriefForm client={client} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notes" keepMounted>
        <ClientNotes clientId={client.id} notes={notes} />
      </TabsContent>

      <TabsContent value="proposals" keepMounted>
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-lg">Proposals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!proposals.length ? (
              <p className="text-sm text-muted-foreground">No proposals yet.</p>
            ) : (
              proposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/proposals/${p.id}`}
                  className="flex flex-col gap-2 rounded-lg border p-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
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
  );
}

export function clientBriefHref(clientId: string) {
  return tabHref(clientId, "brief");
}
