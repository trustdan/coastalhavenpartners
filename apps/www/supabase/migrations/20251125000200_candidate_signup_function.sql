-- Create a database function to handle candidate profile creation
-- This ensures the profile is created with proper permissions
CREATE OR REPLACE FUNCTION public.create_candidate_profile(
  p_user_id UUID,
  p_school_name TEXT,
  p_major TEXT,
  p_gpa DECIMAL,
  p_graduation_year INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  -- Insert candidate profile
  INSERT INTO public.candidate_profiles (
    user_id,
    school_name,
    major,
    gpa,
    graduation_year,
    status
  )
  VALUES (
    p_user_id,
    p_school_name,
    p_major,
    p_gpa,
    p_graduation_year,
    'pending_verification'
  )
  RETURNING id INTO v_profile_id;

  RETURN v_profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_candidate_profile TO authenticated;
