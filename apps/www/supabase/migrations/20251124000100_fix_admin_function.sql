-- Fix is_admin() to check profiles table instead of auth metadata
-- SECURITY DEFINER allows it to bypass RLS without circular dependency

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check profiles table directly (SECURITY DEFINER bypasses RLS)
  RETURN COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Also fix current_user_role() to use profiles table
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
BEGIN
  -- Check profiles table directly (SECURITY DEFINER bypasses RLS)
  RETURN COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'candidate'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
