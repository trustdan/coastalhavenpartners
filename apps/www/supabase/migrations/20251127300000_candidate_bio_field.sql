-- Add bio field to candidate profiles
-- This is the candidate's own summary/about me (240 char limit)
-- Distinct from 'notes' which is for recruiter notes

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'bio') THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN bio TEXT;
    -- Add constraint for 240 character limit
    ALTER TABLE public.candidate_profiles ADD CONSTRAINT bio_max_length CHECK (char_length(bio) <= 240);
  END IF;
END $$;

COMMENT ON COLUMN public.candidate_profiles.bio IS 'Candidate bio/summary (max 240 characters)';
COMMENT ON COLUMN public.candidate_profiles.notes IS 'Internal recruiter notes about the candidate';
COMMENT ON COLUMN public.candidate_profiles.tags IS 'Candidate skills and interests tags';
