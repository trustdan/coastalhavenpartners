-- =============================================
-- COASTAL HAVEN CAPITAL APPLICATIONS
-- =============================================
-- Applications from candidates to Coastal Haven Capital (and future partner firms)

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE application_status AS ENUM (
  'pending',
  'reviewing',
  'interviewed',
  'accepted',
  'rejected',
  'withdrawn'
);

CREATE TYPE application_target AS ENUM (
  'capital',    -- Coastal Haven Capital
  'firm'        -- Partner firm (future use)
);

-- =============================================
-- TABLES
-- =============================================

-- Applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who applied (reference candidate_profiles, not profiles)
  candidate_profile_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,

  -- Where they applied
  target_type application_target NOT NULL DEFAULT 'capital',
  firm_id UUID,  -- null for capital, would reference firms table for partner firms

  -- Snapshot of candidate data at time of application
  snapshot JSONB NOT NULL,

  -- Application-specific questions
  cover_letter TEXT NOT NULL,           -- "Why are you interested in Coastal Haven Capital?"
  outreach_approach TEXT NOT NULL,      -- "How would you reach out to business owners..."

  -- Status tracking
  status application_status NOT NULL DEFAULT 'pending',

  -- Admin notes (internal only)
  internal_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate applications to same target
  UNIQUE(candidate_profile_id, target_type, firm_id)
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_applications_candidate ON public.applications(candidate_profile_id);
CREATE INDEX idx_applications_target ON public.applications(target_type, firm_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_applied_at ON public.applications(applied_at DESC);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own applications
CREATE POLICY "Candidates can view own applications"
  ON public.applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = applications.candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  );

-- Candidates can create applications (if their profile is verified)
CREATE POLICY "Candidates can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = candidate_profile_id
      AND cp.user_id = auth.uid()
      AND cp.status IN ('verified', 'active')
    )
  );

-- Candidates can withdraw their own applications
CREATE POLICY "Candidates can withdraw applications"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = applications.candidate_profile_id
      AND cp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Can only change status to 'withdrawn'
    status = 'withdrawn'
  );

-- Admins can view all Capital applications
CREATE POLICY "Admins can view Capital applications"
  ON public.applications FOR SELECT
  USING (
    target_type = 'capital'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can update Capital applications (status, notes, etc.)
CREATE POLICY "Admins can update Capital applications"
  ON public.applications FOR UPDATE
  USING (
    target_type = 'capital'
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create an application with profile snapshot
CREATE OR REPLACE FUNCTION public.create_capital_application(
  p_cover_letter TEXT,
  p_outreach_approach TEXT
)
RETURNS UUID AS $$
DECLARE
  v_candidate_profile candidate_profiles%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_application_id UUID;
BEGIN
  -- Get candidate profile
  SELECT cp.* INTO v_candidate_profile
  FROM public.candidate_profiles cp
  WHERE cp.user_id = auth.uid();

  IF v_candidate_profile.id IS NULL THEN
    RAISE EXCEPTION 'Candidate profile not found';
  END IF;

  -- Check profile status
  IF v_candidate_profile.status NOT IN ('verified', 'active') THEN
    RAISE EXCEPTION 'Profile must be verified to apply';
  END IF;

  -- Get base profile
  SELECT p.* INTO v_profile
  FROM public.profiles p
  WHERE p.id = auth.uid();

  -- Create application with snapshot
  INSERT INTO public.applications (
    candidate_profile_id,
    target_type,
    firm_id,
    snapshot,
    cover_letter,
    outreach_approach,
    status
  ) VALUES (
    v_candidate_profile.id,
    'capital',
    NULL,
    jsonb_build_object(
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'linkedin_url', v_profile.linkedin_url,
      'school_name', v_candidate_profile.school_name,
      'major', v_candidate_profile.major,
      'graduation_year', v_candidate_profile.graduation_year,
      'gpa', v_candidate_profile.gpa,
      'resume_url', v_candidate_profile.resume_url,
      'transcript_url', v_candidate_profile.transcript_url,
      'scheduling_url', v_candidate_profile.scheduling_url,
      'bio', v_candidate_profile.bio,
      'target_roles', v_candidate_profile.target_roles,
      'preferred_locations', v_candidate_profile.preferred_locations
    ),
    p_cover_letter,
    p_outreach_approach,
    'pending'
  )
  RETURNING id INTO v_application_id;

  RETURN v_application_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_capital_application TO authenticated;
