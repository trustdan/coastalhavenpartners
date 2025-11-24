-- Add enhanced profile fields to recruiter_profiles
ALTER TABLE public.recruiter_profiles
ADD COLUMN bio TEXT,
ADD COLUMN specialties TEXT[], -- ['Investment Banking', 'Private Equity', 'Venture Capital']
ADD COLUMN locations TEXT[], -- ['New York', 'San Francisco', 'Chicago']
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN years_experience INTEGER,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN company_website TEXT;

-- Add master visibility toggles
ALTER TABLE public.recruiter_profiles
ADD COLUMN is_visible_to_candidates BOOLEAN DEFAULT FALSE,
ADD COLUMN is_visible_to_recruiters BOOLEAN DEFAULT FALSE;

-- Add granular field-level visibility controls using JSONB
-- This allows fine-grained control over which fields are visible to each audience
ALTER TABLE public.recruiter_profiles
ADD COLUMN visible_fields_to_candidates JSONB DEFAULT '{
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
}'::jsonb,
ADD COLUMN visible_fields_to_recruiters JSONB DEFAULT '{
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

-- Create index on visibility flags for efficient queries
CREATE INDEX idx_recruiter_visible_to_candidates ON public.recruiter_profiles(is_visible_to_candidates) WHERE is_visible_to_candidates = TRUE;
CREATE INDEX idx_recruiter_visible_to_recruiters ON public.recruiter_profiles(is_visible_to_recruiters) WHERE is_visible_to_recruiters = TRUE;

-- Add indexes for searching
CREATE INDEX idx_recruiter_specialties ON public.recruiter_profiles USING GIN(specialties);
CREATE INDEX idx_recruiter_locations ON public.recruiter_profiles USING GIN(locations);

-- =============================================
-- RLS POLICIES FOR RECRUITER VISIBILITY
-- =============================================

-- Candidates can view recruiters who have made their profiles visible to candidates
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
