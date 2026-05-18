"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updatePhaseDiscountAction } from "@/app/actions/proposals";
import type { DiscountType } from "@/lib/proposals/discount";

export function PhaseDiscountFields({
  phaseId,
  proposalId,
  discountType,
  discountValue,
  discountLabel,
}: {
  phaseId: string;
  proposalId: string;
  discountType: string;
  discountValue: number;
  discountLabel: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const type = (discountType ?? "none") as DiscountType;

  function save(fields: {
    discount_type?: DiscountType;
    discount_value?: number;
    discount_label?: string | null;
  }) {
    startTransition(async () => {
      await updatePhaseDiscountAction(phaseId, proposalId, fields);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-3 sm:grid-cols-3">
      <p className="text-xs font-medium text-muted-foreground sm:col-span-3">
        Phase discount (applied before GST)
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">Type</Label>
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
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="percent">Percent</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Value</Label>
        <Input
          type="number"
          min={0}
          className="h-8 text-xs"
          defaultValue={type === "none" ? "" : discountValue}
          disabled={pending || type === "none"}
          onBlur={(e) =>
            save({ discount_value: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Label</Label>
        <Input
          className="h-8 text-xs"
          defaultValue={discountLabel ?? "Discount"}
          disabled={pending || type === "none"}
          onBlur={(e) =>
            save({
              discount_label: e.target.value.trim() || "Discount",
            })
          }
        />
      </div>
    </div>
  );
}
