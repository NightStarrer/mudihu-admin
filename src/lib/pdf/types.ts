export type PdfInvoiceOverride = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  amountSubtotal: number;
  amountGst: number;
  amountTotal: number;
  billingPercent: number;
  phaseName: string;
};
