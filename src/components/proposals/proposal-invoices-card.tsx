"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  createProposalInvoiceAction,
  deleteProposalInvoiceAction,
  markProposalInvoicePaidAction,
} from "@/app/actions/invoices";
import { formatMoney } from "@/lib/money/currency";
import type { ProposalInvoice, ProposalWithRelations } from "@/types/database";
import { toast } from "sonner";
import { Download, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import {
  calculateInvoiceSlice,
  calculatePhaseAfterDiscount,
  calculatePhaseSubtotal,
} from "@/lib/proposals/calculate-totals";
import type { PhaseWithGroups } from "@/lib/proposals/calculate-totals";

export function ProposalInvoicesCard({
  proposal,
  invoices,
  balance,
}: {
  proposal: ProposalWithRelations;
  invoices: ProposalInvoice[];
  balance: {
    total: number;
    invoiced: number;
    paid: number;
    remaining: number;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const [phaseId, setPhaseId] = useState(proposal.phases[0]?.id ?? "");
  const [billingPercent, setBillingPercent] = useState("100");
  const [dueDate, setDueDate] = useState("");

  const currency = proposal.client.currency_code ?? "INR";
  const fmt = (n: number) => formatMoney(n, currency);
  const gstRate = Number(proposal.gst_rate);

  const selectedPhase = proposal.phases.find((p) => p.id === phaseId);
  const preview =
    selectedPhase && selectedPhase.groups.length
      ? calculateInvoiceSlice(
          selectedPhase as PhaseWithGroups,
          Number(billingPercent) || 0,
          gstRate
        )
      : null;

  async function handleCreate() {
    if (!phaseId) {
      toast.error("Select a phase");
      return;
    }
    const pct = Number(billingPercent);
    if (!pct || pct <= 0 || pct > 100) {
      toast.error("Enter a percentage between 1 and 100");
      return;
    }
    startTransition(async () => {
      try {
        await createProposalInvoiceAction(proposal.id, {
          phaseId,
          billingPercent: pct,
          dueDate: dueDate || null,
        });
        toast.success("Invoice created");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to create");
      }
    });
  }

  async function handleExportPdf(invoiceId: string) {
    setExportingId(invoiceId);
    try {
      const res = await fetch("/api/pdf/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          documentType: "invoice",
          invoiceId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      window.open(data.url, "_blank");
      toast.success("PDF generated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingId(null);
    }
  }

  async function handleEmail(invoiceId: string) {
    const to = proposal.client.email;
    if (!to) {
      toast.error("Client has no email on file");
      return;
    }
    setEmailingId(invoiceId);
    try {
      const res = await fetch("/api/pdf/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          documentType: "invoice",
          invoiceId,
          toEmail: to,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      toast.success(`Invoice emailed to ${to}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email failed");
    } finally {
      setEmailingId(null);
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Invoices</CardTitle>
        <p className="text-sm text-muted-foreground">
          Bill a percentage of a phase subtotal. Mark paid when received.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Project total</p>
            <p className="font-medium">{fmt(balance.total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Invoiced</p>
            <p className="font-medium">{fmt(balance.invoiced)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="font-medium text-primary">{fmt(balance.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="font-medium">{fmt(balance.remaining)}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <p className="text-sm font-medium">Create invoice</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phase</Label>
              <Select
                value={phaseId}
                onValueChange={(v) => v && setPhaseId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {proposal.phases.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing % of phase</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={billingPercent}
                onChange={(e) => setBillingPercent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Due date (optional)</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          {selectedPhase && preview ? (
            <p className="text-xs text-muted-foreground">
              Phase subtotal {fmt(calculatePhaseSubtotal(selectedPhase as PhaseWithGroups))}
              {" → "}
              after discount {fmt(calculatePhaseAfterDiscount(selectedPhase as PhaseWithGroups))}
              {" → "}
              invoice {fmt(preview.amountTotal)} (incl. GST)
            </p>
          ) : null}
          <Button
            size="sm"
            disabled={pending || !proposal.phases.length}
            onClick={handleCreate}
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create invoice
          </Button>
        </div>

        {!invoices.length ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{inv.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {fmt(Number(inv.amount_total))} · {inv.billing_percent}% ·{" "}
                    {inv.invoice_date}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={inv.status === "paid" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {inv.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportingId === inv.id}
                    onClick={() => handleExportPdf(inv.id)}
                  >
                    {exportingId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={emailingId === inv.id || !proposal.client.email}
                    onClick={() => handleEmail(inv.id)}
                    title={
                      proposal.client.email
                        ? `Email ${proposal.client.email}`
                        : "No client email"
                    }
                  >
                    {emailingId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                  {inv.status !== "paid" ? (
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await markProposalInvoicePaidAction(
                              inv.id,
                              proposal.id
                            );
                            toast.success("Marked as paid");
                            router.refresh();
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Failed"
                            );
                          }
                        })
                      }
                    >
                      Mark paid
                    </Button>
                  ) : null}
                  {inv.status !== "paid" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await deleteProposalInvoiceAction(
                              inv.id,
                              proposal.id
                            );
                            toast.success("Invoice deleted");
                            router.refresh();
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Failed"
                            );
                          }
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
