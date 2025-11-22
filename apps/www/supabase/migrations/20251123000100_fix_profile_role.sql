-- Ensure recruiter signups persist the correct role in public.profiles

-- Update the trigger function to capture role metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  metadata_role TEXT;
BEGIN
  metadata_role := COALESCE(NEW.raw_user_meta_data->>'role', 'candidate');

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    CASE
      WHEN metadata_role IN ('candidate', 'recruiter', 'admin')
        THEN metadata_role::user_role
      ELSE 'candidate'::user_role
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profile rows using the current auth.users metadata
UPDATE public.profiles AS p
SET role = (u.raw_user_meta_data->>'role')::user_role
FROM auth.users AS u
WHERE u.id = p.id
  AND (u.raw_user_meta_data->>'role') IN ('candidate', 'recruiter', 'admin')
  AND p.role <> (u.raw_user_meta_data->>'role')::user_role;

