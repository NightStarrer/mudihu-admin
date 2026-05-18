-- Optional line-item discount (percent or fixed) shown on PDFs and in totals
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS discount_type TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS discount_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_label TEXT DEFAULT 'Discount';
