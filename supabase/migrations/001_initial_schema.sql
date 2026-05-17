-- MuDiHu Operations OS — initial schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'accepted', 'archived');

CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'employee',
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE branding_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL UNIQUE REFERENCES agencies(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#7B1E3A',
  secondary_color TEXT NOT NULL DEFAULT '#0A0A0A',
  background_color TEXT NOT NULL DEFAULT '#F8F5F0',
  font_family TEXT NOT NULL DEFAULT 'Helvetica',
  footer_text TEXT DEFAULT 'MuDiHu — Muttugodu Digital Hub',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  gst_number TEXT,
  address TEXT,
  business_category TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status proposal_status NOT NULL DEFAULT 'draft',
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  payment_terms JSONB DEFAULT '{}',
  timeline JSONB DEFAULT '[]',
  complimentary_services TEXT,
  custom_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proposal_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE proposal_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES proposal_phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE proposal_section_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  default_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT
);

CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  config JSONB DEFAULT '{}'
);

CREATE TABLE pdf_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_proposals_agency ON proposals(agency_id);
CREATE INDEX idx_proposals_client ON proposals(client_id);
CREATE INDEX idx_proposal_phases_proposal ON proposal_phases(proposal_id);
CREATE INDEX idx_proposal_groups_phase ON proposal_groups(phase_id);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_agency_id UUID;
BEGIN
  SELECT id INTO default_agency_id FROM agencies LIMIT 1;
  IF default_agency_id IS NOT NULL THEN
    INSERT INTO profiles (id, agency_id, role, full_name)
    VALUES (NEW.id, default_agency_id, 'employee', NEW.raw_user_meta_data->>'full_name');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

INSERT INTO agencies (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'MuDiHu — Muttugodu Digital Hub');

INSERT INTO branding_settings (agency_id, footer_text)
VALUES ('00000000-0000-0000-0000-000000000001', 'MuDiHu — Muttugodu Digital Hub | Confidential');

INSERT INTO proposal_section_library (agency_id, title, description, default_amount, category) VALUES
('00000000-0000-0000-0000-000000000001', 'UI/UX & Frontend Platform Development', 'Design system, responsive interfaces, and client-facing experience layer.', 25000, 'foundation'),
('00000000-0000-0000-0000-000000000001', 'Backend Scalability Foundation', 'API architecture, database design, and extensibility for future modules.', 30000, 'foundation'),
('00000000-0000-0000-0000-000000000001', 'Customer Experience Features', 'Interconnected user journeys, engagement flows, and conversion optimization.', 20000, 'experience'),
('00000000-0000-0000-0000-000000000001', 'Lead Management & Admin Operations', 'CRM-style workflows, notifications, and operational dashboards.', 18000, 'operations'),
('00000000-0000-0000-0000-000000000001', 'Local SEO & Google Business Optimization', 'Local visibility, GMB setup, and citation consistency.', 12000, 'marketing');

INSERT INTO pdf_templates (agency_id, name, document_type) VALUES
('00000000-0000-0000-0000-000000000001', 'Default Proposal', 'proposal'),
('00000000-0000-0000-0000-000000000001', 'Default Quotation', 'quotation');
