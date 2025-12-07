-- Migration: Auto resume verification system
-- Uses Claude vision to verify resumes are real documents for real people

-- Create resume_verifications table to store verification results
CREATE TABLE public.resume_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.candidate_resumes(id) ON DELETE SET NULL,

  -- Verification results
  is_valid_resume BOOLEAN, -- Does this appear to be a resume/CV?
  appears_authentic BOOLEAN, -- Does it appear to be for a real person?

  -- Fake detection details
  fake_indicators JSONB DEFAULT '[]', -- Array of detected fake indicators (placeholder names, phone numbers, etc.)

  -- Confidence and reasoning
  confidence NUMERIC(3,2), -- 0.00 to 1.00
  reasoning TEXT, -- Claude's reasoning for the decision

  -- Verification status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'auto_verified', 'flagged', 'manually_verified', 'rejected', 'error')),

  -- Review info (for manual review)
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Error handling
  error_message TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one verification per resume
  UNIQUE(resume_id)
);

-- Indexes for admin queue and queries
CREATE INDEX idx_resume_verifications_status ON public.resume_verifications(status);
CREATE INDEX idx_resume_verifications_candidate ON public.resume_verifications(candidate_profile_id);
CREATE INDEX idx_resume_verifications_created ON public.resume_verifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.resume_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can view and modify all verifications
CREATE POLICY "Admins can manage resume verifications"
  ON public.resume_verifications FOR ALL
  USING (is_admin());

-- Candidates can view their own verification status (limited fields via select query)
CREATE POLICY "Candidates can view own resume verification status"
  ON public.resume_verifications FOR SELECT
  USING (
    candidate_profile_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_resume_verifications_updated_at
  BEFORE UPDATE ON public.resume_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add resume_verification_status to candidate_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'candidate_profiles'
    AND column_name = 'resume_verification_status'
  ) THEN
    ALTER TABLE public.candidate_profiles
    ADD COLUMN resume_verification_status TEXT
    DEFAULT 'pending'
    CHECK (resume_verification_status IN ('pending', 'verified', 'flagged', 'rejected'));
  END IF;
END $$;

-- Create index for resume_verification_status
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_resume_verification_status
  ON public.candidate_profiles(resume_verification_status);

-- Comment explaining the system
COMMENT ON TABLE public.resume_verifications IS 'Stores automated resume verification results checking if documents appear to be real resumes for real people using Claude vision';
