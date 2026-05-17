"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
import { updateProposalMetaAction } from "@/app/actions/proposals";
import type { DiscountType } from "@/lib/proposals/discount";

export function DiscountFields({
  proposalId,
  discountType,
  discountValue,
  discountLabel,
}: {
  proposalId: string;
  discountType: string;
  discountValue: number;
  discountLabel: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function save(fields: {
    discount_type?: DiscountType;
    discount_value?: number;
    discount_label?: string | null;
  }) {
    startTransition(async () => {
      await updateProposalMetaAction(proposalId, fields);
      router.refresh();
    });
  }

  const type = (discountType ?? "none") as DiscountType;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Discount</CardTitle>
        <p className="text-sm text-muted-foreground">
          Optional. Shown as a separate line on the PDF before GST — standard on
          professional proposals and invoices.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label>Type</Label>
          <Select
            defaultValue={type}
            disabled={pending}
            onValueChange={(v) => {
              if (!v) return;
              save({
                discount_type: v as DiscountType,
                discount_value: v === "none" ? 0 : discountValue,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No discount</SelectItem>
              <SelectItem value="percent">Percentage (%)</SelectItem>
              <SelectItem value="fixed">Fixed amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            {type === "percent"
              ? "Percent off"
              : type === "fixed"
                ? "Amount off"
                : "Value"}
          </Label>
          <Input
            type="number"
            min={0}
            max={type === "percent" ? 100 : undefined}
            defaultValue={type === "none" ? "" : discountValue}
            disabled={pending || type === "none"}
            placeholder={type === "percent" ? "e.g. 15" : "e.g. 10000"}
            onBlur={(e) =>
              save({ discount_value: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Line label on PDF</Label>
          <Input
            defaultValue={discountLabel ?? "Discount"}
            disabled={pending || type === "none"}
            placeholder="Relationship discount"
            onBlur={(e) =>
              save({
                discount_label: e.target.value.trim() || "Discount",
              })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
