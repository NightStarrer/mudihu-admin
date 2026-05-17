-- Per-client currency for proposals, invoices, and cost sheets
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'INR';

-- Document dates and invoice tracking (admin-set + export audit)
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS proposal_date DATE,
  ADD COLUMN IF NOT EXISTS cost_sheet_date DATE,
  ADD COLUMN IF NOT EXISTS invoice_date DATE,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS last_invoice_exported_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_proposals_invoice_date ON proposals(invoice_date);
CREATE INDEX IF NOT EXISTS idx_proposals_invoice_number ON proposals(invoice_number);
