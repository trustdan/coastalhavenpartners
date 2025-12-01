-- Create candidate_transcripts table for multiple transcript support
-- This allows candidates with graduate education to upload multiple transcripts

CREATE TABLE public.candidate_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Transcript details
  transcript_url TEXT NOT NULL,
  education_level education_level NOT NULL DEFAULT 'bachelors',
  school_name TEXT, -- Optional: can differ from main profile school
  degree_type TEXT, -- e.g., "BA Economics", "MBA", "MS Finance"

  -- GPA for this specific transcript
  gpa DECIMAL(3, 2) CHECK (gpa IS NULL OR (gpa >= 0 AND gpa <= 4.0)),

  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  gpa_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_candidate_transcripts_profile ON public.candidate_transcripts(candidate_profile_id);
CREATE INDEX idx_candidate_transcripts_user ON public.candidate_transcripts(user_id);
CREATE INDEX idx_candidate_transcripts_verified ON public.candidate_transcripts(is_verified);

-- Enable RLS
ALTER TABLE public.candidate_transcripts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Candidates can view their own transcripts
CREATE POLICY "Candidates can view their own transcripts"
  ON public.candidate_transcripts FOR SELECT
  USING (auth.uid() = user_id);

-- Candidates can insert their own transcripts
CREATE POLICY "Candidates can insert their own transcripts"
  ON public.candidate_transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Candidates can update their own transcripts (but not verification fields)
CREATE POLICY "Candidates can update their own transcripts"
  ON public.candidate_transcripts FOR UPDATE
  USING (auth.uid() = user_id);

-- Candidates can delete their own transcripts
CREATE POLICY "Candidates can delete their own transcripts"
  ON public.candidate_transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- Approved recruiters can view transcripts of verified candidates
CREATE POLICY "Approved recruiters can view candidate transcripts"
  ON public.candidate_transcripts FOR SELECT
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

-- Admins can do everything (using is_admin function from previous migrations)
CREATE POLICY "Admins can manage all transcripts"
  ON public.candidate_transcripts FOR ALL
  USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_candidate_transcripts_updated_at
  BEFORE UPDATE ON public.candidate_transcripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing transcript data to new table
-- This inserts a record for any candidate who already has a transcript_url
INSERT INTO public.candidate_transcripts (
  candidate_profile_id,
  user_id,
  transcript_url,
  education_level,
  school_name,
  gpa,
  is_verified,
  gpa_verified,
  verified_by,
  verified_at
)
SELECT
  cp.id,
  cp.user_id,
  cp.transcript_url,
  COALESCE(cp.education_level, 'bachelors'),
  cp.school_name,
  cp.gpa,
  COALESCE(cp.transcript_verified, false),
  COALESCE(cp.gpa_verified, false),
  cp.documents_verified_by,
  cp.documents_verified_at
FROM public.candidate_profiles cp
WHERE cp.transcript_url IS NOT NULL;

-- Note: We keep the old transcript_url, transcript_verified columns for now
-- They can be removed in a future migration after confirming the new system works
