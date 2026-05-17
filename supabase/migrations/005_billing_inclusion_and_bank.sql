-- Per-document inclusion flags for phases and line items
ALTER TABLE proposal_phases
  ADD COLUMN IF NOT EXISTS include_in_proposal BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_in_invoice BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_in_cost_sheet BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE proposal_groups
  ADD COLUMN IF NOT EXISTS include_in_proposal BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_in_invoice BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS include_in_cost_sheet BOOLEAN NOT NULL DEFAULT true;

-- Bank details for invoices and cost sheets
ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS bank_upi_id TEXT,
  ADD COLUMN IF NOT EXISTS show_bank_on_documents BOOLEAN NOT NULL DEFAULT true;
