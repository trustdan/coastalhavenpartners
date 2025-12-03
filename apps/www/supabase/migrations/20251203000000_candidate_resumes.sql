-- Create candidate_resumes table for multiple resume support
-- This allows candidates to upload role-specific resumes (e.g., IB resume, PE resume, Consulting resume)

CREATE TABLE public.candidate_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Resume details
  resume_url TEXT NOT NULL,
  label TEXT NOT NULL, -- e.g., "Investment Banking", "Private Equity", "Consulting", "General"
  description TEXT, -- Optional longer description of what this resume highlights

  -- Flags
  is_default BOOLEAN DEFAULT FALSE, -- Mark as the primary/default resume
  is_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_candidate_resumes_profile ON public.candidate_resumes(candidate_profile_id);
CREATE INDEX idx_candidate_resumes_user ON public.candidate_resumes(user_id);
CREATE INDEX idx_candidate_resumes_default ON public.candidate_resumes(candidate_profile_id, is_default) WHERE is_default = TRUE;

-- Enable RLS
ALTER TABLE public.candidate_resumes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Candidates can view their own resumes
CREATE POLICY "Candidates can view their own resumes"
  ON public.candidate_resumes FOR SELECT
  USING (auth.uid() = user_id);

-- Candidates can insert their own resumes
CREATE POLICY "Candidates can insert their own resumes"
  ON public.candidate_resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Candidates can update their own resumes (but not verification fields)
CREATE POLICY "Candidates can update their own resumes"
  ON public.candidate_resumes FOR UPDATE
  USING (auth.uid() = user_id);

-- Candidates can delete their own resumes
CREATE POLICY "Candidates can delete their own resumes"
  ON public.candidate_resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Approved recruiters can view resumes of verified candidates
CREATE POLICY "Approved recruiters can view candidate resumes"
  ON public.candidate_resumes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.recruiter_profiles rp
      WHERE rp.user_id = auth.uid() AND rp.is_approved = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM public.candidate_profiles cp
      WHERE cp.id = candidate_profile_id
      AND cp.status = 'verified'
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all resumes"
  ON public.candidate_resumes FOR ALL
  USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_candidate_resumes_updated_at
  BEFORE UPDATE ON public.candidate_resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing resume data to new table
-- This inserts a record for any candidate who already has a resume_url
INSERT INTO public.candidate_resumes (
  candidate_profile_id,
  user_id,
  resume_url,
  label,
  is_default,
  is_verified,
  verified_by,
  verified_at
)
SELECT
  cp.id,
  cp.user_id,
  cp.resume_url,
  'General', -- Default label for migrated resumes
  TRUE, -- Mark migrated resumes as default
  COALESCE(cp.resume_verified, false),
  cp.documents_verified_by,
  cp.documents_verified_at
FROM public.candidate_profiles cp
WHERE cp.resume_url IS NOT NULL;

-- Note: We keep the old resume_url, resume_verified columns for now
-- They can be removed in a future migration after confirming the new system works
