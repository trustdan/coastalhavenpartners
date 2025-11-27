-- Add scheduling URL field to candidate profiles
-- Allows candidates to share their Calendly/Cal.com/other scheduling link

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'scheduling_url') THEN
    ALTER TABLE public.candidate_profiles ADD COLUMN scheduling_url TEXT;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.candidate_profiles.scheduling_url IS 'URL to candidate scheduling tool (Calendly, Cal.com, etc.)';
