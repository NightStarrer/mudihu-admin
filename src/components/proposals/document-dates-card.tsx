"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProposalMetaAction } from "@/app/actions/proposals";
import { toDateInputValue, formatPdfDateShort } from "@/lib/pdf/dates";
import type { ProposalWithRelations } from "@/types/database";

function DateField({
  label,
  id,
  defaultValue,
  onBlur,
  hint,
}: {
  label: string;
  id: string;
  defaultValue: string;
  onBlur: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        defaultValue={defaultValue}
        onBlur={(e) => onBlur(e.target.value)}
      />
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function DocumentDatesCard({
  proposal,
}: {
  proposal: ProposalWithRelations;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function save(
    fields: Parameters<typeof updateProposalMetaAction>[1]
  ) {
    startTransition(async () => {
      await updateProposalMetaAction(proposal.id, fields);
      router.refresh();
    });
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-lg">Dates & invoice tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Set dates before exporting PDFs. Empty dates default to today on the
          PDF. Invoice fields help admins filter and track billing.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            label="Proposal date"
            id="proposal_date"
            defaultValue={toDateInputValue(proposal.proposal_date)}
            onBlur={(v) => save({ proposal_date: v || null })}
          />
          <DateField
            label="Cost sheet date"
            id="cost_sheet_date"
            defaultValue={toDateInputValue(proposal.cost_sheet_date)}
            onBlur={(v) => save({ cost_sheet_date: v || null })}
          />
          <DateField
            label="Invoice date"
            id="invoice_date"
            defaultValue={toDateInputValue(proposal.invoice_date)}
            hint="Shown on tax invoices; auto-filled on first invoice export if blank."
            onBlur={(v) => save({ invoice_date: v || null })}
          />
          <DateField
            label="Payment due date"
            id="due_date"
            defaultValue={toDateInputValue(proposal.due_date)}
            onBlur={(v) => save({ due_date: v || null })}
          />
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="invoice_number">Invoice number</Label>
            <Input
              id="invoice_number"
              defaultValue={proposal.invoice_number ?? ""}
              placeholder="Auto-generated on first invoice export if empty"
              disabled={pending}
              onBlur={(e) =>
                save({ invoice_number: e.target.value.trim() || null })
              }
            />
          </div>
        </div>
        {proposal.last_invoice_exported_at ? (
          <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Last invoice PDF exported:{" "}
            <span className="font-medium text-foreground">
              {new Date(proposal.last_invoice_exported_at).toLocaleString(
                "en-IN"
              )}
            </span>
            {proposal.invoice_date ? (
              <>
                {" "}
                · Invoice date on file:{" "}
                {formatPdfDateShort(proposal.invoice_date)}
              </>
            ) : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
