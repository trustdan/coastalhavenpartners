-- Add enhanced profile fields to recruiter_profiles (idempotent)
DO $$
BEGIN
  -- Add columns only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN bio TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'specialties') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN specialties TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'locations') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN locations TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'profile_photo_url') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN profile_photo_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'years_experience') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN years_experience INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'linkedin_url') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN linkedin_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'company_website') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN company_website TEXT;
  END IF;

  -- Add master visibility toggles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'is_visible_to_candidates') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN is_visible_to_candidates BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'is_visible_to_recruiters') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN is_visible_to_recruiters BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add granular field-level visibility controls
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'visible_fields_to_candidates') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN visible_fields_to_candidates JSONB DEFAULT '{
      "full_name": true,
      "email": false,
      "phone": false,
      "firm_name": true,
      "firm_type": true,
      "job_title": true,
      "bio": true,
      "specialties": true,
      "locations": true,
      "linkedin_url": false,
      "years_experience": true,
      "company_website": true,
      "profile_photo_url": true
    }'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'visible_fields_to_recruiters') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN visible_fields_to_recruiters JSONB DEFAULT '{
      "full_name": true,
      "email": true,
      "phone": true,
      "firm_name": true,
      "firm_type": true,
      "job_title": true,
      "bio": true,
      "specialties": true,
      "locations": true,
      "linkedin_url": true,
      "years_experience": true,
      "company_website": true,
      "profile_photo_url": true
    }'::jsonb;
  END IF;
END $$;

-- Create index on visibility flags for efficient queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_recruiter_visible_to_candidates ON public.recruiter_profiles(is_visible_to_candidates) WHERE is_visible_to_candidates = TRUE;
CREATE INDEX IF NOT EXISTS idx_recruiter_visible_to_recruiters ON public.recruiter_profiles(is_visible_to_recruiters) WHERE is_visible_to_recruiters = TRUE;

-- Add indexes for searching (idempotent)
CREATE INDEX IF NOT EXISTS idx_recruiter_specialties ON public.recruiter_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_recruiter_locations ON public.recruiter_profiles USING GIN(locations);

-- =============================================
-- RLS POLICIES FOR RECRUITER VISIBILITY
-- =============================================

-- Candidates can view recruiters who have made their profiles visible to candidates
DROP POLICY IF EXISTS "Candidates can view public recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Candidates can view public recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  USING (
    is_visible_to_candidates = TRUE
    AND is_approved = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'candidate'
    )
  );

-- Recruiters can view other recruiters who have made their profiles visible to recruiters
DROP POLICY IF EXISTS "Recruiters can view other public recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "Recruiters can view other public recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  USING (
    is_visible_to_recruiters = TRUE
    AND is_approved = TRUE
    AND auth.uid() != user_id -- Not their own profile (handled by existing policy)
    AND EXISTS (
      SELECT 1 FROM public.recruiter_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
  );

-- =============================================
-- HELPER FUNCTIONS FOR FIELD VISIBILITY
-- =============================================

-- Function to filter recruiter profile fields based on viewer role
-- This can be called from the application layer to enforce field-level visibility
CREATE OR REPLACE FUNCTION public.get_visible_recruiter_fields(
  recruiter_profile_id UUID,
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
BEGIN
  -- Get the visibility configuration based on viewer role
  IF viewer_role = 'candidate' THEN
    SELECT visible_fields_to_candidates INTO visibility_config
    FROM public.recruiter_profiles
    WHERE id = recruiter_profile_id;
  ELSIF viewer_role = 'recruiter' THEN
    SELECT visible_fields_to_recruiters INTO visibility_config
    FROM public.recruiter_profiles
    WHERE id = recruiter_profile_id;
  ELSE
    -- Admin or owner can see everything
    SELECT row_to_json(recruiter_profiles.*) INTO profile_data
    FROM public.recruiter_profiles
    WHERE id = recruiter_profile_id;
    RETURN profile_data;
  END IF;

  -- Get full profile data
  SELECT row_to_json(rp.*) INTO profile_data
  FROM public.recruiter_profiles rp
  WHERE id = recruiter_profile_id;

  -- Filter fields based on visibility config
  FOR field_name IN SELECT jsonb_object_keys(visibility_config)
  LOOP
    IF (visibility_config->>field_name)::boolean = TRUE THEN
      filtered_data := filtered_data || jsonb_build_object(field_name, profile_data->field_name);
    END IF;
  END LOOP;

  -- Always include id and created_at for reference
  filtered_data := filtered_data || jsonb_build_object(
    'id', profile_data->'id',
    'created_at', profile_data->'created_at'
  );

  RETURN filtered_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_visible_recruiter_fields(UUID, user_role) TO authenticated;

COMMENT ON FUNCTION public.get_visible_recruiter_fields IS
'Returns recruiter profile fields filtered by visibility settings for the given viewer role';
