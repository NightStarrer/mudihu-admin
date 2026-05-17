-- Fix: "Database error creating new user"
-- The signup trigger inserts into profiles, but RLS had no INSERT policy.

-- 1) Harden the trigger (search_path + clear error if seed missing)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_agency_id UUID;
BEGIN
  SELECT id INTO default_agency_id FROM public.agencies LIMIT 1;

  IF default_agency_id IS NULL THEN
    RAISE EXCEPTION 'No agency row found. Run migration 001 seed (agencies insert) first.';
  END IF;

  INSERT INTO public.profiles (id, agency_id, role, full_name)
  VALUES (
    NEW.id,
    default_agency_id,
    'employee',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2) Allow profile row creation for new signups / dashboard user create
DROP POLICY IF EXISTS profiles_insert_signup ON profiles;

CREATE POLICY profiles_insert_signup ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());
