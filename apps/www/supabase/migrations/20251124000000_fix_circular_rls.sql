-- Fix circular dependency in RLS policies by using a helper function
-- The admin policies were creating infinite loops by querying profiles table within profiles RLS

-- Create helper function to check if current user is admin
-- This reads from auth.users metadata directly, avoiding circular table queries
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create helper function to get current user role
-- This is more efficient than joining profiles table in RLS policies
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (raw_user_meta_data->>'role')::user_role FROM auth.users WHERE id = auth.uid()),
    'candidate'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic circular policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all candidate profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Admins can update all candidate profiles" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Admins can view all recruiter profiles" ON public.recruiter_profiles;
DROP POLICY IF EXISTS "Admins can update all recruiter profiles" ON public.recruiter_profiles;

-- Recreate policies using the helper function (no circular dependency)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all candidate profiles"
  ON public.candidate_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all candidate profiles"
  ON public.candidate_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can view all recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all recruiter profiles"
  ON public.recruiter_profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin());
