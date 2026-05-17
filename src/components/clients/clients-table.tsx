"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clientBriefHref } from "@/components/clients/client-detail-tabs";
import type { Client } from "@/types/database";
import {
  isBriefComplete,
  parseProjectBrief,
} from "@/types/client-project-brief";

export function ClientsTable({
  clients,
  initialQuery,
}: {
  clients: Client[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/dashboard/clients?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="w-full max-w-sm">
        <Input
          placeholder="Search clients…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      <div className="rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => {
                const brief = parseProjectBrief(client.project_brief);
                const complete = isBriefComplete(brief);
                return (
                  <TableRow
                    key={client.id}
                    className="hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {client.company_name}
                        </Link>
                        {!complete ? (
                          <Badge variant="outline" className="w-fit text-xs">
                            Brief incomplete
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{client.contact_person ?? "—"}</TableCell>
                    <TableCell>
                      {client.business_category ? (
                        <Badge variant="secondary">
                          {client.business_category}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{client.email ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={clientBriefHref(client.id)}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "inline-flex items-center"
                        )}
                      >
                        <ClipboardList className="mr-1.5 h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Brief</span>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
