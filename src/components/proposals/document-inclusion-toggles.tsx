"use client";

import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "include_in_proposal" as const, label: "Proposal" },
  { key: "include_in_invoice" as const, label: "Invoice" },
  { key: "include_in_cost_sheet" as const, label: "Cost sheet" },
];

export function DocumentInclusionToggles({
  values,
  onChange,
  compact,
  disabled,
}: {
  values: {
    include_in_proposal: boolean;
    include_in_invoice: boolean;
    include_in_cost_sheet: boolean;
  };
  onChange: (key: (typeof OPTIONS)[number]["key"], checked: boolean) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn("flex flex-wrap", compact ? "gap-2" : "gap-3")}
      role="group"
      aria-label="Include in documents"
    >
      {OPTIONS.map(({ key, label }) => (
        <label
          key={key}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs has-disabled:cursor-not-allowed has-disabled:opacity-50",
            compact && "px-1.5 py-1"
          )}
        >
          <input
            type="checkbox"
            className="size-3.5 shrink-0 accent-primary"
            checked={values[key]}
            disabled={disabled}
            onChange={(e) => onChange(key, e.target.checked)}
          />
          <span className="text-muted-foreground">{label}</span>
        </label>
      ))}
    </div>
  );
}
