"use client";

import { cn } from "@/lib/utils";

export function CheckboxGroup({
  name,
  options,
  defaultValues = [],
  className,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValues?: string[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-muted/50 has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            defaultChecked={defaultValues.includes(opt.value)}
            className="h-4 w-4 rounded border-input"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}
