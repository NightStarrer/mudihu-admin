-- Storage buckets (run in Supabase SQL editor if storage API unavailable)

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('branding-logos', 'branding-logos', true),
  ('pdf-exports', 'pdf-exports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY branding_logos_public_read ON storage.objects
  FOR SELECT USING (bucket_id = 'branding-logos');

CREATE POLICY branding_logos_admin_upload ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding-logos'
    AND auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND agency_id = auth_agency_id()
    )
  );

CREATE POLICY branding_logos_admin_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding-logos'
    AND auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY pdf_exports_agency ON storage.objects
  FOR ALL USING (
    bucket_id = 'pdf-exports'
    AND auth.uid() IN (SELECT id FROM profiles WHERE agency_id = auth_agency_id())
  );
