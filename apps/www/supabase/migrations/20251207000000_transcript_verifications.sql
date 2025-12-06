-- Migration: Auto transcript GPA verification system
-- Uses Google Document AI for OCR and Claude for GPA extraction

-- Create transcript_verifications table to store extraction results
CREATE TABLE public.transcript_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_profile_id UUID NOT NULL REFERENCES public.candidate_profiles(id) ON DELETE CASCADE,
  transcript_id UUID REFERENCES public.candidate_transcripts(id) ON DELETE SET NULL,

  -- Extraction results
  extracted_text TEXT,
  extracted_gpa NUMERIC(3,2),
  extracted_gpa_scale TEXT, -- e.g., "4.0", "5.0", "100"
  extraction_confidence TEXT CHECK (extraction_confidence IN ('high', 'medium', 'low')),
  extraction_reasoning TEXT, -- Claude's reasoning for the extraction

  -- Comparison
  entered_gpa NUMERIC(3,2),
  gpa_match BOOLEAN,
  gpa_difference NUMERIC(3,2),

  -- Verification status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'auto_verified', 'flagged', 'manually_verified', 'rejected', 'error')),

  -- Review info
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Error handling
  error_message TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one verification per transcript
  UNIQUE(transcript_id)
);

-- Indexes for admin queue and queries
CREATE INDEX idx_transcript_verifications_status ON public.transcript_verifications(status);
CREATE INDEX idx_transcript_verifications_candidate ON public.transcript_verifications(candidate_profile_id);
CREATE INDEX idx_transcript_verifications_created ON public.transcript_verifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.transcript_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can view and modify all verifications
CREATE POLICY "Admins can manage transcript verifications"
  ON public.transcript_verifications FOR ALL
  USING (is_admin());

-- Candidates can view their own verification status (limited fields via select query)
CREATE POLICY "Candidates can view own verification status"
  ON public.transcript_verifications FOR SELECT
  USING (
    candidate_profile_id IN (
      SELECT id FROM public.candidate_profiles WHERE user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_transcript_verifications_updated_at
  BEFORE UPDATE ON public.transcript_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add gpa_verification_status to candidate_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'candidate_profiles'
    AND column_name = 'gpa_verification_status'
  ) THEN
    ALTER TABLE public.candidate_profiles
    ADD COLUMN gpa_verification_status TEXT
    DEFAULT 'pending'
    CHECK (gpa_verification_status IN ('pending', 'verified', 'flagged', 'rejected'));
  END IF;
END $$;

-- Create index for gpa_verification_status
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_gpa_verification_status
  ON public.candidate_profiles(gpa_verification_status);

-- Comment explaining the system
COMMENT ON TABLE public.transcript_verifications IS 'Stores automated GPA extraction and verification results from uploaded transcripts using Google Document AI and Claude';
