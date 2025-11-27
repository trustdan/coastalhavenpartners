-- Add visibility controls for candidate profiles (idempotent)
-- Allows candidates to control what information recruiters and career services can see

DO $$
BEGIN
  -- Add visibility fields for recruiters
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'visible_fields_to_recruiters') THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN visible_fields_to_recruiters JSONB DEFAULT '{
      "linkedin_url": true,
      "email": false,
      "resume": true,
      "transcript": false
    }'::jsonb;
  END IF;

  -- Add visibility fields for schools/career services
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'visible_fields_to_schools') THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN visible_fields_to_schools JSONB DEFAULT '{
      "linkedin_url": true,
      "email": true,
      "resume": true,
      "transcript": true
    }'::jsonb;
  END IF;
END $$;

-- =============================================
-- HELPER FUNCTION FOR FIELD VISIBILITY
-- =============================================

-- Function to filter candidate profile fields based on viewer role
CREATE OR REPLACE FUNCTION public.get_visible_candidate_fields(
  candidate_profile_id UUID,
  viewer_role user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  visibility_config JSONB;
  profile_data JSONB;
  filtered_data JSONB := '{}'::jsonb;
  field_name TEXT;
  candidate_user_id UUID;
  viewer_user_id UUID;
  linkedin_url_value TEXT;
  email_value TEXT;
BEGIN
  viewer_user_id := auth.uid();

  -- Get the candidate's user_id
  SELECT user_id INTO candidate_user_id
  FROM public.candidate_profiles
  WHERE id = candidate_profile_id;

  -- If the viewer is the candidate themselves or an admin, show everything
  IF viewer_user_id = candidate_user_id OR viewer_role = 'admin' THEN
    SELECT row_to_json(cp.*) INTO profile_data
    FROM public.candidate_profiles cp
    WHERE id = candidate_profile_id;
    RETURN profile_data;
  END IF;

  -- Get the visibility configuration based on viewer role
  IF viewer_role = 'recruiter' THEN
    SELECT visible_fields_to_recruiters INTO visibility_config
    FROM public.candidate_profiles
    WHERE id = candidate_profile_id;
  ELSIF viewer_role = 'school_admin' THEN
    SELECT visible_fields_to_schools INTO visibility_config
    FROM public.candidate_profiles
    WHERE id = candidate_profile_id;
  ELSE
    -- Unknown role - return minimal data
    SELECT jsonb_build_object(
      'id', id,
      'school_name', school_name,
      'graduation_year', graduation_year,
      'major', major,
      'gpa', gpa
    ) INTO filtered_data
    FROM public.candidate_profiles
    WHERE id = candidate_profile_id;
    RETURN filtered_data;
  END IF;

  -- Start with always-visible fields (basic profile info)
  SELECT jsonb_build_object(
    'id', cp.id,
    'user_id', cp.user_id,
    'school_name', cp.school_name,
    'graduation_year', cp.graduation_year,
    'major', cp.major,
    'gpa', cp.gpa,
    'education_level', cp.education_level,
    'target_roles', cp.target_roles,
    'preferred_locations', cp.preferred_locations,
    'status', cp.status,
    'created_at', cp.created_at
  ) INTO filtered_data
  FROM public.candidate_profiles cp
  WHERE id = candidate_profile_id;

  -- Get linked profile data (for email and linkedin)
  SELECT p.linkedin_url, p.email INTO linkedin_url_value, email_value
  FROM public.profiles p
  JOIN public.candidate_profiles cp ON cp.user_id = p.id
  WHERE cp.id = candidate_profile_id;

  -- Add conditional fields based on visibility settings
  IF visibility_config IS NOT NULL THEN
    -- LinkedIn URL (from profiles table)
    IF (visibility_config->>'linkedin_url')::boolean = TRUE THEN
      filtered_data := filtered_data || jsonb_build_object('linkedin_url', linkedin_url_value);
    END IF;

    -- Email (from profiles table)
    IF (visibility_config->>'email')::boolean = TRUE THEN
      filtered_data := filtered_data || jsonb_build_object('email', email_value);
    END IF;

    -- Resume URL
    IF (visibility_config->>'resume')::boolean = TRUE THEN
      SELECT jsonb_build_object('resume_url', resume_url) INTO profile_data
      FROM public.candidate_profiles
      WHERE id = candidate_profile_id;
      filtered_data := filtered_data || profile_data;
    END IF;

    -- Transcript URL
    IF (visibility_config->>'transcript')::boolean = TRUE THEN
      SELECT jsonb_build_object('transcript_url', transcript_url) INTO profile_data
      FROM public.candidate_profiles
      WHERE id = candidate_profile_id;
      filtered_data := filtered_data || profile_data;
    END IF;
  END IF;

  RETURN filtered_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_visible_candidate_fields(UUID, user_role) TO authenticated;

COMMENT ON FUNCTION public.get_visible_candidate_fields IS
'Returns candidate profile fields filtered by visibility settings for the given viewer role';
