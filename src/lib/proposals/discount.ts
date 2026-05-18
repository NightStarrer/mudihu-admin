export type DiscountType = "none" | "percent" | "fixed";

export type DiscountOptions = {
  type: DiscountType;
  value: number;
  label: string;
};

export function applyDiscount(
  subtotal: number,
  { type, value }: DiscountOptions
): { discountAmount: number; afterDiscount: number } {
  if (type === "none" || value <= 0 || subtotal <= 0) {
    return { discountAmount: 0, afterDiscount: subtotal };
  }

  let discountAmount = 0;
  if (type === "percent") {
    discountAmount = subtotal * (Math.min(value, 100) / 100);
  } else {
    discountAmount = value;
  }

  discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
  return {
    discountAmount,
    afterDiscount: subtotal - discountAmount,
  };
}

/** Label for a per-phase discount line in UI and PDFs. */
export function phaseDiscountLineLabel(
  phaseName: string,
  customLabel?: string | null
): string {
  const custom = customLabel?.trim();
  if (custom && custom !== "Discount") {
    return `${phaseName}: ${custom}`;
  }
  return `${phaseName} discount`;
}

export function discountSummaryLine(
  opts: DiscountOptions,
  discountAmount: number
): string {
  if (discountAmount <= 0) return opts.label;
  if (opts.type === "percent") {
    return `${opts.label} (${opts.value}%)`;
  }
  return opts.label;
}
