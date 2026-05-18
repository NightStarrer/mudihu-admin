"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import {
  createProposalInvoiceAction,
  deleteProposalInvoiceAction,
  markProposalInvoicePaidAction,
  updateProposalInvoiceStatusAction,
} from "@/app/actions/invoices";
import { formatMoney } from "@/lib/money/currency";
import { phaseDiscountLineLabel } from "@/lib/proposals/discount";
import type {
  ProposalInvoice,
  ProposalInvoiceStatus,
  ProposalWithRelations,
} from "@/types/database";
import { toast } from "sonner";
import { downloadPdfDataUrl } from "@/lib/pdf/download-client";
import { Download, Loader2, Mail, Plus, Trash2 } from "lucide-react";
import {
  calculateInvoiceSlice,
  calculatePhaseAfterDiscount,
  calculatePhaseSubtotal,
  discountFromPhase,
  hasGstRate,
} from "@/lib/proposals/calculate-totals";
import type { PhaseWithGroups } from "@/lib/proposals/calculate-totals";

const INVOICE_STATUSES: ProposalInvoiceStatus[] = ["draft", "sent", "paid"];

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
  const showGst = hasGstRate(gstRate);
  const clientEmail = proposal.client.email?.trim() ?? "";
  const clientEditHref = `/dashboard/clients/${proposal.client.id}`;

  useEffect(() => {
    if (!proposal.phases.some((p) => p.id === phaseId)) {
      setPhaseId(proposal.phases[0]?.id ?? "");
    }
  }, [proposal.phases, phaseId]);

  const selectedPhase = proposal.phases.find((p) => p.id === phaseId);
  const preview =
    selectedPhase && selectedPhase.groups.length
      ? calculateInvoiceSlice(
          selectedPhase as PhaseWithGroups,
          Number(billingPercent) || 0,
          gstRate
        )
      : null;

  const phaseDiscountLabel =
    selectedPhase &&
    discountFromPhase(selectedPhase).type !== "none" &&
    calculatePhaseSubtotal(selectedPhase as PhaseWithGroups) >
      calculatePhaseAfterDiscount(selectedPhase as PhaseWithGroups)
      ? phaseDiscountLineLabel(
          selectedPhase.name,
          selectedPhase.discount_label
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
      downloadPdfDataUrl(
        data.url as string,
        (data.filename as string) ?? "invoice.pdf"
      );
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingId(null);
    }
  }

  async function handleEmail(invoiceId: string) {
    if (!clientEmail) {
      toast.error("Add a client email before sending");
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
          toEmail: clientEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      toast.success(`Invoice emailed to ${clientEmail}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Email failed");
    } finally {
      setEmailingId(null);
    }
  }

  function phaseNameForInvoice(inv: ProposalInvoice) {
    return proposal.phases.find((p) => p.id === inv.phase_id)?.name ?? "Phase";
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Milestone invoices</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create one invoice per billing milestone (e.g. 50% of Phase 1). Each
          gets its own number and PDF. Status: <strong>Draft</strong> until you
          email or mark sent; <strong>Sent</strong> after email;{" "}
          <strong>Paid</strong> when received.
        </p>
        {!clientEmail ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Email is disabled —{" "}
            <Link href={clientEditHref} className="font-medium underline">
              add an email on the client record
            </Link>{" "}
            to send invoices from here.
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Full proposal value</p>
            <p className="font-medium">{fmt(balance.total)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">On invoices</p>
            <p className="font-medium">{fmt(balance.invoiced)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="font-medium text-primary">{fmt(balance.paid)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Still to collect</p>
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
                <SelectTrigger className="w-full">
                  <span className="truncate">
                    {selectedPhase?.name ?? "Select phase"}
                  </span>
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
            <div className="rounded-md bg-background px-3 py-2 text-sm">
              <p className="font-medium text-foreground">
                This invoice: {fmt(preview.amountTotal)}
                {showGst ? ` (includes ${gstRate}% GST)` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {billingPercent}% of {selectedPhase.name}: subtotal{" "}
                {fmt(calculatePhaseSubtotal(selectedPhase as PhaseWithGroups))}
                {phaseDiscountLabel
                  ? ` → after ${phaseDiscountLabel} ${fmt(
                      calculatePhaseAfterDiscount(
                        selectedPhase as PhaseWithGroups
                      )
                    )}`
                  : null}
              </p>
            </div>
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
            {invoices.map((inv) => {
              const phaseName = phaseNameForInvoice(inv);
              return (
                <li
                  key={inv.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {phaseName} · {fmt(Number(inv.amount_total))} ·{" "}
                      {inv.billing_percent}% · {inv.invoice_date}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={inv.status}
                      disabled={pending}
                      onValueChange={(v) => {
                        if (!v) return;
                        const status = v as ProposalInvoiceStatus;
                        startTransition(async () => {
                          try {
                            if (status === "paid") {
                              await markProposalInvoicePaidAction(
                                inv.id,
                                proposal.id
                              );
                            } else {
                              await updateProposalInvoiceStatusAction(
                                inv.id,
                                proposal.id,
                                status
                              );
                            }
                            router.refresh();
                          } catch (err) {
                            toast.error(
                              err instanceof Error ? err.message : "Failed"
                            );
                          }
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[110px] capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={exportingId === inv.id}
                      onClick={() => handleExportPdf(inv.id)}
                      title="Download PDF"
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
                      disabled={emailingId === inv.id || !clientEmail}
                      onClick={() => handleEmail(inv.id)}
                      title={
                        clientEmail
                          ? `Email PDF to ${clientEmail}`
                          : "Add client email to enable"
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
                        title="Delete invoice"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
