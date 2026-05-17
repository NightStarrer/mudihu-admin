ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_section_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION auth_agency_id()
RETURNS UUID AS $$
  SELECT agency_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (agency_id = auth_agency_id() OR id = auth.uid());

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY agencies_select ON agencies FOR SELECT
  USING (id = auth_agency_id());

CREATE POLICY branding_select ON branding_settings FOR SELECT
  USING (agency_id = auth_agency_id());

CREATE POLICY branding_update ON branding_settings FOR UPDATE
  USING (agency_id = auth_agency_id() AND auth_user_role() = 'admin');

CREATE POLICY clients_all ON clients FOR ALL
  USING (agency_id = auth_agency_id())
  WITH CHECK (agency_id = auth_agency_id());

CREATE POLICY client_notes_all ON client_notes FOR ALL
  USING (agency_id = auth_agency_id())
  WITH CHECK (agency_id = auth_agency_id());

CREATE POLICY proposals_all ON proposals FOR ALL
  USING (agency_id = auth_agency_id())
  WITH CHECK (agency_id = auth_agency_id());

CREATE POLICY phases_all ON proposal_phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_id AND p.agency_id = auth_agency_id()
    )
  );

CREATE POLICY groups_all ON proposal_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM proposal_phases ph
      JOIN proposals p ON p.id = ph.proposal_id
      WHERE ph.id = phase_id AND p.agency_id = auth_agency_id()
    )
  );

CREATE POLICY section_library_select ON proposal_section_library FOR SELECT
  USING (agency_id = auth_agency_id());

CREATE POLICY section_library_admin ON proposal_section_library FOR ALL
  USING (agency_id = auth_agency_id() AND auth_user_role() = 'admin')
  WITH CHECK (agency_id = auth_agency_id() AND auth_user_role() = 'admin');

CREATE POLICY pdf_templates_select ON pdf_templates FOR SELECT
  USING (agency_id = auth_agency_id());

CREATE POLICY pdf_documents_all ON pdf_documents FOR ALL
  USING (agency_id = auth_agency_id())
  WITH CHECK (agency_id = auth_agency_id());
