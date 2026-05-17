/** Supported billing currencies (per client). */
export const CURRENCY_OPTIONS = [
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "SGD", label: "Singapore Dollar (SGD)" },
] as const;

export type CurrencyCode = (typeof CURRENCY_OPTIONS)[number]["code"];

type CurrencyConfig = {
  code: CurrencyCode;
  /** Shown in web UI (Intl). */
  intlCode: string;
  /** PDF-safe prefix — Helvetica lacks ₹, so INR uses "Rs." */
  pdfPrefix: string;
  locale: string;
};

const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: "INR", intlCode: "INR", pdfPrefix: "Rs.", locale: "en-IN" },
  USD: { code: "USD", intlCode: "USD", pdfPrefix: "$", locale: "en-US" },
  EUR: { code: "EUR", intlCode: "EUR", pdfPrefix: "EUR", locale: "de-DE" },
  GBP: { code: "GBP", intlCode: "GBP", pdfPrefix: "GBP", locale: "en-GB" },
  AED: { code: "AED", intlCode: "AED", pdfPrefix: "AED", locale: "en-AE" },
  SGD: { code: "SGD", intlCode: "SGD", pdfPrefix: "S$", locale: "en-SG" },
};

export function getCurrency(code: string | null | undefined): CurrencyConfig {
  if (code && CURRENCIES[code]) return CURRENCIES[code];
  return CURRENCIES.INR;
}

export function formatMoney(
  amount: number,
  currencyCode: string | null | undefined
): string {
  const c = getCurrency(currencyCode);
  return new Intl.NumberFormat(c.locale, {
    style: "currency",
    currency: c.intlCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Use in @react-pdf/renderer — avoids broken Unicode currency glyphs. */
export function formatPdfMoney(
  amount: number,
  currencyCode: string | null | undefined
): string {
  const c = getCurrency(currencyCode);
  const n = amount.toLocaleString(c.locale, { maximumFractionDigits: 0 });
  if (c.pdfPrefix === "$") return `$${n}`;
  if (c.pdfPrefix === "S$") return `S$${n}`;
  return `${c.pdfPrefix} ${n}`;
}

export function currencySymbolForUi(code: string | null | undefined): string {
  const c = getCurrency(code);
  const sample = formatMoney(0, c.code).replace(/[\d.,\s]/g, "").trim();
  return sample || c.pdfPrefix;
}
