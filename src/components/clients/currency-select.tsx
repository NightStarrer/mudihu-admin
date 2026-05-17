import { CURRENCY_OPTIONS } from "@/lib/money/currency";
import { Label } from "@/components/ui/label";

export function CurrencySelect({
  defaultValue = "INR",
}: {
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="currency_code">Billing currency</Label>
      <select
        id="currency_code"
        name="currency_code"
        defaultValue={defaultValue}
        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {CURRENCY_OPTIONS.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Used on proposals, invoices, and cost sheets for this client.
      </p>
    </div>
  );
}
