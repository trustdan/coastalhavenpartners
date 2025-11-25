-- Add school_admin to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'school_admin';

-- =============================================
-- SCHOOL PROFILES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.school_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- School Details
  school_name TEXT NOT NULL,
  school_domain TEXT, -- e.g., 'harvard.edu' for email verification
  department_name TEXT DEFAULT 'Career Services',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,

  -- Access Control
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add trigger for updated_at (idempotent)
DROP TRIGGER IF EXISTS update_school_profiles_updated_at ON public.school_profiles;
CREATE TRIGGER update_school_profiles_updated_at BEFORE UPDATE ON public.school_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index on school_name for lookups (idempotent)
CREATE INDEX IF NOT EXISTS idx_school_profiles_school_name ON public.school_profiles(school_name);
CREATE INDEX IF NOT EXISTS idx_school_profiles_approved ON public.school_profiles(is_approved) WHERE is_approved = TRUE;

-- =============================================
-- ADD SCHOOL VISIBILITY TO RECRUITER PROFILES
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'is_visible_to_schools') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN is_visible_to_schools BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recruiter_profiles' AND column_name = 'visible_fields_to_schools') THEN
    ALTER TABLE public.recruiter_profiles ADD COLUMN visible_fields_to_schools JSONB DEFAULT '{
      "full_name": true,
      "email": true,
      "phone": false,
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

-- Create index for school visibility queries (idempotent)
CREATE INDEX IF NOT EXISTS idx_recruiter_visible_to_schools ON public.recruiter_profiles(is_visible_to_schools) WHERE is_visible_to_schools = TRUE;

-- =============================================
-- RLS POLICIES FOR SCHOOL PROFILES
-- =============================================

-- Enable RLS on school_profiles
ALTER TABLE public.school_profiles ENABLE ROW LEVEL SECURITY;

-- School admins can view their own profile
DROP POLICY IF EXISTS "School admins can view their own profile" ON public.school_profiles;
CREATE POLICY "School admins can view their own profile"
  ON public.school_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- School admins can update their own profile
DROP POLICY IF EXISTS "School admins can update their own profile" ON public.school_profiles;
CREATE POLICY "School admins can update their own profile"
  ON public.school_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR SCHOOL ACCESS TO CANDIDATES
-- =============================================

-- School admins can view candidates from their school
DROP POLICY IF EXISTS "School admins can view their school's candidates" ON public.candidate_profiles;
CREATE POLICY "School admins can view their school's candidates"
  ON public.candidate_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.school_profiles sp
      WHERE sp.user_id = auth.uid()
        AND sp.is_approved = TRUE
        AND sp.school_name = candidate_profiles.school_name
    )
  );

-- =============================================
-- RLS POLICIES FOR SCHOOL ACCESS TO RECRUITERS
-- =============================================

-- School admins can view recruiters who have made their profiles visible to schools
DROP POLICY IF EXISTS "School admins can view public recruiter profiles" ON public.recruiter_profiles;
CREATE POLICY "School admins can view public recruiter profiles"
  ON public.recruiter_profiles FOR SELECT
  USING (
    is_visible_to_schools = TRUE
    AND is_approved = TRUE
    AND EXISTS (
      SELECT 1 FROM public.school_profiles
      WHERE user_id = auth.uid() AND is_approved = TRUE
    )
  );

-- =============================================
-- ANALYTICS FOR SCHOOL ADMINS
-- =============================================

-- School admins can view analytics events for their students
DROP POLICY IF EXISTS "School admins can view their students' analytics" ON public.analytics_events;
CREATE POLICY "School admins can view their students' analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.school_profiles sp
      JOIN public.candidate_profiles cp ON cp.school_name = sp.school_name
      WHERE sp.user_id = auth.uid()
        AND sp.is_approved = TRUE
        AND cp.user_id = analytics_events.target_id
    )
  );

-- =============================================
-- HELPER FUNCTION FOR SCHOOL MATCHING
-- =============================================

-- Function to get all candidates for a school admin's school
CREATE OR REPLACE FUNCTION public.get_school_candidates(school_admin_id UUID)
RETURNS TABLE (
  candidate_id UUID,
  full_name TEXT,
  email TEXT,
  school_name TEXT,
  major TEXT,
  gpa DECIMAL,
  graduation_year INTEGER,
  status candidate_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_school_name TEXT;
BEGIN
  -- Get the school admin's school name
  SELECT sp.school_name INTO admin_school_name
  FROM public.school_profiles sp
  WHERE sp.user_id = school_admin_id AND sp.is_approved = TRUE;

  -- If no school found or not approved, return empty
  IF admin_school_name IS NULL THEN
    RETURN;
  END IF;

  -- Return candidates from the same school
  RETURN QUERY
  SELECT
    cp.id,
    p.full_name,
    p.email,
    cp.school_name,
    cp.major,
    cp.gpa,
    cp.graduation_year,
    cp.status
  FROM public.candidate_profiles cp
  JOIN public.profiles p ON p.id = cp.user_id
  WHERE cp.school_name = admin_school_name;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_school_candidates(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_school_candidates IS
'Returns all candidates from the school admin''s school';

-- =============================================
-- INSERT POLICY FOR SCHOOL PROFILES
-- =============================================

-- Allow profile creation during signup (will be restricted by application logic)
DROP POLICY IF EXISTS "Users can create their own school profile" ON public.school_profiles;
CREATE POLICY "Users can create their own school profile"
  ON public.school_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
