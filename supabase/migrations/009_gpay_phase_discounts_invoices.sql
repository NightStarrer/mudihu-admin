-- GPay on branding
ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS gpay_name TEXT,
  ADD COLUMN IF NOT EXISTS gpay_number TEXT;

-- Per-phase discounts
ALTER TABLE proposal_phases
  ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_label TEXT DEFAULT 'Discount';

-- Phase-based invoice records
CREATE TABLE IF NOT EXISTS proposal_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES proposal_phases(id) ON DELETE CASCADE,
  billing_percent NUMERIC(5,2) NOT NULL,
  amount_subtotal NUMERIC(12,2) NOT NULL,
  amount_gst NUMERIC(12,2) NOT NULL,
  amount_total NUMERIC(12,2) NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_invoices_proposal ON proposal_invoices(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_invoices_phase ON proposal_invoices(phase_id);

ALTER TABLE proposal_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposal_invoices_all ON proposal_invoices FOR ALL
  USING (agency_id = auth_agency_id())
  WITH CHECK (agency_id = auth_agency_id());
